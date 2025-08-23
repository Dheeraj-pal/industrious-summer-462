import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import AdminService from '../services/admin.service';
import { toast } from 'react-toastify';

const ProductForm = ({ product = null }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const navigate = useNavigate();
  const isEditMode = !!product;

  useEffect(() => {
    fetchCategories();
    
    if (isEditMode && product) {
      // Set form values for edit mode
      Object.keys(product).forEach(key => {
        if (key !== 'images' && key !== 'category') {
          setValue(key, product[key]);
        }
      });
      
      if (product.category) {
        setValue('categoryId', product.category.id);
      }
      
      if (product.images && product.images.length > 0) {
        setPreviewImages(product.images.map(img => ({ url: img.url, id: img.id })));
      }
    }
  }, [product, setValue, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await AdminService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setPreviewImages(previews);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert string values to appropriate types
      const productData = {
        ...data,
        price: parseFloat(data.price),
        mrp: parseFloat(data.mrp),
        stock: parseInt(data.stock),
        gstRate: parseFloat(data.gstRate),
        isActive: data.isActive === 'true',
        isDealOfTheWeek: data.isDealOfTheWeek === 'true',
        isSponsored: data.isSponsored === 'true',
        isFeaturedProduct: data.isFeaturedProduct === 'true',
        isPopularOnSite: data.isPopularOnSite === 'true',
      };
      
      if (images.length > 0) {
        productData.images = images;
      }
      
      let response;
      if (isEditMode) {
        // Handle image upload separately if there are new images
        if (images.length > 0) {
          await AdminService.updateProductImages(product.id, images);
        }
        
        // Update product details
        await AdminService.updateProduct(product.id, productData);
        toast.success('Product updated successfully');
      } else {
        await AdminService.createProduct(productData);
        toast.success('Product created successfully');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? 'Update the product information' : 'Add a new product to your store'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Product Name */}
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Product name is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={3}
                  {...register('description', { required: 'Description is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
            </div>

            {/* Price */}
            <div className="sm:col-span-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (₹) *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  {...register('price', { required: 'Price is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
            </div>

            {/* MRP */}
            <div className="sm:col-span-2">
              <label htmlFor="mrp" className="block text-sm font-medium text-gray-700">
                MRP (₹) *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="mrp"
                  step="0.01"
                  min="0"
                  {...register('mrp', { required: 'MRP is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.mrp && <p className="mt-1 text-sm text-red-600">{errors.mrp.message}</p>}
              </div>
            </div>

            {/* Stock */}
            <div className="sm:col-span-2">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="stock"
                  min="0"
                  {...register('stock', { required: 'Stock is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
              </div>
            </div>

            {/* Brand */}
            <div className="sm:col-span-3">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="brand"
                  {...register('brand', { required: 'Brand is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
              </div>
            </div>

            {/* GST Rate */}
            <div className="sm:col-span-3">
              <label htmlFor="gstRate" className="block text-sm font-medium text-gray-700">
                GST Rate (%) *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="gstRate"
                  step="0.01"
                  min="0"
                  {...register('gstRate', { required: 'GST Rate is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.gstRate && <p className="mt-1 text-sm text-red-600">{errors.gstRate.message}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="sm:col-span-3">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="mt-1">
                <select
                  id="categoryId"
                  {...register('categoryId', { required: 'Category is required' })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
              </div>
            </div>

            {/* Gender */}
            <div className="sm:col-span-3">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  {...register('gender')}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="sm:col-span-3">
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="isActive"
                  {...register('isActive')}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Featured Flags */}
            <div className="sm:col-span-6">
              <fieldset>
                <legend className="text-base font-medium text-gray-900">Featured Options</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isDealOfTheWeek"
                        type="checkbox"
                        {...register('isDealOfTheWeek')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isDealOfTheWeek" className="font-medium text-gray-700">Deal of the Week</label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isSponsored"
                        type="checkbox"
                        {...register('isSponsored')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isSponsored" className="font-medium text-gray-700">Sponsored</label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isFeaturedProduct"
                        type="checkbox"
                        {...register('isFeaturedProduct')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isFeaturedProduct" className="font-medium text-gray-700">Featured Product</label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isPopularOnSite"
                        type="checkbox"
                        {...register('isPopularOnSite')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isPopularOnSite" className="font-medium text-gray-700">Popular on Site</label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Images */}
            <div className="sm:col-span-6">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Product Images {!isEditMode && '(Max 5)'}
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300"
                />
              </div>
              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;