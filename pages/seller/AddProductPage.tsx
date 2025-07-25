
import React, { useState } from 'react';
import ProductForm from '../../components/ProductForm';
import { addProduct } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const AddProductPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddProduct = async (productData: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await addProduct(productData);
      navigate('/seller/dashboard'); // or wherever you want to redirect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ProductForm onSubmit={handleAddProduct} isSubmitting={isSubmitting} />
    </div>
  );
};

export default AddProductPage;
