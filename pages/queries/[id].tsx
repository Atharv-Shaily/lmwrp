import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function QueryDetail() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [query, setQuery] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (id && session) {
      fetchQuery();
    }
  }, [id, session]);

  const fetchQuery = async () => {
    try {
      const response = await axios.get(`/api/queries/${id}`);
      setQuery(response.data);
    } catch (error) {
      console.error('Error fetching query:', error);
      toast.error('Failed to load query');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await axios.patch(`/api/queries/${id}`, { message: response });
      toast.success('Response sent successfully');
      setResponse('');
      await fetchQuery();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send response');
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await axios.patch(`/api/queries/${id}`, { status });
      toast.success('Status updated');
      await fetchQuery();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  if (!session || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!query) {
    return <div className="text-center py-12">Query not found</div>;
  }

  const canRespond = userRole === 'retailer' || userRole === 'wholesaler';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            ← Back
          </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{query.subject}</h1>
            <p className="text-sm text-gray-600">
              From: {query.user?.name} |{' '}
              {new Date(query.createdAt).toLocaleString()}
            </p>
            {query.product && (
              <p className="text-sm text-gray-600 mt-1">
                Product: {query.product.name}
              </p>
            )}
            {query.order && (
              <p className="text-sm text-gray-600 mt-1">
                Order: {query.order.orderNumber}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              query.status === 'resolved'
                ? 'bg-green-100 text-green-800'
                : query.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {query.status}
          </span>
        </div>

        <div className="border-t pt-4 mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{query.message}</p>
        </div>

        {/* Responses */}
        {query.responses && query.responses.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-bold mb-4">Responses</h2>
            <div className="space-y-4">
              {query.responses.map((resp: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{resp.user?.name}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(resp.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{resp.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Form */}
        {canRespond && (
          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-bold mb-4">Respond to Query</h2>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="Type your response..."
            />
            <div className="flex space-x-2">
              <button
                onClick={submitResponse}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2 rounded-md"
              >
                Send Response
              </button>
              <button
                onClick={() => updateStatus('resolved')}
                className="bg-white text-black font-bold px-4 py-2 rounded-md border border-green-600"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => updateStatus('closed')}
                className="bg-white text-black font-bold px-4 py-2 rounded-md border border-gray-600"
              >
                Close Query
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


