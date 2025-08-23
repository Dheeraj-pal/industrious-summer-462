import api from "./api";

const AdminService = {
  // Dashboard
  getDashboardStats: async (page = 1, limit = 10) => {
    return api.get(`/admin/dashboard?page=${page}&limit=${limit}`);
  },

  // Products
  getAllProducts: async (page = 1, limit = 10) => {
    return api.get(`/admin/products?page=${page}&limit=${limit}`);
  },

  getProductById: async (id) => {
    return api.get(`/admin/products/${id}`);
  },

  createProduct: async (productData) => {
    const formData = new FormData();

    // Add all product fields to formData
    Object.keys(productData).forEach((key) => {
      if (key !== "images") {
        formData.append(key, productData[key]);
      }
    });

    // Add images if they exist
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    return api.post("/admin/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateProduct: async (id, productData) => {
    return api.patch(`/admin/products/${id}`, productData);
  },

  updateProductImages: async (id, images) => {
    const formData = new FormData();

    // Add images if they exist
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    return api.patch(`/admin/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProduct: async (id) => {
    return api.delete(`/admin/products/${id}`);
  },

  // Categories
  getAllCategories: async (page = 1, limit = 10) => {
    return api.get(`/admin/categories?page=${page}&limit=${limit}`);
  },

  createCategory: async (categoryData) => {
    const formData = new FormData();

    // Add all category fields to formData
    Object.keys(categoryData).forEach((key) => {
      if (key !== "image") {
        formData.append(key, categoryData[key]);
      }
    });

    // Add image if it exists
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }

    return api.post("/admin/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateCategory: async (id, categoryData) => {
    const formData = new FormData();

    // Add all category fields to formData
    Object.keys(categoryData).forEach((key) => {
      if (key !== "image") {
        formData.append(key, categoryData[key]);
      }
    });

    // Add image if it exists
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }
    return api.patch(`/admin/categories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteCategory: async (id) => {
    return api.delete(`/admin/categories/${id}`);
  },

  // Home Sections
  getAllHomeSections: async (page = 1, limit = 10) => {
    return api.get(`/home-sections?page=${page}&limit=${limit}`);
  },

  getHomeSectionById: async (id) => {
    return api.get(`/home-sections/${id}`);
  },

  createHomeSection: async (homeSectionData) => {
    const formData = new FormData();

    // Add all home section fields to formData
    Object.keys(homeSectionData).forEach((key) => {
      if (key !== "image") {
        formData.append(key, homeSectionData[key]);
      }
    });

    // Add image if it exists
    if (homeSectionData.image) {
      formData.append("image", homeSectionData.image);
    }

    return api.post("/home-sections", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateHomeSection: async (id, homeSectionData) => {
    const formData = new FormData();

    // Add all home section fields to formData
    Object.keys(homeSectionData).forEach((key) => {
      if (key !== "image") {
        formData.append(key, homeSectionData[key]);
      }
    });

    // Add image if it exists
    if (homeSectionData.image) {
      formData.append("image", homeSectionData.image);
    }

    return api.patch(`/home-sections/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteHomeSection: async (id) => {
    return api.delete(`/home-sections/${id}`);
  },

  // Coupons
  getAllCoupons: async (page = 1, limit = 10) => {
    return api.get(`/coupons?page=${page}&limit=${limit}`);
  },

  getCouponById: async (id) => {
    return api.get(`/coupons/${id}`);
  },

  createCoupon: async (couponData) => {
    return api.post("/coupons", couponData);
  },

  updateCoupon: async (id, couponData) => {
    return api.patch(`/coupons/${id}`, couponData);
  },

  deleteCoupon: async (id) => {
    return api.delete(`/coupons/${id}`);
  },

  // Coupon Products
  addProductsToCoupon: async (couponId, productIds) => {
    return api.post(`/coupons/${couponId}/products`, { productIds });
  },

  // Coupon Categories
  addCategoriesToCoupon: async (couponId, categoryIds) => {
    return api.post(`/coupons/${couponId}/categories`, { categoryIds });
  },

  // Orders
  getAllOrders: async (page = 1, limit = 10) => {
    return api.get(`/admin/orders?page=${page}&limit=${limit}`);
  },

  getOrderById: async (id) => {
    return api.get(`/admin/orders/${id}`);
  },

  updateOrderStatus: async (id, status) => {
    return api.patch(`/admin/orders/${id}/status`, { status });
  },

  // Users
  getAllUsers: async (page = 1, limit = 10) => {
    return api.get(`/admin/users?page=${page}&limit=${limit}`);
  },

  getUserById: async (id) => {
    return api.get(`/admin/users/${id}`);
  },

  updateUser: async (id, userData) => {
    return api.patch(`/admin/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return api.delete(`/admin/users/${id}`);
  },
};

export default AdminService;
