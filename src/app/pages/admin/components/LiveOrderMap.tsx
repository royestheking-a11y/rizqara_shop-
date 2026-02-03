
import { useEffect, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/app/context/StoreContext';
import { Loader2 } from 'lucide-react';

const EVENT_SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GEOJSON_URL = "https://raw.githubusercontent.com/alnahian2003/Bangladesh-GeoJSON/main/bangladesh_geojson_adm2_64_districts_zillas.json";

export const LiveOrderMap = () => {
    const { language } = useStore();
    const [geoData, setGeoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
    const [orderStats, setOrderStats] = useState<{ [key: string]: number }>({});
    const [lastOrderLocation, setLastOrderLocation] = useState<{ x: number, y: number, district: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const t = (en: string, bn: string) => language === 'bn' ? bn : en;

    useEffect(() => {
        // Fetch Real Polygon Data
        fetch(GEOJSON_URL)
            .then(res => res.json())
            .then(data => {
                setGeoData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Map Load Error:", err);
                setLoading(false);
            });
    }, []);

    // Socket Connection
    useEffect(() => {
        const socket = io(EVENT_SOCKET_URL);
        socket.on('new_order', (data: any) => handleNewOrder(data.district));
        return () => { socket.disconnect(); };
    }, [geoData]);

    const handleNewOrder = (districtName: string) => {
        setActiveDistrict(districtName);
        setOrderStats(prev => ({ ...prev, [districtName]: (prev[districtName] || 0) + 1 }));

        if (geoData?.features) {
            // Find district in features (properties usually have 'adm2_en' or 'Shape_Name')
            const feature = geoData.features.find((f: any) =>
                f.properties?.adm2_en?.toLowerCase() === districtName.toLowerCase() ||
                f.properties?.name?.toLowerCase() === districtName.toLowerCase()
            );

            if (feature) {
                // Get centroid of the district polygon
                const width = 400;
                const height = 550;
                const projection = geoMercator().center([90.3563, 23.6850]).scale(4500).translate([width / 2, height / 2]);
                const path = geoPath().projection(projection);
                const centroid = path.centroid(feature);

                setLastOrderLocation({ x: centroid[0], y: centroid[1], district: districtName });
                setTimeout(() => { setLastOrderLocation(null); setActiveDistrict(null); }, 5000);
            }
        }
    };

    // Map Projection
    const width = 400;
    const height = 550;
    const projection = geoMercator().center([90.3563, 23.6850]).scale(4500).translate([width / 2, height / 2]);
    const pathGenerator = geoPath().projection(projection);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center relative overflow-hidden h-[600px]">
            <h3 className="text-xl font-bold text-stone-800 mb-1 font-serif flex items-center gap-2 z-10 w-full">
                <span className="text-2xl">🗺️</span>
                {t('Order Tracker', 'অর্ডার ট্র্যাকার')}
                <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded ml-2 animate-pulse">{t('LIVE', 'লাইভ')}</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4 z-10 w-full">{t('Real-time Delivery Network', 'রিয়েল-টাইম ডেলিভারি নেটওয়ার্ক')}</p>

            <div className="relative w-full h-full flex justify-center items-center">
                {loading ? (
                    <div className="flex flex-col items-center text-stone-400 gap-2">
                        <Loader2 className="animate-spin" />
                        <span className="text-xs">Loading Map...</span>
                    </div>
                ) : (
                    <svg ref={svgRef} width={width} height={height} className="z-10">
                        <g>
                            {geoData?.features?.map((feature: any, i: number) => {
                                const districtName = feature.properties?.adm2_en || feature.properties?.name;
                                const isActive = districtName?.toLowerCase() === activeDistrict?.toLowerCase();
                                const hasOrders = (orderStats[districtName] || 0) > 0;

                                return (
                                    <path
                                        key={i}
                                        d={pathGenerator(feature) || ''}
                                        fill={isActive ? '#fb923c' : (hasOrders ? '#fed7aa' : '#f1f5f9')} // Orange-400 if active, Orange-200 if history, Slate-100 default
                                        stroke={isActive ? '#c2410c' : '#cbd5e1'}
                                        strokeWidth={isActive ? 1.5 : 0.5}
                                        className="transition-all duration-300 cursor-pointer hover:fill-stone-200"
                                    >
                                        <title>{districtName} {hasOrders ? `(${orderStats[districtName]})` : ''}</title>
                                    </path>
                                );
                            })}
                        </g>

                        {/* Connection Lines animation could go here */}
                    </svg>
                )}

                {/* Pin/Marker Animation for New Order */}
                <AnimatePresence>
                    {lastOrderLocation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute pointer-events-none z-50 flex flex-col items-center"
                            style={{ left: lastOrderLocation.x, top: lastOrderLocation.y, transform: 'translate(-50%, -100%)' }}
                        >
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full bg-red-600 animate-ping absolute opacity-75"></div>
                                <div className="text-2xl filter drop-shadow-lg">📍</div>
                            </div>
                            <div className="bg-stone-800 text-white text-[10px] px-2 py-1 rounded shadow-lg mt-1 whitespace-nowrap">
                                New Order: {lastOrderLocation.district}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stats Footer */}
            <div className="absolute bottom-4 left-6 right-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(orderStats).length > 0 ? (
                    Object.entries(orderStats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([dist, count]) => (
                        <div key={dist} className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg flex flex-col min-w-[80px]">
                            <span className="text-[10px] text-stone-500 uppercase">{dist}</span>
                            <span className="font-bold text-stone-800">{count} Orders</span>
                        </div>
                    ))
                ) : (
                    <div className="text-stone-400 text-xs w-full text-center">Waiting for live orders...</div>
                )}
            </div>
        </div>
    );
};
