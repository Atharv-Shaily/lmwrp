import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function Cart() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchCart();
    } else {
      router.push('/auth/signin');
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    const item = cart.items.find((i: any) => i.product._id === productId);
    const minQty = item?.product?.minOrderQuantity || 1;

    if (newQuantity < minQty) {
      toast.warning(`Minimum order quantity is ${minQty}`);
      return;
    }

    try {
      const updatedItems = cart.items.map((item: any) =>
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      );
      await axios.put('/api/cart', { items: updatedItems });
      await fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await axios.delete(`/api/cart/${productId}`);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link
          href="/products"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold border border-primary-600"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Filter out any items whose product is missing (e.g. product deleted)
  const items = cart.items.filter((item: any) => item.product);

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {items.map((item: any) => (
              <div key={item.product._id} className="flex items-center space-x-4 py-4 border-b">
                {item.product.images && item.product.images.length > 0 && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <Link href={`/products/${item.product._id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary-500">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm">₹{item.product.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="px-3 py-1 border rounded-md"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="px-3 py-1 border rounded-md"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-center px-6 py-3 rounded-lg font-semibold"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


