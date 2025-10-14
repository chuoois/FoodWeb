// services/shop.service.js
const Shop = require("../models/shop.model");
const Food = require("../models/food.model");
const { getOSMMatrix } = require("../utils/osm");


// Lấy danh sách cửa hàng gần nhất dựa trên tọa độ lat, lng
const findNearbyShops = async (lat, lng, radius = 5000, limit = 20) => {
  // Query MongoDB theo đường chim bay ( 5km)
  // thêm limit để giới hạn số lượng shop cần xử lý.
  const shops = await Shop.find({
    gps: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius
      }
    },
    status: "ACTIVE"
  }).limit(limit * 2) // Lấy dư ra một chút để phòng trường hợp lọc bớt
    .lean();

  if (!shops.length) {
    return [];
  }

  //Gọi OSRM MỘT LẦN DUY NHẤT để lấy ma trận khoảng cách
  const matrixData = await getOSMMatrix({ lat, lng }, shops);

  if (!matrixData) {
    // Nếu OSRM lỗi, có thể trả về danh sách sắp xếp theo đường chim bay
    return shops.map(s => ({ ...s, distance: null, duration: null }));
  }

  //Gắn khoảng cách thực tế vào từng shop và lọc
  let shopsWithDistance = shops.map((shop, index) => {
    // Khoảng cách/thời gian của user đến shop[index] sẽ nằm ở
    // matrixData.distances[index + 1] và matrixData.durations[index + 1]
    // vì tọa độ 0 trong matrix là của user.
    return {
      ...shop,
      distance: matrixData.distances[index + 1], // mét
      duration: matrixData.durations[index + 1]  // giây
    };
  });

  //Lọc bỏ những shop có khoảng cách thực tế quá xa
  shopsWithDistance = shopsWithDistance.filter(shop => shop.distance !== null && shop.distance <= radius);

  //Sort theo khoảng cách thực tế
  shopsWithDistance.sort((a, b) => a.distance - b.distance);

  //Áp dụng phân trang cuối cùng
  return shopsWithDistance.slice(0, limit);
};




// Tìm kiếm quán và món ăn theo từ khóa, kết hợp tính toán khoảng cách thực tế
const searchByKeyword = async (keyword, location, options = {}) => {
  try {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    const { lat, lng } = location;
    const regex = new RegExp(keyword, 'i');

    // --- B1: Lấy danh sách ID quán có món khớp ---
    const shopIdsFromFoods = await Food.distinct('shop_id', { name: regex });
    const shopIdsAsObjectId = shopIdsFromFoods.map(id => new Types.ObjectId(id));

    // --- B2: Pipeline MongoDB Atlas Search ---
    const pipeline = [
      {
        $search: {
          index: 'default', // tên index của bạn trên Atlas Search
          compound: {
            must: [
              {
                near: {
                  path: 'gps',
                  origin: {
                    type: 'Point',
                    coordinates: [lng, lat],
                  },
                  pivot: 1000, // 1km
                },
              },
              {
                equals: {
                  path: 'status',
                  value: 'ACTIVE',
                },
              },
            ],
            should: [
              {
                text: {
                  query: keyword,
                  path: ['name', 'description'],
                },
              },
              {
                in: {
                  path: '_id',
                  value: shopIdsAsObjectId,
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
    ];

    const results = await Shop.aggregate(pipeline);

    const shops = results[0]?.paginatedResults || [];
    const totalResults = results[0]?.totalCount[0]?.count || 0;

    // --- B3: Nếu không có kết quả ---
    if (shops.length === 0) {
      return { shops: [], totalResults: 0, currentPage: page };
    }

    // --- B4: Gọi OSRM để lấy khoảng cách thật ---
    const matrixData = await getOSMMatrix({ lat, lng }, shops);

    const shopsWithRealDistance = shops.map((shop, index) => {
      const real_distance = matrixData?.distances?.[index + 1] || null;
      const duration = matrixData?.durations?.[index + 1] || null;
      return { ...shop, distance: real_distance, duration };
    });

    // --- B5: Sắp xếp theo khoảng cách ---
    shopsWithRealDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return {
      shops: shopsWithRealDistance,
      totalResults,
      currentPage: page,
    };
  } catch (error) {
    console.error('❌ Lỗi trong searchByKeyword:', error);
    return { shops: [], totalResults: 0, currentPage: options.page || 1, error: error.message };
  }
};


module.exports = { findNearbyShops, searchByKeyword };