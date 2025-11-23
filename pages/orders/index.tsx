import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Orders() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      fetchOrders();
    } else {
      router.push('/auth/signin');
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-10 relative overflow-hidden bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">My Orders</h1>
          <p className="text-slate-500 text-lg">Track and manage your recent purchases</p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl relative mb-8 flex items-center shadow-sm animate-slide-up" role="alert">
          <span className="mr-3 text-xl">⚠️</span>
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-32 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-soft animate-slide-up">
          <div className="text-7xl mb-6 animate-float">🛍️</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No orders yet</h3>
          <p className="text-slate-500 mb-10 max-w-md mx-auto">Looks like you haven't placed any orders yet. Start exploring our products to find something you love.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="block bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-soft hover:border-primary-100 transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      Order #{order.orderNumber}
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-left md:text-right bg-slate-50 px-6 py-3 rounded-xl group-hover:bg-primary-50 transition-colors">
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{order.total.toFixed(2)}</p>
                  <p className="text-sm text-slate-500 font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Payment</span>
                  <span className="capitalize font-medium text-slate-900">{order.paymentMethod}</span>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`font-bold capitalize px-2 py-0.5 rounded ${order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : order.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {order.trackingNumber && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Tracking</span>
                    <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-700 border border-slate-200">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

