import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const checkoutSchema = z.object({
  fulfillmentMethod: z.enum(['delivery', 'pickup']),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().min(10, 'Phone number is required'),
  paymentMethod: z.enum(['online', 'offline', 'cod']),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.fulfillmentMethod === 'delivery') {
    if (!data.address || data.address.length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Address is required", path: ["address"] });
    }
    if (!data.city || data.city.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required", path: ["city"] });
    }
    if (!data.state || data.state.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "State is required", path: ["state"] });
    }
    if (!data.zipCode || data.zipCode.length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Zip code is required", path: ["zipCode"] });
    }
  }
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fulfillmentMethod: 'delivery',
      paymentMethod: 'online',
    }
  });

  const paymentMethod = watch('paymentMethod');
  const fulfillmentMethod = watch('fulfillmentMethod');

  useEffect(() => {
    if (session) {
      // Fetch cart if user is logged in
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
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const validItems = cart.items.filter((item: any) => item.product);
    if (validItems.length === 0) {
      toast.error('Your cart items are no longer available');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        items: validItems.map((item: any) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          phone: data.phone,
        },
        paymentMethod: data.paymentMethod,
        fulfillmentMethod: data.fulfillmentMethod,
        scheduledDate: scheduledDate?.toISOString(),
        notes: data.notes,
      };

      if (data.paymentMethod === 'online') {
        // Calculate totals (same as summary below)
        const subtotal = validItems.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        );
        const tax = subtotal * 0.1;
        const shipping = data.fulfillmentMethod === 'pickup' ? 0 : 10;
        const total = subtotal + tax + shipping;

        // 1) Create order in our DB first
        const orderResponse = await axios.post('/api/orders', orderData);
        const orderId = orderResponse.data._id;

        // 2) Create Razorpay order on server (amount in paise)
        const rzpResp = await axios.post('/api/payments/razorpay/create-order', {
          amount: Math.round(total * 100), // rupees -> paise
          currency: 'INR',
          orderId,
        });

        const { order: razorpayOrder, key } = rzpResp.data;

        const options = {
          key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'LiveMart',
          description: 'Order Payment',
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              const verify = await axios.post('/api/payments/razorpay/verify-payment', {
                ...response,
                orderId,
              });

              if (verify.data.verified) {
                toast.success('Payment successful and verified!');
              } else {
                toast.error('Payment verification failed');
              }
            } catch (err) {
              toast.error('Payment verification error');
            } finally {
              router.push(`/orders/${orderId}`);
            }
          },
          prefill: {
            name: (session?.user as any)?.name || '',
            email: (session?.user as any)?.email || '',
          },
          theme: { color: '#3399cc' },
        } as any;

        const loadScript = (src: string): Promise<boolean> =>
          new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
          toast.error('Razorpay SDK failed to load. Please try again.');
          return;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        const orderResponse = await axios.post('/api/orders', orderData);
        toast.success('Order placed successfully!');
        router.push(`/orders/${orderResponse.data._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (!session || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <button
          onClick={() => router.push('/products')}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold border border-primary-600"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const items = cart.items.filter((item: any) => item.product);

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = fulfillmentMethod === 'pickup' ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Fulfillment Method</h2>
            <div className="flex gap-4">
              <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors ${fulfillmentMethod === 'delivery' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                <div className="flex items-center">
                  <input
                    {...register('fulfillmentMethod')}
                    type="radio"
                    value="delivery"
                    className="mr-3 h-5 w-5 text-primary-600"
                  />
                  <div>
                    <span className="block font-bold">Home Delivery</span>
                    <span className="text-sm text-gray-500">Delivered to your doorstep</span>
                  </div>
                </div>
              </label>
              <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors ${fulfillmentMethod === 'pickup' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                <div className="flex items-center">
                  <input
                    {...register('fulfillmentMethod')}
                    type="radio"
                    value="pickup"
                    className="mr-3 h-5 w-5 text-primary-600"
                  />
                  <div>
                    <span className="block font-bold">Store Pickup</span>
                    <span className="text-sm text-gray-500">Pick up from the shop</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {fulfillmentMethod === 'delivery' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      {...register('state')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      {...register('zipCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Contact Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="online"
                  className="mr-2"
                />
                <span>Online Payment (Credit/Debit Card)</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="offline"
                  className="mr-2"
                />
                <span>Offline Payment (Schedule for later)</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="cod"
                  className="mr-2"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
            )}
          </div>

          {(paymentMethod === 'offline' || fulfillmentMethod === 'pickup') && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">
                {fulfillmentMethod === 'pickup' ? 'Pickup Date' : 'Schedule Order'}
              </h2>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                {scheduledDate
                  ? `Scheduled: ${scheduledDate.toLocaleDateString()}`
                  : 'Select Date'}
              </button>
              {showCalendar && (
                <div className="mt-4">
                  <Calendar
                    onChange={(value) => {
                      if (value instanceof Date) {
                        setScheduledDate(value);
                        setShowCalendar(false);
                      }
                    }}
                    value={scheduledDate}
                    minDate={new Date()}
                  />
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any special instructions..."
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map((item: any) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-2">
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
            </div>
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


