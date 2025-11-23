import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchFeedbacks();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setQuantity(response.data.minOrderQuantity || 1);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`/api/feedback?productId=${id}`);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const addToCart = async () => {
    if (!session) {
      toast.error('Please sign in to add items to cart');
      router.push('/auth/signin');
      return;
    }

    try {
      await axios.post('/api/cart', {
        productId: id,
        quantity,
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-600">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <Link href="/products" className="text-primary-600 hover:underline">
          Return to products
        </Link>
      </div>
    );
  }

  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Product Images */}
          <div className="p-8 lg:p-12 bg-slate-50 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full max-w-lg object-contain rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-96 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium">
                No Image Available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {product.category}
                </span>
                {averageRating > 0 && (
                  <div className="flex items-center text-yellow-400">
                    <span className="text-lg">★</span>
                    <span className="ml-1 text-slate-700 font-medium text-sm">
                      {averageRating.toFixed(1)} ({feedbacks.length} reviews)
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-4xl font-bold text-primary-600">
                ₹{product.price.toLocaleString()}
              </p>
            </div>

            <div className="prose prose-slate mb-8 text-slate-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="space-y-4 mb-8 border-t border-b border-slate-100 py-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Availability</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-bold flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {product.stock} In Stock
                  </span>
                ) : (
                  <span className="text-red-500 font-bold">Out of Stock</span>
                )}
              </div>

              {product.seller && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Seller</span>
                  <span className="text-slate-900 font-semibold">
                    {product.seller?.businessName || product.seller?.name}
                  </span>
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mt-auto space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-slate-700">Quantity</label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                      className="px-4 py-2 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(product.minOrderQuantity || 1, parseInt(e.target.value) || (product.minOrderQuantity || 1)))}
                      min={product.minOrderQuantity || 1}
                      max={product.stock}
                      className="w-16 py-2 text-center border-x border-slate-200 focus:outline-none text-slate-900 font-medium"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {product.minOrderQuantity > 1 && (
                    <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                      Min. Order: {product.minOrderQuantity}
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  {session && (product.seller?._id === (session.user as any).id || product.seller === (session.user as any).id) ? (
                    <button
                      disabled
                      className="flex-1 bg-slate-300 text-slate-500 font-bold px-8 py-4 rounded-xl cursor-not-allowed"
                    >
                      You Own This Product
                    </button>
                  ) : (
                    <button
                      onClick={addToCart}
                      disabled={product.stock === 0}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-primary-500/30 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  )}
                  <Link
                    href="/cart"
                    className="px-8 py-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
          {session && (
            <Link
              href={`/feedback/new?productId=${id}`}
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Write a Review
            </Link>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-3">
                      {feedback.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{feedback.user?.name}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < feedback.rating ? '★' : <span className="text-slate-200">★</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{feedback.comment}</p>
                {feedback.response && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-800 mb-1">Seller Response</p>
                    <p className="text-sm text-slate-600">{feedback.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


