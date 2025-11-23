import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading' || !session) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const user = session.user as any;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-2">Manage your account settings</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <div className="p-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200">
                                {user.name}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="p-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200">
                                {user.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <div className="p-3 bg-slate-50 rounded-xl text-slate-900 font-medium border border-slate-200 capitalize">
                                {user.role}
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="border-t border-slate-100 pt-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Danger Zone</h2>
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-lg font-bold text-red-800">Delete Account</h3>
                                <p className="text-red-600 text-sm mt-1">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
                                        try {
                                            await axios.delete('/api/user/delete');
                                            toast.success('Account deleted successfully');
                                            signOut({ callbackUrl: '/' });
                                        } catch (error: any) {
                                            toast.error(error.response?.data?.message || 'Failed to delete account');
                                        }
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-500/30 transition-all duration-200"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
