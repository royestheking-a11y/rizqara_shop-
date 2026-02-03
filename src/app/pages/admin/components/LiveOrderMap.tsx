import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-geo';
import { io } from 'socket.io-client';
import { useStore } from '@/app/context/StoreContext';
import { MapPin, Activity, Zap, Navigation, X } from 'lucide-react';

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
    const { t, orders } = useStore(); // Access cached orders from context
    const [geoData, setGeoData] = useState<GeoData | null>(null);
    const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const [highlightedDistrict, setHighlightedDistrict] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    // Determine Socket URL safely
    const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socketUrl = api_url.replace(/\/api\/??$/, ''); // Strip /api suffix ensures connection to root

    // D3 Projection Logic
    const projection = useMemo(() => {
        return d3.geoMercator()
            .center([90.3563, 23.6850]) // Center of Bangladesh
            .scale(4500) // Scale for container
            .translate([150, 250]); // Adjusted Y
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

        // Some district names in GeoJSON might have suffix " District" or case differences
        const targetNorm = districtName.toLowerCase().replace(' district', '').trim();
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

    // Initialize with Recent Orders from Context (Handles Reload by showing history)
    useEffect(() => {
        if (geoData && orders.length > 0) {
            // Sort by date descending (newest first)
            const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const recent = sortedOrders.slice(0, 5);

            const mappedOrders = recent.map(o => {
                const district = o.shippingAddress?.district || 'Dhaka';
                const coords = getCoordinatesForDistrict(district, geoData.features);
                return {
                    id: new Date(o.date).getTime() + Math.random(), // ensure unique key
                    city: district,
                    x: coords.x,
                    y: coords.y
                };
            });

            setActiveOrders(mappedOrders);
            if (recent.length > 0) {
                setLastOrder(recent[0]);
            }
        }
    }, [geoData, orders]);

    // Socket Connection for New Real-time Orders
    useEffect(() => {
        const socket = io(socketUrl);

        console.log("LiveMap Socket connecting to:", socketUrl);

        socket.on('connect', () => {
            console.log("LiveMap Socket Connected");
        });

        // Backend emits 'new_order' with flat structure { id, district, ... }
        socket.on('new_order', (data) => {
            console.log("LiveMap New Order Received:", data);

            const district = data.district || 'Dhaka';

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
            setActiveOrders(prev => [newOrder, ...prev.slice(0, 4)]); // Prepend new order, keep max 5
            setLastOrder(data); // data is the flattened order object
            setHighlightedDistrict(district);

            // Auto-select the newest order to show pop-up briefly
            setSelectedOrderId(newOrder.id);
            setTimeout(() => setSelectedOrderId(null), 3000); // Auto-hide after 3s

            // Clear highlight after 5 seconds
            setTimeout(() => setHighlightedDistrict(null), 5000);
        });

        return () => {
            socket.disconnect();
        };
    }, [socketUrl, geoData, pathGenerator]);

    // Helper to check if a feature matches the highlighted district
    const isProjectedDistrict = (feature: any, target: string | null) => {
        if (!target) return false;
        const props = feature.properties;
        const targetNorm = target.toLowerCase().replace(' district', '').trim();
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
            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
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
            <div className="w-full h-full flex items-center justify-center bg-stone-50/50 relative" onClick={() => setSelectedOrderId(null)}>
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
                                            fill: isHighlighted ? '#fce7f3' : '#e5e7eb', // Pink-100 highlight
                                            scale: isHighlighted ? 1.05 : 1,
                                            stroke: isHighlighted ? '#ec4899' : '#ffffff', // Pink-500 stroke
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
                        const isSelected = selectedOrderId === order.id;

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute z-30"
                                style={{
                                    left: `${(order.x / 300) * 100}%`,
                                    top: `${(order.y / 500) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: isSelected ? 50 : 30 // Bring selected to front
                                }}
                            >
                                <div className="relative flex items-center justify-center group">
                                    {/* Click Target */}
                                    <div
                                        className="cursor-pointer p-2 -m-2"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent clearing selection
                                            setSelectedOrderId(isSelected ? null : order.id);
                                        }}
                                    >
                                        {/* Premium Pulse Effect */}
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-pink-500/40 rounded-full animate-ping w-full h-full"></div>
                                            {/* Core Dot */}
                                            <div className={`relative z-10 w-3 h-3 rounded-full border border-white shadow-sm transition-all duration-300 ${isSelected ? 'bg-pink-600 scale-125 ring-2 ring-pink-200' : 'bg-pink-500 hover:scale-110'}`}></div>
                                        </div>
                                    </div>

                                    {/* Interactive Tooltip / Label - Only show if selected */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                                            >
                                                <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-pink-100 flex items-center gap-2 min-w-max">
                                                    <div className="bg-pink-50 p-1 rounded-full">
                                                        <Zap className="w-3 h-3 text-pink-500" fill="currentColor" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-stone-400 font-medium leading-none mb-0.5">{t('নতুন অর্ডার', 'New Order')}</span>
                                                        <span className="text-xs font-bold text-stone-800 leading-none">{order.city}</span>
                                                    </div>
                                                    {/* Little triangle arrow */}
                                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-pink-100 rotate-45 transform"></div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                            {lastOrder?.district || lastOrder?.shippingAddress?.district || '...'}
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
