import React, { useState, useEffect } from "react";
import AdminService from "../services/admin.service";
import { toast } from "react-toastify";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage", // percentage or fixed
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: null,
    endDate: null,
    isActive: true,
    usageLimit: "",
    description: "",
  });
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllCoupons(
        currentPage,
        limit
      );
      setCoupons(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await AdminService.getAllProducts(1, 100); // Get more products for selection
      setProducts(response.data.items);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await AdminService.getAllCategories(1, 100); // Get more categories for selection
      setCategories(response.data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
    fetchCategories();
  }, [currentPage, limit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value ? new Date(value) : null,
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: null,
      endDate: null,
      isActive: true,
      usageLimit: "",
      description: "",
    });
    setEditingCoupon(null);
    setSelectedProducts([]);
    setSelectedCategories([]);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format dates for API
      const couponData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };

      if (editingCoupon) {
        // Update existing coupon
        await AdminService.updateCoupon(editingCoupon.id, couponData);
        toast.success("Coupon updated successfully");
      } else {
        // Create new coupon
        const response = await AdminService.createCoupon(couponData);
        const newCouponId = response.data.id;
        
        // If products are selected, add them to the coupon
        if (selectedProducts.length > 0) {
          await AdminService.addProductsToCoupon(
            newCouponId,
            selectedProducts.map(product => product.id)
          );
        }
        
        // If categories are selected, add them to the coupon
        if (selectedCategories.length > 0) {
          await AdminService.addCategoriesToCoupon(
            newCouponId,
            selectedCategories.map(category => category.id)
          );
        }
        
        toast.success("Coupon created successfully");
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = async (couponId) => {
    try {
      const response = await AdminService.getCouponById(couponId);
      const coupon = response.data;
      setEditingCoupon(coupon);
      
      setFormData({
        code: coupon.code || "",
        discountType: coupon.discountType || "percentage",
        discountValue: coupon.discountValue?.toString() || "",
        minPurchase: coupon.minPurchase?.toString() || "",
        maxDiscount: coupon.maxDiscount?.toString() || "",
        startDate: coupon.startDate ? new Date(coupon.startDate) : null,
        endDate: coupon.endDate ? new Date(coupon.endDate) : null,
        isActive: coupon.isActive ?? true,
        usageLimit: coupon.usageLimit?.toString() || "",
        description: coupon.description || "",
      });
      
      // Set selected products and categories if available in the response
      if (coupon.products) {
        setSelectedProducts(coupon.products);
      }
      
      if (coupon.categories) {
        setSelectedCategories(coupon.categories);
      }
      
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching coupon details:", error);
      toast.error("Failed to fetch coupon details");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await AdminService.deleteCoupon(id);
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } catch (error) {
        console.error("Error deleting coupon:", error);
        toast.error("Failed to delete coupon");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenProductDialog = (couponId) => {
    setCurrentCouponId(couponId);
    setOpenProductDialog(true);
  };

  const handleOpenCategoryDialog = (couponId) => {
    setCurrentCouponId(couponId);
    setOpenCategoryDialog(true);
  };

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setCurrentCouponId(null);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setCurrentCouponId(null);
  };

  const handleProductSelection = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedProducts(value);
  };

  const handleCategorySelection = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCategories(value);
  };

  const handleAddProductsToCoupon = async () => {
    try {
      await AdminService.addProductsToCoupon(currentCouponId, {
        productIds: selectedProducts,
      });
      toast.success("Products added to coupon successfully");
      handleCloseProductDialog();
      fetchCoupons();
    } catch (error) {
      console.error("Error adding products to coupon:", error);
      toast.error("Failed to add products to coupon");
    }
  };

  const handleAddCategoriesToCoupon = async () => {
    try {
      await AdminService.addCategoriesToCoupon(currentCouponId, {
        categoryIds: selectedCategories,
      });
      toast.success("Categories added to coupon successfully");
      handleCloseCategoryDialog();
      fetchCoupons();
    } catch (error) {
      console.error("Error adding categories to coupon:", error);
      toast.error("Failed to add categories to coupon");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Code */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Code *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="code"
                      id="code"
                      required
                      value={formData.code}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Discount Type */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="discountType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Discount Type *
                  </label>
                  <div className="mt-1">
                    <select
                      id="discountType"
                      name="discountType"
                      required
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                {/* Discount Value */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="discountValue"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Discount Value *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="discountValue"
                      id="discountValue"
                      required
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Min Purchase Amount */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="minPurchase"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Min Purchase Amount
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="minPurchase"
                      id="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Max Discount Amount */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="maxDiscount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Max Discount Amount
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="maxDiscount"
                      id="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date *
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      required
                      value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(e)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date *
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      required
                      value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(e)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="usageLimit"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Usage Limit
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="usageLimit"
                      id="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <p className="mt-1 text-sm text-gray-500">Leave empty for unlimited usage</p>
                  </div>
                </div>

                {/* Status */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="isActive"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="isActive"
                      name="isActive"
                      value={formData.isActive}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Products and Categories */}
                {!editingCoupon && (
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apply to Products
                    </label>
                    <select
                      multiple
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      onChange={handleProductSelection}
                      size="4"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Optional: Select products for this coupon</p>
                    
                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                      Apply to Categories
                    </label>
                    <select
                      multiple
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      onChange={handleCategorySelection}
                      size="4"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Optional: Select categories for this coupon</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingCoupon ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Code
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Discount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Valid Until
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupons.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                        >
                          No coupons found
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {coupon.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}%`
                              : `$${coupon.discountValue}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {coupon.endDate
                              ? new Date(coupon.endDate).toLocaleDateString()
                              : "No expiry"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {coupon.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(coupon.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="text-red-600 hover:text-red-900 mr-2"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleOpenProductDialog(coupon.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Add Products
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Product Selection Dialog */}
      {openProductDialog && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add Products to Coupon
                    </h3>
                    <div className="mt-2">
                      <div className="mt-1">
                        <select
                          multiple
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          onChange={handleProductSelection}
                          size="10"
                        >
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddProductsToCoupon}
                >
                  Add Products
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseProductDialog}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Selection Dialog */}
      {openCategoryDialog && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add Categories to Coupon
                    </h3>
                    <div className="mt-2">
                      <div className="mt-1">
                        <select
                          multiple
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          onChange={handleCategorySelection}
                          size="10"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddCategoriesToCoupon}
                >
                  Add Categories
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseCategoryDialog}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;