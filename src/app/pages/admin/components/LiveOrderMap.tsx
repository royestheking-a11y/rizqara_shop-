import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-geo';
import { io } from 'socket.io-client';
import { useStore } from '@/app/context/StoreContext';
import { MapPin, Activity, Zap, Navigation } from 'lucide-react';

interface GeoData {
    type: string;
    features: any[];
}

export const LiveOrderMap = () => {
    const { t } = useStore();
    const [geoData, setGeoData] = useState<GeoData | null>(null);
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [highlightedDistrict, setHighlightedDistrict] = useState<string | null>(null);

    // Load Map Data (Detailed Polygons)
    useEffect(() => {
        fetch('/bangladesh-geojson.json')
            .then(res => res.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(err => console.error("Failed to load map data:", err));
    }, []);

    // Socket Connection for Real-time Orders
    useEffect(() => {
        const socket = io(api_url);

        socket.on('newOrder', (data) => {
            const { order } = data;
            const district = order?.shippingAddress?.city || 'Dhaka';

            // Add to active orders pipeline
            setActiveOrders(prev => [...prev.slice(-4), { ...order, id: Date.now() }]);
            setLastOrder(order);
            setHighlightedDistrict(district);

            // Clear highlight after 5 seconds
            setTimeout(() => setHighlightedDistrict(null), 5000);
        });

        return () => {
            socket.disconnect();
        };
    }, [api_url]);

    // D3 Projection Logic
    const projection = useMemo(() => {
        return d3.geoMercator()
            .center([90.3563, 23.6850]) // Center of Bangladesh
            .scale(4500) // Scale for container
            .translate([150, 250]); // Adjusted Y to fit full map within 600px height
    }, []);

    const pathGenerator = useMemo(() => {
        return d3.geoPath().projection(projection);
    }, [projection]);

    // Helper to check if a feature matches the highlighted district
    const isProjectedDistrict = (feature: any, target: string | null) => {
        if (!target) return false;
        const props = feature.properties;
        // Check levels: Name_2 (District), Name_3 (District/Upazila), Name_1 (Division)
        // Normalize names for comparison
        const targetNorm = target.toLowerCase();
        return (
            (props.NAME_2 && props.NAME_2.toLowerCase().includes(targetNorm)) ||
            (props.NAME_3 && props.NAME_3.toLowerCase().includes(targetNorm)) ||
            (props.NAME_4 && props.NAME_4.toLowerCase().includes(targetNorm)) ||
            (props.name && props.name.toLowerCase().includes(targetNorm))
        );
    };

    return (
        <div className="bg-white p-0 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center relative overflow-hidden group h-[600px]">
            {/* Header */}
            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-stone-100 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-500" />
                    {t('Order Tracker', 'অর্ডার ট্র্যাকার')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs text-stone-500 font-medium">
                        {lastOrder ? t('Live Delivery Network', 'লাইভ ডেলিভারি নেটওয়ার্ক') : t('Waiting for orders...', 'অর্ডারের অপেক্ষায়...')}
                    </p>
                </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-full flex items-center justify-center bg-stone-50/50 relative">
                {/* SVG MAP */}
                {geoData ? (
                    <svg viewBox="0 0 300 500" className="w-full h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>
                        <g className="transition-all duration-500">
                            {geoData.features.map((feature, i) => {
                                const isHighlighted = isProjectedDistrict(feature, highlightedDistrict);
                                return (
                                    <motion.path
                                        key={i}
                                        d={pathGenerator(feature) || ''}
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: 1,
                                            fill: isHighlighted ? '#10b981' : '#e5e7eb',
                                            scale: isHighlighted ? 1.05 : 1,
                                            stroke: isHighlighted ? '#059669' : '#ffffff',
                                            strokeWidth: isHighlighted ? 1 : 0.5
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="cursor-pointer hover:fill-emerald-200 transition-colors"
                                    />
                                );
                            })}
                        </g>
                    </svg>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-300 animate-pulse">
                        <MapPin className="w-8 h-8" />
                        <span className="text-xs">{t('Loading Map...', 'মানচিত্র লোড হচ্ছে...')}</span>
                    </div>
                )}

                {/* Animated Order Dots */}
                <AnimatePresence>
                    {activeOrders.map((order) => {
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0, x: -50, y: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute z-10"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`
                                }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50"></div>
                                    <div className="bg-white p-1 rounded-full shadow-lg border border-emerald-100 relative z-10">
                                        <div className="bg-emerald-500 w-2 h-2 rounded-full"></div>
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-[10px] px-2 py-1 rounded shadow-sm whitespace-nowrap border border-stone-100 flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span>{t('New Order!', 'নতুন অর্ডার!')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <div className="w-full p-4 border-t border-stone-100 bg-white/50 backdrop-blur-sm z-20">
                <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                        <span className="text-stone-400 font-medium">{t('Last Active', 'সর্বশেষ সক্রিয়')}</span>
                        <span className="text-stone-700 font-bold max-w-[100px] truncate">
                            {lastOrder?.shippingAddress?.city || '...'}
                        </span>
                    </div>
                    <div className="h-8 w-[1px] bg-stone-100"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-stone-400 font-medium">{t('Volume', 'ভলিউম')}</span>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                            <Activity className="w-3 h-3" />
                            <span>{t('High', 'উচ্চ')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
