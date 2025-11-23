import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function Shops() {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(10); // Default 10km
    const [usingLocation, setUsingLocation] = useState(false);

    useEffect(() => {
        // Fetch shops on mount
        fetchShops();
    }, [location, radius]);

    const fetchShops = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (location) {
                params.append('lat', location.lat.toString());
                params.append('lng', location.lng.toString());
                params.append('radius', radius.toString());
            }

            const response = await axios.get(`/api/shops?${params.toString()}`);
            setShops(response.data);
        } catch (error) {
            console.error('Error fetching shops:', error);
            toast.error('Failed to load shops');
        } finally {
            setLoading(false);
        }
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setUsingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setUsingLocation(false);
                toast.success('Location updated!');
            },
            (error) => {
                console.error('Error getting location:', error);
                toast.error('Unable to retrieve your location');
                setUsingLocation(false);
            }
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Nearby Shops</h1>
                    <p className="text-slate-500 mt-2">Find retailers and wholesalers near you</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <button
                        onClick={handleUseLocation}
                        disabled={usingLocation}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {usingLocation ? (
                            <span className="animate-spin mr-2">⏳</span>
                        ) : (
                            <span className="mr-2">📍</span>
                        )}
                        Use My Location
                    </button>
                </div>
            </div>

            {/* Filters */}
            {location && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Search Radius: <span className="font-bold text-primary-600">{radius} km</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>1 km</span>
                        <span>50 km</span>
                        <span>100 km</span>
                    </div>
                </div>
            )}

            {/* Shops Grid */}
            {loading ? (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            ) : shops.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="text-6xl mb-4">🏪</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No shops found</h3>
                    <p className="text-slate-500">Try increasing the search radius or checking a different location.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                        <div
                            key={shop._id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {shop.businessName || shop.name}
                                    </h3>
                                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded mt-1">
                                        {shop.role}
                                    </span>
                                </div>
                                {shop.distance !== null && (
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-primary-600">
                                            {shop.distance.toFixed(1)}
                                        </span>
                                        <span className="text-xs text-slate-500">km away</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-slate-600 text-sm flex items-start">
                                    <span className="mr-2">📍</span>
                                    {shop.location?.address ? (
                                        <span>
                                            {shop.location.address}
                                            {shop.location.city && shop.location.address !== shop.location.city && `, ${shop.location.city}`}
                                            {shop.location.state && `, ${shop.location.state}`}
                                        </span>
                                    ) : shop.location?.city ? (
                                        <span>
                                            {shop.location.city}
                                            {shop.location.state && `, ${shop.location.state}`}
                                        </span>
                                    ) : (
                                        <span className="italic text-slate-400">Address not available</span>
                                    )}
                                </p>
                                {shop.phone && (
                                    <p className="text-slate-600 text-sm flex items-center">
                                        <span className="mr-2">📞</span>
                                        {shop.phone}
                                    </p>
                                )}
                            </div>

                            <Link
                                href={`/products?seller=${shop._id}`}
                                className="block w-full py-3 text-center bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                                View Products
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
