import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (session) {
      if (userRole === 'retailer' || userRole === 'wholesaler') {
        fetchDashboardData();
      } else {
        router.push('/');
      }
    } else {
      router.push('/auth/signin');
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/products?seller=' + (session?.user as any)?.id),
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data.products || [];
      const currentUserId = (session?.user as any)?.id;

      // Only consider orders where this user is the seller for at least one line item
      const sellerOrders = orders.filter(
        (o: any) =>
          o.items &&
          o.items.some(
            (item: any) => item.product && item.product.seller === currentUserId
          )
      );

      const totalRevenue = sellerOrders
        .filter((o: any) => o.paymentStatus === 'paid')
        .reduce((sum: number, o: any) => {
          const sellerItemsTotal = o.items
            .filter(
              (item: any) =>
                item.product && item.product.seller === currentUserId
            )
            .reduce((itemSum: number, item: any) => itemSum + item.total, 0);

          return sum + sellerItemsTotal;
        }, 0);

      const pendingOrders = sellerOrders.filter(
        (o: any) => o.status === 'pending'
      ).length;
      const totalProducts = products.length;
      const lowStockProducts = products.filter((p: any) => p.stock < 10).length;

      setStats({
        totalRevenue,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalOrders: sellerOrders.length,
      });

      setRecentOrders(sellerOrders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-10 relative overflow-hidden bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {userRole === 'retailer' ? 'Retailer' : 'Wholesaler'} Dashboard
          </h1>
          <p className="text-slate-500 text-lg">Overview of your business performance</p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue?.toFixed(2) || 0}`}
          icon="💰"
          color="bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600"
          delay={0}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders || 0}
          icon="⏳"
          color="bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-600"
          delay={100}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon="📦"
          color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"
          delay={200}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockProducts || 0}
          icon="⚠️"
          color="bg-gradient-to-br from-red-50 to-red-100 text-red-600"
          delay={300}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 p-8 mb-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/products"
            className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1 group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🏷️</span>
            Manage Products
          </Link>
          <Link
            href="/orders"
            className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🛍️</span>
            View Orders
          </Link>
          <Link
            href="/queries"
            className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 group"
          >
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">💬</span>
            Customer Queries
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="text-4xl mb-4 opacity-50">📭</div>
            No recent orders found
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="block p-6 hover:bg-slate-50 transition-colors duration-200 group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">Order #{order.orderNumber}</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900">₹{order.total.toFixed(2)}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, delay }: { title: string; value: string | number; icon: string; color: string; delay: number }) {
  return (
    <div
      className={`p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 animate-slide-up bg-white/80 backdrop-blur-sm`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}


