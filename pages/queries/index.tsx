import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Queries() {
  const { data: session } = useSession();
  const router = useRouter();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchQueries();
    } else {
      router.push('/auth/signin');
    }
  }, [session]);

  const fetchQueries = async () => {
    try {
      const response = await axios.get('/api/queries');
      setQueries(response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!session || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customer Queries</h1>
        <Link
          href="/queries/new"
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold"
        >
          New Query
        </Link>
      </div>

      {queries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No queries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <Link
              key={query._id}
              href={`/queries/${query._id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{query.subject}</h3>
                  <p className="text-sm text-gray-600">
                    From: {query.user?.name} |{' '}
                    {query.product && `Product: ${query.product.name}`}
                    {query.order && `Order: ${query.order.orderNumber}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    query.status
                  )}`}
                >
                  {query.status}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-2">{query.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(query.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


