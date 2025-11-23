import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  minOrderQuantity: z.number().min(1).optional(),
  availabilityDate: z.string().optional(),
  isProxy: z.boolean().optional(),
  proxySource: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProduct() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagesInput, setImagesInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const isProxy = watch('isProxy');

  useEffect(() => {
    if (id && session) {
      fetchProduct();
    }
  }, [id, session]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const product = response.data;
      
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('category', product.category);
      setValue('price', product.price);
      setValue('stock', product.stock);
      setValue('minOrderQuantity', product.minOrderQuantity || 1);
      setValue('isProxy', product.isProxy || false);
      setValue('proxySource', product.proxySource?._id || '');
      setImagesInput((product.images || []).join(', '));
      
      if (product.availabilityDate) {
        setValue('availabilityDate', new Date(product.availabilityDate).toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const images = imagesInput
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      await axios.put(`/api/products/${id}`, {
        ...data,
        images,
        availabilityDate: data.availabilityDate ? new Date(data.availabilityDate) : undefined,
      });
      toast.success('Product updated successfully!');
      router.push('/dashboard/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (!session || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
            <textarea
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              rows={3}
              placeholder="Enter image URLs separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple image URLs with commas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                {...register('category')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                {...register('stock', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Order Quantity
              </label>
              <input
                {...register('minOrderQuantity', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability Date
            </label>
            <input
              {...register('availabilityDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                {...register('isProxy')}
                type="checkbox"
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show as proxy product (from wholesaler)</span>
            </label>
          </div>

          {isProxy && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wholesaler ID (if proxy)
              </label>
              <input
                {...register('proxySource')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Wholesaler user ID"
              />
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


