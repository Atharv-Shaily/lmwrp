import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: router.query.category as string || '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sort: 'createdAt',
    order: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, router.query]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', 'true');
      params.append('sort', filters.sort);
      params.append('order', filters.order);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-10 relative overflow-hidden bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Products</h1>
          <p className="text-slate-500 text-lg">Explore our wide range of quality products</p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="All Categories"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
                className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-3 text-sm font-medium text-slate-700">In Stock Only</span>
            </label>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="w-1/2 sm:w-auto">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="w-1/2 sm:w-auto">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order</label>
              <select
                value={filters.order}
                onChange={(e) => handleFilterChange('order', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Showing {products.length} results
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-soft animate-slide-up">
          <div className="text-7xl mb-6 animate-float">🔍</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No products found</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', inStock: false, sort: 'createdAt', order: 'desc' })}
            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary-100 transform hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl bg-slate-50">
                      🖼️
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transform -rotate-12">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-extrabold text-slate-900">₹{product.price}</p>
                      {product.isProxy && (
                        <p className="text-xs text-primary-600 font-medium mt-1 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                          {product.proxySource?.businessName || 'Partner Store'}
                        </p>
                      )}
                    </div>
                    {product.stock > 0 && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4 animate-fade-in">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-medium text-slate-500">
                Page <span className="text-slate-900 font-bold">{pagination.page}</span> of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


