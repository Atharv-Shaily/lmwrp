import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';

const GoogleMapComponent = dynamic(() => import('@/components/GoogleMapLocation'), {
  ssr: false,
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'retailer', 'wholesaler']),
  businessName: z.string().optional(),
  businessLicense: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const role = watch('role');

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await axios.post('/api/auth/register', {
        ...data,
        location: location || data.location,
      });
      
      setEmail(data.email);
      setStep(2);
      toast.success('Registration successful! Please verify your OTP.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const verifyOTP = async () => {
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      toast.success('Email verified! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
  };

  const resendOTP = async () => {
    try {
      await axios.post('/api/auth/resend-otp', { email });
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const selectedRole = role || 'customer';
    signIn(provider, { callbackUrl: '/', role: selectedRole });
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent an OTP to {email}
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <button
                onClick={verifyOTP}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white font-bold bg-primary-500 hover:bg-primary-600"
              >
                Verify OTP
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={resendOTP}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/auth/signin" className="font-medium text-primary-500 hover:text-primary-600">
                sign in to your account
              </Link>
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone (Optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                {...register('role')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="customer">Customer</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>

            {(role === 'retailer' || role === 'wholesaler') && (
              <>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <input
                    {...register('businessName')}
                    type="text"
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700">
                    Business License
                  </label>
                  <input
                    {...register('businessLicense')}
                    type="text"
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional - for location-based search)
              </label>
              <GoogleMapComponent onLocationChange={setLocation} />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white font-bold bg-primary-500 hover:bg-primary-600"
            >
              Sign Up
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Facebook
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


