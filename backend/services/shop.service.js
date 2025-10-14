// services/shop.service.js
const Shop = require("../models/shop.model");
const Food = require("../models/food.model");
const { getOSMMatrix } = require("../utils/osm");
const { Types } = require('mongoose');

// Cache kiểm tra môi trường
let isAtlas = null;

const checkIsAtlas = async () => {
  if (isAtlas !== null) return isAtlas;
  
  try {
    await Shop.aggregate([
      { $search: { index: 'default', text: { query: 'test', path: 'name' } } },
      { $limit: 1 }
    ]);
    isAtlas = true;
    console.log('✅ MongoDB Atlas detected - using $search');
  } catch (error) {
    isAtlas = false;
    console.log('✅ MongoDB Local detected - using standard queries');
  }
  
  return isAtlas;
};

// Lấy danh sách cửa hàng gần nhất
const findNearbyShops = async (lat, lng, radius = 5000, limit = 20) => {
  const shops = await Shop.find({
    gps: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius
      }
    },
    status: "ACTIVE"
  }).limit(limit * 2)
    .lean();

  if (!shops.length) return [];

  const matrixData = await getOSMMatrix({ lat, lng }, shops);
  if (!matrixData) {
    return shops.map(s => ({ ...s, distance: null, duration: null }));
  }

  let shopsWithDistance = shops.map((shop, index) => ({
    ...shop,
    distance: matrixData.distances[index + 1],
    duration: matrixData.durations[index + 1]
  }));

  shopsWithDistance = shopsWithDistance
    .filter(shop => shop.distance !== null && shop.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  return shopsWithDistance.slice(0, limit);
};

// OPTIMIZED: Tìm kiếm với Atlas Search
const searchWithAtlas = async (keyword, location, options) => {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;
  const { lat, lng } = location;

  // Query Food và Shop SONG SONG để giảm thời gian chờ
  const [shopIdsFromFoods, searchResults] = await Promise.all([
    Food.distinct('shop_id', { name: new RegExp(keyword, 'i') }),
    Shop.aggregate([
      {
        $search: {
          index: 'default',
          compound: {
            must: [
              {
                near: {
                  path: 'gps',
                  origin: { type: 'Point', coordinates: [lng, lat] },
                  pivot: 1000,
                },
              },
              { equals: { path: 'status', value: 'ACTIVE' } },
            ],
            should: [
              {
                text: {
                  query: keyword,
                  path: ['name', 'description'],
                  fuzzy: { maxEdits: 1 }, // Thêm fuzzy search
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
      {
        $facet: {
          paginatedResults: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ])
  ]);

  let shops = searchResults[0]?.paginatedResults || [];
  const totalResults = searchResults[0]?.totalCount[0]?.count || 0;

  // Nếu có shop từ food, merge vào kết quả (không query lại)
  if (shopIdsFromFoods.length > 0) {
    const shopIds = new Set(shops.map(s => s._id.toString()));
    const missingShopIds = shopIdsFromFoods
      .filter(id => !shopIds.has(id.toString()))
      .slice(0, limit - shops.length);

    if (missingShopIds.length > 0) {
      const additionalShops = await Shop.find({
        _id: { $in: missingShopIds },
        status: 'ACTIVE'
      }).lean();
      shops = [...shops, ...additionalShops];
    }
  }

  return { shops, totalResults };
};

// OPTIMIZED: Tìm kiếm với MongoDB Local
const searchWithLocal = async (keyword, location, options) => {
  const { limit = 10, page = 1, radius = 10000 } = options;
  const skip = (page - 1) * limit;
  const { lat, lng } = location;
  const regex = new RegExp(keyword, 'i');

  // Lấy shop IDs từ Food trước (nhanh hơn)
  const shopIdsFromFoods = await Food.distinct('shop_id', { name: regex });

  // Tối ưu query: Chỉ search trong bán kính nhỏ trước
  const baseQuery = {
    status: "ACTIVE",
    gps: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius
      }
    }
  };

  // Nếu có shopIds từ foods, ưu tiên tìm những shop đó trước
  const orConditions = [
    { name: regex },
    { description: regex }
  ];

  if (shopIdsFromFoods.length > 0) {
    orConditions.push({ 
      _id: { $in: shopIdsFromFoods.map(id => new Types.ObjectId(id)) } 
    });
  }

  const query = { ...baseQuery, $or: orConditions };

  // Query song song để tăng tốc
  const [shops, totalResults] = await Promise.all([
    Shop.find(query)
      .skip(skip)
      .limit(limit * 2)
      .select('-__v') // Bỏ field không cần thiết
      .lean(),
    Shop.countDocuments({ 
      status: "ACTIVE", 
      $or: orConditions 
    })
  ]);

  return { shops, totalResults };
};

// OPTIMIZED: Main search function
const searchByKeyword = async (keyword, location, options = {}) => {
  try {
    // Validate input nhanh
    if (!keyword || !location?.lat || !location?.lng) {
      return { shops: [], totalResults: 0, currentPage: options.page || 1 };
    }

    const { limit = 10, page = 1 } = options;
    const { lat, lng } = location;

    // Kiểm tra môi trường (cached sau lần đầu)
    const useAtlas = await checkIsAtlas();

    // Gọi hàm search tương ứng
    const { shops, totalResults } = useAtlas
      ? await searchWithAtlas(keyword, location, options)
      : await searchWithLocal(keyword, location, options);

    if (shops.length === 0) {
      return { shops: [], totalResults: 0, currentPage: page };
    }

    // OPTIMIZATION: Chỉ gọi OSRM nếu có > 1 shop
    let finalShops = shops;

    if (shops.length > 1) {
      const matrixData = await getOSMMatrix({ lat, lng }, shops);

      if (matrixData) {
        finalShops = shops.map((shop, index) => ({
          ...shop,
          distance: matrixData.distances?.[index + 1] || null,
          duration: matrixData.durations?.[index + 1] || null
        }));

        // Sort theo khoảng cách thực
        finalShops.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }
    } else {
      // Chỉ 1 shop, không cần matrix
      const matrixData = await getOSMMatrix({ lat, lng }, shops);
      finalShops = [{
        ...shops[0],
        distance: matrixData?.distances?.[1] || null,
        duration: matrixData?.durations?.[1] || null
      }];
    }

    // Slice cuối cùng nếu dùng local (đã lấy limit * 2)
    const result = !useAtlas ? finalShops.slice(0, limit) : finalShops;

    return {
      shops: result,
      totalResults,
      currentPage: page,
    };
  } catch (error) {
    console.error('❌ Error in searchByKeyword:', error);
    return { 
      shops: [], 
      totalResults: 0, 
      currentPage: options.page || 1, 
      error: error.message 
    };
  }
};

module.exports = { findNearbyShops, searchByKeyword };