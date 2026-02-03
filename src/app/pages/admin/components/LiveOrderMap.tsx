import { useEffect, useRef, useState } from 'react';
import { geoMercator } from 'd3-geo';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/app/context/StoreContext';

// Pradip Icon (SVG) - Enhanced Glow
const PradipIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(255,165,0,0.8)]">
        <path d="M12 2C10 2 10 5 12 5C14 5 14 2 12 2Z" fill="#FFA500" className="animate-pulse" />
        <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 11 12 11 12 11C12 11 4 11 4 14Z" fill="#8B4513" />
        <path d="M12 11L12 5" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const EVENT_SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const LiveOrderMap = () => {
    const { language } = useStore();
    const [geoData, setGeoData] = useState<any>(null);
    const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
    const [orderStats, setOrderStats] = useState<{ [key: string]: number }>({});
    const [lastOrderLocation, setLastOrderLocation] = useState<{ x: number, y: number, district: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const t = (en: string, bn: string) => language === 'bn' ? bn : en;

    // Fetch Map Data
    useEffect(() => {
        fetch('/bd-districts.json')
            .then(res => res.json())
            .then(data => {
                if (data.features || data.districts) {
                    setGeoData(data);
                }
            });
    }, []);

    // Socket Connection
    useEffect(() => {
        const socket = io(EVENT_SOCKET_URL);

        socket.on('new_order', (data: any) => {
            handleNewOrder(data.district);
        });

        return () => {
            socket.disconnect();
        };
    }, [geoData]);

    const handleNewOrder = (districtName: string) => {
        setActiveDistrict(districtName);

        // Update stats
        setOrderStats(prev => ({
            ...prev,
            [districtName]: (prev[districtName] || 0) + 1
        }));

        // Find coordinates for the Pradip
        if (geoData?.districts) {
            const district = geoData.districts.find((d: any) => d.name.toLowerCase() === districtName.toLowerCase() || d.bn_name === districtName);
            if (district) {
                const width = 400;
                const height = 550;
                const projection = geoMercator()
                    .center([90.3563, 23.6850])
                    .scale(4500)
                    .translate([width / 2, height / 2]);

                const [x, y] = projection([parseFloat(district.long), parseFloat(district.lat)]) || [0, 0];
                setLastOrderLocation({ x, y, district: language === 'bn' ? district.bn_name : district.name });

                // Reset after animation
                setTimeout(() => {
                    setLastOrderLocation(null);
                    setActiveDistrict(null);
                }, 8000); // 8 seconds display
            }
        }
    };

    // Projection Setup
    const width = 400;
    const height = 550;
    const projection = geoMercator()
        .center([90.3563, 23.6850])
        .scale(4500)
        .translate([width / 2, height / 2]);

    return (
        <div className="bg-stone-900 p-6 rounded-2xl shadow-xl border border-stone-800 flex flex-col items-center relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-stone-800/20 to-stone-950/20 pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-1 font-serif flex items-center gap-2 z-10">
                <span className="text-2xl animate-pulse">🕯️</span>
                {t('The Pradip Tracker', 'প্রদীপ ট্র্যাকার')}
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded ml-2 animate-pulse">{t('LIVE', 'লাইভ')}</span>
            </h3>
            <p className="text-xs text-stone-400 mb-6 z-10">{t('Real-time Order Visualization', 'রিয়েল-টাইম অর্ডার ভিজ্যুয়ালাইজেশন')}</p>

            <div className="relative w-full h-[550px] flex justify-center rounded-xl z-0">

                <svg ref={svgRef} width={width} height={height} className="z-10 drop-shadow-2xl">
                    {/* Render Districts as Constellation Dots */}
                    {geoData?.districts?.map((d: any, i: number) => {
                        const [x, y] = projection([parseFloat(d.long), parseFloat(d.lat)]) || [0, 0];
                        const isHot = (orderStats[d.name] || 0) > 5;
                        const isActive = d.name === activeDistrict;

                        return (
                            <g key={i} className="group/dot cursor-pointer">
                                {/* The Dot */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isActive ? 6 : (isHot ? 3 : 1.5)}
                                    fill={isActive ? "#FFA500" : (isHot ? "#EC4899" : "#4B5563")}
                                    className="transition-all duration-1000 ease-in-out"
                                    opacity={isActive ? 1 : 0.4}
                                />

                                {/* Halo for active/hot */}
                                {(isActive || isHot) && (
                                    <circle cx={x} cy={y} r={isActive ? 20 : 8} stroke={isActive ? "#FFA500" : "#EC4899"} strokeWidth={1} fill="none" className="animate-ping opacity-50" />
                                )}

                                {/* Tooltip on Hover */}
                                <title>{language === 'bn' ? d.bn_name : d.name} - {orderStats[d.name] || 0}</title>
                            </g>
                        )
                    })}
                </svg>

                {/* The Pradip Animation Layer */}
                <AnimatePresence>
                    {lastOrderLocation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0, y: -20, transition: { duration: 1 } }}
                            className="absolute pointer-events-none flex flex-col items-center z-50"
                            style={{
                                left: lastOrderLocation.x,
                                top: lastOrderLocation.y - 40,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="relative">
                                {/* Intense Glow Effect */}
                                <div className="absolute inset-0 bg-orange-500 blur-[20px] opacity-70 animate-pulse rounded-full"></div>
                                <PradipIcon />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-center"
                            >
                                <div className="bg-stone-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-stone-700 shadow-xl backdrop-blur-md">
                                    <p className="font-bold text-orange-400">{t('New Order!', 'নতুন অর্ডার!')}</p>
                                    <p className="text-[10px] text-stone-300">{lastOrderLocation.district}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Overlay (Floating Glass Card) */}
                <div className="absolute bottom-6 left-6 right-6 bg-stone-800/80 backdrop-blur-md border border-stone-700 p-4 rounded-xl shadow-2xl z-20">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-400 text-xs uppercase tracking-wider font-bold">{t('Top Districts', 'শীর্ষ জেলাসমূহ')}</span>
                        <span className="text-stone-500 text-[10px]">{t('Live Today', 'আজ লাইভ')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(orderStats)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([name, count], idx) => (
                                <div key={idx} className="flex flex-col items-center bg-stone-900/50 rounded-lg py-2 border border-stone-800">
                                    <span className="text-orange-400 font-bold text-lg">{count}</span>
                                    <span className="text-[10px] text-stone-400 truncate w-full text-center px-1">{name}</span>
                                </div>
                            ))}
                        {Object.keys(orderStats).length === 0 && (
                            <div className="col-span-3 text-center text-stone-600 text-xs py-2 italic">
                                {t('Waiting for orders...', 'অর্ডারের অপেক্ষায়...')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
