
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Package, ArrowRight, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router';

interface ForecastItem {
    id: string;
    name: string;
    currentStock: number;
    predictedDemand: number;
    trend: 'up' | 'down' | 'stable';
    riskLevel: 'high' | 'medium' | 'low';
}

export const DemandForecasting = () => {
    const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Data Generation (Simulating AI Analysis)
    useEffect(() => {
        setTimeout(() => {
            setForecasts([
                { id: '1', name: 'Hand-painted Earthen Vase', currentStock: 5, predictedDemand: 15, trend: 'up', riskLevel: 'high' },
                { id: '2', name: 'Nakshi Kantha Wall Mat', currentStock: 12, predictedDemand: 20, trend: 'up', riskLevel: 'medium' },
                { id: '3', name: 'Terracotta Table Lamp', currentStock: 8, predictedDemand: 6, trend: 'down', riskLevel: 'low' },
                { id: '4', name: 'Jute Floor Rug (Large)', currentStock: 2, predictedDemand: 8, trend: 'up', riskLevel: 'high' },
            ]);
            setLoading(false);
        }, 1500);
    }, []);

    const handleSendRestockRequest = (id: string) => {
        alert(`Restock request sent to Karigar API for Item #${id}`);
        // Logic to update UI to "Request Sent"
    };

    if (loading) return (
        <div className="h-full bg-white p-6 rounded-2xl shadow-lg border border-stone-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-stone-400">
                <RefreshCcw className="animate-spin" />
                <span className="text-xs">Analyzing historical sales data...</span>
            </div>
        </div>
    );

    return (
        <div className="h-full bg-white p-6 rounded-2xl shadow-lg border border-stone-100 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                        <TrendingUp className="text-stone-700" size={20} />
                        The Logic Center
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">Predictive Inventory & Demand Forecasting</p>
                </div>
                <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-100 font-medium">
                    AI Active
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                {forecasts.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border-l-4 relative bg-stone-50 ${item.riskLevel === 'high' ? 'border-l-red-500' :
                            item.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                            }`}
                    >
                        {/* Blinking Warning for High Risk */}
                        {item.riskLevel === 'high' && (
                            <div className="absolute right-4 top-4">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-start pr-6">
                            <h4 className="font-semibold text-stone-800 text-sm">{item.name}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 mb-3">
                            <div>
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider">Current Stock</p>
                                <p className={`text-lg font-bold ${item.currentStock < 5 ? 'text-red-600' : 'text-stone-700'}`}>
                                    {item.currentStock}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider">Next Week Demand</p>
                                <p className="text-lg font-bold text-stone-700 flex items-center gap-1">
                                    {item.predictedDemand}
                                    {item.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                                </p>
                            </div>
                        </div>

                        {item.riskLevel === 'high' && (
                            <div className="flex items-center gap-2 mb-3 bg-red-50 p-2 rounded text-red-700 text-xs border border-red-100">
                                <AlertTriangle size={14} />
                                <span>High Risk: Stockout likely within 3 days!</span>
                            </div>
                        )}

                        <button
                            onClick={() => handleSendRestockRequest(item.id)}
                            className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <Package size={14} />
                            Send "Update Stock" Request to Karigar
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                <Link to="/admin/products" className="text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 transition">
                    View Full Inventory Analysis <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
};
