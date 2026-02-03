
import { useEffect, useRef, useState } from 'react';
import { geoMercator } from 'd3-geo';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';

// Pradip Icon (SVG)
const PradipIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10 2 10 5 12 5C14 5 14 2 12 2Z" fill="#FFA500" className="animate-pulse" />
        <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 11 12 11 12 11C12 11 4 11 4 14Z" fill="#8B4513" />
        <path d="M12 11L12 5" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const EVENT_SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const LiveOrderMap = () => {
    const [geoData, setGeoData] = useState<any>(null);
    const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
    const [orderStats, setOrderStats] = useState<{ [key: string]: number }>({});
    const [lastOrderLocation, setLastOrderLocation] = useState<{ x: number, y: number, district: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Fetch Map Data
    useEffect(() => {
        fetch('/bd-districts.json')
            .then(res => res.json())
            .then(data => {
                if (data.features) {
                    setGeoData(data);
                } else if (data.districts) {
                    setGeoData(data);
                }
            });
    }, []);

    // Socket Connection
    useEffect(() => {
        const socket = io(EVENT_SOCKET_URL);

        socket.on('new_order', (data: any) => {
            console.log("New Live Order:", data);
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
                const height = 500;
                const projection = geoMercator()
                    .center([90.3563, 23.6850])
                    .scale(4000)
                    .translate([width / 2, height / 2]);

                const [x, y] = projection([parseFloat(district.long), parseFloat(district.lat)]) || [0, 0];
                setLastOrderLocation({ x, y, district: district.name });

                // Reset after animation
                setTimeout(() => {
                    setLastOrderLocation(null);
                    setActiveDistrict(null); // Reset active district
                }, 5000);
            }
        }
    };

    // Projection Setup
    const width = 350;
    const height = 500;
    const projection = geoMercator()
        .center([90.3563, 23.6850]) // Center of BD created roughly
        .scale(3500)
        .translate([width / 2, height / 2]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100 flex flex-col items-center relative overflow-hidden">
            <h3 className="text-xl font-bold text-stone-800 mb-2 font-serif flex items-center gap-2">
                <span className="text-2xl animate-pulse">🕯️</span>
                The Pradip Tracker (Live)
            </h3>
            <p className="text-xs text-stone-500 mb-6">Real-time Order Visualization across Bangladesh</p>

            <div className="relative w-full h-[500px] flex justify-center bg-stone-50 rounded-xl border border-stone-200">

                <svg ref={svgRef} width={width} height={height} className="z-10">
                    {/* Render Districts as Dots for now since we lack polygon data */}
                    {geoData?.districts?.map((d: any, i: number) => {
                        const [x, y] = projection([parseFloat(d.long), parseFloat(d.lat)]) || [0, 0];
                        const isHot = (orderStats[d.name] || 0) > 5;
                        const isActive = d.name === activeDistrict;

                        return (
                            <g key={i}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isActive ? 8 : (isHot ? 4 : 2)}
                                    fill={isActive ? "#FFA500" : (isHot ? "#D91976" : "#CBD5E1")}
                                    className="transition-all duration-500"
                                    opacity={isActive ? 1 : 0.6}
                                />
                                {isActive && (
                                    <circle cx={x} cy={y} r={12} stroke="#FFA500" strokeWidth={1} fill="none" className="animate-ping" />
                                )}
                            </g>
                        )
                    })}
                </svg>

                {/* The Pradip Animation Layer */}
                <AnimatePresence>
                    {lastOrderLocation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, y: 10 }}
                            animate={{ opacity: 1, scale: 1.5, y: 0 }}
                            exit={{ opacity: 0, scale: 0, y: -20, transition: { duration: 1 } }}
                            className="absolute pointer-events-none flex flex-col items-center"
                            style={{
                                left: lastOrderLocation.x,
                                top: lastOrderLocation.y - 20, // Adjust to sit on top of the dot
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-50 animate-pulse rounded-full"></div>
                                <PradipIcon />
                            </div>
                            <div className="mt-1 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                                {lastOrderLocation.district} • Order #{orderStats[lastOrderLocation.district] || 1}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-stone-200 p-3 rounded-lg shadow-sm text-xs">
                    <div className="font-bold text-stone-700 mb-1">Top Districts</div>
                    {Object.entries(orderStats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([name, count]) => (
                            <div key={name} className="flex justify-between gap-4">
                                <span>{name}</span>
                                <span className="font-bold">{count}</span>
                            </div>
                        ))}
                    {Object.keys(orderStats).length === 0 && <span className="text-stone-400">Waiting for live orders...</span>}
                </div>
            </div>
        </div>
    );
};
