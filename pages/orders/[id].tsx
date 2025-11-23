import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function OrderDetail() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (id && session) {
      fetchOrder();
    }
  }, [id, session]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
      setTrackingNumber(response.data.trackingNumber || '');
      if (response.data.deliveryDate) {
        setDeliveryDate(new Date(response.data.deliveryDate).toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    try {
      await axios.patch(`/api/orders/${id}`, {
        status,
        trackingNumber: trackingNumber || undefined,
        deliveryDate: deliveryDate || undefined,
      });
      toast.success('Order updated successfully');
      await fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  if (!session || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  const currentUserId = (session?.user as any)?.id;
  const isSellerForAnyItem =
    order.items &&
    order.items.some(
      (item: any) => item.product && item.product.seller === currentUserId
    );

  const canUpdate =
    (userRole === 'retailer' || userRole === 'wholesaler') && isSellerForAnyItem;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/orders" className="text-primary-500 hover:text-primary-600 font-medium">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${order.status === 'delivered'
                ? 'bg-green-100 text-green-800'
                : order.status === 'shipped'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item._id || item.product?._id || Math.random()} className="flex items-center space-x-4">
                {item.product ? (
                  <>
                    {item.product.images && item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product._id}`}
                        className="font-semibold hover:text-primary-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1">
                    <p className="font-semibold text-gray-500">Product Unavailable</p>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  </div>
                )}
                <div className="text-right">
                  <p className="font-semibold">₹{item.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address / Contact Info */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {order.fulfillmentMethod === 'pickup' ? 'Contact Info' : 'Shipping Address'}
          </h2>
          <p className="text-gray-700">
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.zipCode}
            <br />
            Phone: {order.shippingAddress.phone}
          </p>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{order.shipping.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <strong>Fulfillment Method:</strong>{' '}
              <span className="capitalize">{order.fulfillmentMethod || 'delivery'}</span>
            </p>
            {order.scheduledDate && (
              <p className="text-sm text-gray-600">
                <strong>Pickup Date:</strong>{' '}
                {new Date(order.scheduledDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>Payment Method:</strong> <span className="capitalize">{order.paymentMethod}</span>
            </p>
            <p className="text-sm text-gray-600">
              <strong>Payment Status:</strong>{' '}
              <span
                className={
                  order.paymentStatus === 'paid'
                    ? 'text-green-600'
                    : order.paymentStatus === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }
              >
                {order.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        {/* Update Order (for sellers) */}
        {canUpdate && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateOrderStatus('confirmed')}
                  className="bg-white text-black font-bold px-4 py-2 rounded-md border border-purple-600"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => updateOrderStatus('processing')}
                  className="bg-white text-black font-bold px-4 py-2 rounded-md border border-yellow-600"
                >
                  Processing
                </button>
                <button
                  onClick={() => updateOrderStatus('shipped')}
                  className="bg-white text-black font-bold px-4 py-2 rounded-md border border-blue-600"
                >
                  Mark as Shipped
                </button>
                <button
                  onClick={() => updateOrderStatus('delivered')}
                  className="bg-white text-black font-bold px-4 py-2 rounded-md border border-green-600"
                >
                  Mark as Delivered
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Actions */}
        {userRole === 'customer' && (
          <div className="border-t pt-6">
            <div className="flex space-x-4">
              <Link
                href={`/feedback/new?orderId=${order._id}`}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-2 rounded-md"
              >
                Leave Feedback
              </Link>
              <Link
                href={`/queries/new?orderId=${order._id}`}
                className="bg-white text-black font-bold px-4 py-2 rounded-md border border-gray-600"
              >
                Raise Query
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


