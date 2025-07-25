
import React, { useState } from 'react';
import ProductForm from '../../components/ProductForm';
import { updateProduct, fetchProductById } from '../../services/apiService';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProductById(id)
        .then(setInitialData)
        .catch((err) => setError(err.message));
    }
  }, [id]);

  const handleEditProduct = async (productData: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProduct(id!, productData);
      navigate('/seller/dashboard'); // or wherever you want to redirect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ProductForm onSubmit={handleEditProduct} isSubmitting={isSubmitting} initialData={initialData} />
    </div>
  );
};

export default EditProductPage;
