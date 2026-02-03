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

interface ActiveOrder {
    id: number;
    city: string;
    x: number;
    y: number;
}

export const LiveOrderMap = () => {
    const { t } = useStore();
    const [geoData, setGeoData] = useState<GeoData | null>(null);
    const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [highlightedDistrict, setHighlightedDistrict] = useState<string | null>(null);

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

    // Load Map Data (Detailed Polygons)
    useEffect(() => {
        fetch('/bangladesh-geojson.json')
            .then(res => res.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(err => console.error("Failed to load map data:", err));
    }, []);

    // Helper to find coordinates for a district
    const getCoordinatesForDistrict = (districtName: string, features: any[]) => {
        if (!districtName || !features) return { x: 150, y: 250 }; // Default to center

        const targetNorm = districtName.toLowerCase();
        const feature = features.find(f => {
            const props = f.properties;
            return (
                (props.NAME_2 && props.NAME_2.toLowerCase().includes(targetNorm)) ||
                (props.NAME_3 && props.NAME_3.toLowerCase().includes(targetNorm)) ||
                (props.NAME_4 && props.NAME_4.toLowerCase().includes(targetNorm)) ||
                (props.name && props.name.toLowerCase().includes(targetNorm))
            );
        });

        if (feature) {
            const centroid = pathGenerator.centroid(feature);
            return { x: centroid[0], y: centroid[1] };
        }
        return { x: 150, y: 250 };
    };

    // Socket Connection for Real-time Orders
    useEffect(() => {
        const socket = io(api_url);

        socket.on('newOrder', (data) => {
            const { order } = data;
            const district = order?.shippingAddress?.city || 'Dhaka'; // Default if missing

            // Calculate position if map data is ready
            let coords = { x: 150, y: 250 };
            if (geoData) {
                coords = getCoordinatesForDistrict(district, geoData.features);
            }

            const newOrder: ActiveOrder = {
                id: Date.now(),
                city: district,
                x: coords.x,
                y: coords.y
            };

            // Add to active orders pipeline
            setActiveOrders(prev => [...prev.slice(-4), newOrder]);
            setLastOrder(order);
            setHighlightedDistrict(district);

            // Clear highlight after 5 seconds
            setTimeout(() => setHighlightedDistrict(null), 5000);
        });

        return () => {
            socket.disconnect();
        };
    }, [api_url, geoData, pathGenerator]); // Re-bind if geoData loads late

    // Helper to check if a feature matches the highlighted district
    const isProjectedDistrict = (feature: any, target: string | null) => {
        if (!target) return false;
        const props = feature.properties;
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
                    {t('অর্ডার ট্র্যাকার', 'Order Tracker')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs text-stone-500 font-medium">
                        {lastOrder ? t('লাইভ ডেলিভারি নেটওয়ার্ক', 'Live Delivery Network') : t('অর্ডারের অপেক্ষায়...', 'Waiting for orders...')}
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
                        <span className="text-xs">{t('মানচিত্র লোড হচ্ছে...', 'Loading Map...')}</span>
                    </div>
                )}

                {/* Animated Order Dots - Absolute Position Overlaid on SVG */}
                <AnimatePresence>
                    {activeOrders.map((order) => {
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute z-30 pointer-events-none"
                                style={{
                                    // Map coordinates (0-300, 0-500) need to be mapped to percent or pixel relative to container
                                    // Since SVG viewbox is 300x500 and takes full width/height of container, we can use percentages
                                    left: `${(order.x / 300) * 100}%`,
                                    top: `${(order.y / 500) * 100}%`,
                                    transform: 'translate(-50%, -50%)' // Center the dot
                                }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/50 rounded-full animate-ping w-8 h-8 -ml-3 -mt-3"></div>
                                    <div className="bg-white p-1 rounded-full shadow-lg border border-emerald-500 relative z-10 w-3 h-3 flex items-center justify-center">
                                        <div className="bg-emerald-500 w-1.5 h-1.5 rounded-full"></div>
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur text-[10px] px-2 py-1 rounded shadow-lg border border-emerald-100 flex items-center gap-1 whitespace-nowrap z-40 transform hover:scale-105 transition-transform">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span className="font-bold text-stone-800">{order.city}</span>
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
                        <span className="text-stone-400 font-medium">{t('সর্বশেষ সক্রিয়', 'Last Active')}</span>
                        <span className="text-stone-700 font-bold max-w-[100px] truncate">
                            {lastOrder?.shippingAddress?.city || '...'}
                        </span>
                    </div>
                    <div className="h-8 w-[1px] bg-stone-100"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-stone-400 font-medium">{t('ভলিউম', 'Volume')}</span>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                            <Activity className="w-3 h-3" />
                            <span>{t('উচ্চ', 'High')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
