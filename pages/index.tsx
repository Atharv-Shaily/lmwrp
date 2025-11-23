import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [regionalProducts, setRegionalProducts] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Fetch categories and featured products
    const fetchData = async () => {
      try {
        const [productsRes] = await Promise.all([
          axios.get('/api/products?limit=8'),
        ]);

        const products = productsRes.data.products || [];
        setFeaturedProducts(products);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set<string>(products.map((p: any) => p.category as string))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location) {
      fetchRegionalProducts();
    }
  }, [location]);

  const fetchRegionalProducts = async () => {
    try {
      const response = await axios.get(
        `/api/products?lat=${location?.lat}&lng=${location?.lng}&radius=50&limit=4`
      );
      setRegionalProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching regional products:', error);
    }
  };

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
      }
    );
  };

  return (
    <div className="space-y-20 pb-20 bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 opacity-95" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay animate-pulse-slow" />
          <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-l from-indigo-500/20 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="lg:w-2/3 animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6 border border-indigo-500/30 backdrop-blur-sm">
              🚀 The Future of B2B Commerce
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
              Connecting Markets, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 animate-gradient">
                Empowering Business.
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              Discover a world of products from verified retailers and wholesalers.
              Streamline your supply chain with our premium marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                Start Exploring
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex justify-center items-center px-8 py-4 border border-slate-600 text-lg font-bold rounded-2xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-300 backdrop-blur-sm bg-slate-800/50"
              >
                Join as Seller
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Regional Specialties Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 transition-all duration-700 group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="text-4xl">📍</span> Regional Specialties
                </h2>
                <p className="text-slate-500 mt-2">Discover unique products from sellers near you.</p>
              </div>
              {!location ? (
                <button
                  onClick={handleEnableLocation}
                  disabled={locationLoading}
                  className="px-6 py-3 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  {locationLoading ? 'Locating...' : '📍 Enable Location to See'}
                </button>
              ) : (
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2">
                  ✅ Location Active
                </span>
              )}
            </div>

            {location && regionalProducts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500">No products found in your immediate area (50km).</p>
                <Link href="/products" className="text-indigo-600 font-bold mt-2 inline-block hover:underline">
                  Browse all products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {regionalProducts.map((product) => (
                  <ProductCard key={product._id} product={product} isRegional />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Shop by Category</h2>
              <Link href="/products" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center group">
                View All <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto bg-white shadow-md text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-3xl">
                      {getCategoryEmoji(category)}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{category}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, isRegional = false }: { product: any; isRegional?: boolean }) {
  return (
    <Link
      href={`/products/${product._id}`}
      className={`group bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2 ${isRegional ? 'ring-2 ring-teal-100 hover:ring-teal-300' : ''
        }`}
    >
      <div className="relative aspect-w-1 aspect-h-1 bg-slate-100 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-64 object-cover object-center group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-slate-400 bg-slate-100">
            No Image
          </div>
        )}
        {isRegional && (
          <div className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
            📍 Nearby
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
            {product.category}
          </span>
        </div>
        <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{product.price.toLocaleString()}
          </p>
          <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function getCategoryEmoji(category: string) {
  const map: any = {
    'Electronics': '📱',
    'Groceries': '🥬',
    'Dairy': '🥛',
    'Fruits': '🍎',
    'Packaged Food': '🍪',
    'Fashion': '👕',
  };
  return map[category] || '📦';
}
