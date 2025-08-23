import React from 'react';
import ProductForm from '../components/ProductForm';

const CreateProduct = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create Product</h1>
      <ProductForm />
    </div>
  );
};

export default CreateProduct;