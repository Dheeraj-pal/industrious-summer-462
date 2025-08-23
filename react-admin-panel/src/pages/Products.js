import React, { useState, useEffect, useCallback } from "react";
import AdminService from "../services/admin.service";
import { toast } from "react-toastify";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    brand: "",
    categoryId: "",
    isActive: true,
    mrp: 0,
    gstRate: 0,
    gender: "",
    isDealOfTheWeek: true,
    isSponsored: true,
    isFeaturedProduct: true,
    isPopularOnSite: true,
  });
  const [previewImage, setPreviewImage] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllProducts(currentPage, limit);
      setProducts(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await AdminService.getAllCategories(1, 100); // Get all categories
      setCategories(response.data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      brand: "",
      categoryId: "",
      isActive: true,
      mrp: 0,
      gstRate: 0,
      gender: "",
      isDealOfTheWeek: true,
      isSponsored: true,
      isFeaturedProduct: true,
      isPopularOnSite: true,
    });
    setPreviewImage(null);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        gstRate: parseFloat(formData.gstRate),
      };

      if (editingProduct) {
        // First update the product data (JSON) using the first API endpoint
        // Only include fields that have changed
        const productDataToUpdate = {};
        
        // Compare current form data with original product data
        // Only add fields that have changed to the update object
        if (productData.name !== editingProduct.name) productDataToUpdate.name = productData.name;
        if (productData.description !== editingProduct.description) productDataToUpdate.description = productData.description;
        if (productData.price !== editingProduct.price) productDataToUpdate.price = productData.price;
        if (productData.stock !== editingProduct.stock) productDataToUpdate.stock = productData.stock;
        if (productData.brand !== editingProduct.brand) productDataToUpdate.brand = productData.brand;
        if (productData.categoryId !== editingProduct.category?.id) productDataToUpdate.categoryId = productData.categoryId;
        if (productData.isActive !== editingProduct.isActive) productDataToUpdate.isActive = productData.isActive;
        if (productData.mrp !== editingProduct.mrp) productDataToUpdate.mrp = productData.mrp;
        if (productData.gstRate !== editingProduct.gstRate) productDataToUpdate.gstRate = productData.gstRate;
        if (productData.gender !== editingProduct.gender) productDataToUpdate.gender = productData.gender;
        if (productData.isDealOfTheWeek !== editingProduct.isDealOfTheWeek) productDataToUpdate.isDealOfTheWeek = productData.isDealOfTheWeek;
        if (productData.isSponsored !== editingProduct.isSponsored) productDataToUpdate.isSponsored = productData.isSponsored;
        if (productData.isFeaturedProduct !== editingProduct.isFeaturedProduct) productDataToUpdate.isFeaturedProduct = productData.isFeaturedProduct;
        if (productData.isPopularOnSite !== editingProduct.isPopularOnSite) productDataToUpdate.isPopularOnSite = productData.isPopularOnSite;
        
        // Only make the API call if there are changes to update
        if (Object.keys(productDataToUpdate).length > 0) {
          await AdminService.updateProduct(editingProduct.id, productDataToUpdate);
        }
        
        // If there's a new image, update it using the second API endpoint
        if (productData.image) {
          await AdminService.updateProductImages(editingProduct.id, [productData.image]);
        }
        
        toast.success("Product updated successfully");
      } else {
        await AdminService.createProduct(productData);
        toast.success("Product created successfully");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price || 0,
      stock: product.stock || 0,
      brand: product.brand || "",
      categoryId: product.category?.id || "", // Get categoryId from nested category object
      isActive: product.isActive,
      mrp: product.mrp || 0,
      gstRate: product.gstRate || 0,
      gender: product.gender || "",
      isDealOfTheWeek: product.isDealOfTheWeek,
      isSponsored: product.isSponsored,
      isFeaturedProduct: product.isFeaturedProduct,
      isPopularOnSite: product.isPopularOnSite,
    });
    if (product.image) {
      setPreviewImage(product.image.url);
    } else {
      setPreviewImage(null);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await AdminService.deleteProduct(id);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
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
            Add Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Product Name */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Name *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
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
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* GST Rate */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="gstRate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    GST Rate (%)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="gstRate"
                      id="gstRate"
                      step="0.01"
                      min="0"
                      value={formData.gstRate}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="sm:col-span-3">
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active
                    </label>
                  </div>
                </div>

                {/* MRP */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="mrp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    MRP *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="mrp"
                      id="mrp"
                      required
                      value={formData.mrp}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Price *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="price"
                      id="price"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Stock *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      required
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Brand *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="brand"
                      id="brand"
                      required
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category *
                  </label>
                  <div className="mt-1">
                    <select
                      name="categoryId"
                      id="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Gender *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="gender"
                      id="gender"
                      required
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* isDealOfTheWeek */}
                <div className="sm:col-span-3">
                  <div className="flex items-center">
                    <input
                      id="isDealOfTheWeek"
                      name="isDealOfTheWeek"
                      type="checkbox"
                      checked={formData.isDealOfTheWeek}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isDealOfTheWeek"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Deal of the Week
                    </label>
                  </div>
                </div>

                {/* isSponsored */}
                <div className="sm:col-span-3">
                  <div className="flex items-center">
                    <input
                      id="isSponsored"
                      name="isSponsored"
                      type="checkbox"
                      checked={formData.isSponsored}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isSponsored"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Sponsored
                    </label>
                  </div>
                </div>

                {/* isFeaturedProduct */}
                <div className="sm:col-span-3">
                  <div className="flex items-center">
                    <input
                      id="isFeaturedProduct"
                      name="isFeaturedProduct"
                      type="checkbox"
                      checked={formData.isFeaturedProduct}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isFeaturedProduct"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Featured Product
                    </label>
                  </div>
                </div>

                {/* isPopularOnSite */}
                <div className="sm:col-span-3">
                  <div className="flex items-center">
                    <input
                      id="isPopularOnSite"
                      name="isPopularOnSite"
                      type="checkbox"
                      checked={formData.isPopularOnSite}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isPopularOnSite"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Popular on Site
                    </label>
                  </div>
                </div>

                {/* Image */}
                <div className="sm:col-span-6">
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Image
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300"
                    />
                  </div>
                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={previewImage}
                        alt="Category preview"
                        className="h-24 w-24 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
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
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    product.images && product.images.length > 0
                                      ? product.images[0].secure_url
                                      : "https://via.placeholder.com/150"
                                  }
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name.substring(0, 30)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.brand}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ₹{product.price}
                            </div>
                            <div className="text-sm text-gray-500">
                              MRP: ₹{product.mrp}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.stock}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                        >
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * limit, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex-1 flex justify-end">
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page + 1
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
