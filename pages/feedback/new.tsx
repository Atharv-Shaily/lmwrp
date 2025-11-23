import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function NewFeedback() {
  const { data: session } = useSession();
  const router = useRouter();
  const { productId, orderId } = router.query;
  const [product, setProduct] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const rating = watch('rating');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, session]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      await axios.post('/api/feedback', {
        productId: productId || undefined,
        orderId: orderId || undefined,
        type: productId ? 'product' : 'service',
        rating: data.rating,
        comment: data.comment,
      });
      toast.success('Feedback submitted successfully!');
      router.push(productId ? `/products/${productId}` : '/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Leave Feedback</h1>

      {product && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">{product.name}</h2>
          {product.images && product.images.length > 0 && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-32 h-32 object-cover rounded mb-4"
            />
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue('rating', star)}
                className={`text-4xl ${
                  star <= (rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <input type="hidden" {...register('rating', { valueAsNumber: true })} />
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
          <textarea
            {...register('comment')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Share your experience..."
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold"
          >
            Submit Feedback
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


