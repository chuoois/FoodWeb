// goong.service.js
import api from "@/lib/axios";

// API Keys từ biến môi trường
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;
const GOONG_API_BASE_URL = "https://rsapi.goong.io";

// Lấy thông tin địa chỉ từ tọa độ (reverse geocoding)
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await api.get(`${GOONG_API_BASE_URL}/Geocode`, {
      params: {
        latlng: `${latitude},${longitude}`,
        api_key: GOONG_API_KEY,
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const result = response.data.results[0];
      const { compound, name, address_components } = result;

      const address = {
        street: name || address_components[0]?.long_name || "", // Use place name or first component as street
        ward: compound?.commune || "", // Use compound.commune for ward
        district: compound?.district || "", // Use compound.district
        city: compound?.province || "", // Use compound.province as city
        province: "Việt Nam", // Default to Việt Nam
      };

      // Fallback: Try to extract from address_components if compound is missing
      if (!compound) {
        address_components.forEach((component, index) => {
          if (index === 0 && !address.street) {
            address.street = component.long_name; // First component as street
          } else if (index === 1) {
            address.ward = component.long_name; // Second component as ward
          } else if (index === 2) {
            address.district = component.long_name; // Third component as district
          } else if (index === 3) {
            address.city = component.long_name; // Fourth component as city
          }
        });
      }

      return address;
    } else {
      throw new Error("Không tìm thấy địa chỉ phù hợp.");
    }
  } catch (error) {
    console.error("[Lỗi lấy địa chỉ từ tọa độ]", error);
    throw new Error("Không thể lấy thông tin địa chỉ từ Goong Maps API.");
  }
};

// Tìm kiếm địa chỉ dựa trên từ khóa (Place Autocomplete)
export const searchAddress = async (query) => {
  try {
    const response = await api.get(`${GOONG_API_BASE_URL}/Place/AutoComplete`, {
      params: {
        input: query,
        api_key: GOONG_API_KEY,
      },
    });

    if (response.data.status === "OK") {
      return response.data.predictions || [];
    } else {
      throw new Error("Không tìm thấy kết quả tìm kiếm.");
    }
  } catch (error) {
    console.error("[Lỗi tìm kiếm địa chỉ]", error);
    throw new Error("Không thể tìm kiếm địa chỉ từ Goong Maps API.");
  }
};