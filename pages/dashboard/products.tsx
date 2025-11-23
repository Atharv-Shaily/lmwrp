import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function ManageProducts() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    if (session) {
      const userRole = (session.user as any)?.role;
      if (userRole === 'retailer' || userRole === 'wholesaler') {
        fetchProducts();
      } else {
        router.push('/');
      }
    } else {
      router.push('/auth/signin');
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `/api/products?seller=${(session?.user as any)?.id}`
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (!session || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link
          href="/dashboard/products/new"
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You have no products yet.</p>
          <Link
            href="/dashboard/products/new"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-primary-500 font-bold text-xl">₹{product.price}</p>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      product.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/products/${product._id}/edit`}
                    className="flex-1 bg-white text-black px-4 py-2 rounded-md text-center text-sm border border-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-white text-black px-4 py-2 rounded-md text-sm border border-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


