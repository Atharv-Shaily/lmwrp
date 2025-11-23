import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const querySchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type QueryFormData = z.infer<typeof querySchema>;

export default function NewQuery() {
  const { data: session } = useSession();
  const router = useRouter();
  const { productId, orderId } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QueryFormData>({
    resolver: zodResolver(querySchema),
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (productId) {
      fetchProduct();
    }
    if (orderId) {
      fetchOrder();
    }
  }, [productId, orderId, session]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const onSubmit = async (data: QueryFormData) => {
    try {
      await axios.post('/api/queries', {
        productId: productId || undefined,
        orderId: orderId || undefined,
        subject: data.subject,
        message: data.message,
      });
      toast.success('Query submitted successfully!');
      router.push('/queries');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit query');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Raise a Query</h1>

      {product && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Product: {product.name}</h2>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Order: {order.orderNumber}</h2>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            {...register('subject')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Brief description of your query"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            {...register('message')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe your query in detail..."
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold"
          >
            Submit Query
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


