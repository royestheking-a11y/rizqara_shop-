
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Package, ArrowRight, RefreshCcw, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import { Product } from '@/app/context/StoreContext';

interface ForecastItem {
    id: string;
    name_en: string;
    name_bn: string;
    currentStock: number;
    salesVelocity: number; // Avg sales per week
    daysRemaining: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'overstock';
    trend: 'up' | 'down' | 'stable';
    image?: string;
}

export const DemandForecasting = () => {
    const { products, orders, language } = useStore();
    const [loading, setLoading] = useState(true);
    const [forecasts, setForecasts] = useState<ForecastItem[]>([]);

    const t = (en: string, bn: string) => language === 'bn' ? bn : en;

    useEffect(() => {
        analyzeData();
    }, [products, orders]);

    const analyzeData = () => {
        setLoading(true);
        // Simulate "AI Processing" time for effect, but effectively instant
        setTimeout(() => {
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);

            // 1. Calculate Sales Velocity (Last 30 Days)
            const productSales: { [key: string]: number } = {};
            const recentSales: { [key: string]: number } = {}; // Last 7 days for trend

            orders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate >= thirtyDaysAgo && order.status !== 'cancelled' && order.status !== 'refunded') {
                    order.items.forEach(item => {
                        // Handle both id formats if necessary
                        const pid = item.id;
                        productSales[pid] = (productSales[pid] || 0) + item.quantity;

                        // Trend calc (Last 7 days)
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(now.getDate() - 7);
                        if (orderDate >= sevenDaysAgo) {
                            recentSales[pid] = (recentSales[pid] || 0) + item.quantity;
                        }
                    });
                }
            });

            // 2. Map to Forecast Items
            const insights: ForecastItem[] = products.map(product => {
                const totalSold30Days = productSales[product.id] || 0;
                const weeklyVelocity = (totalSold30Days / 30) * 7;
                const dailyVelocity = totalSold30Days / 30;

                // Avoid division by zero
                const effectiveDailyVelocity = dailyVelocity === 0 ? 0.1 : dailyVelocity;
                const daysRemaining = product.stock / effectiveDailyVelocity;

                let riskLevel: ForecastItem['riskLevel'] = 'low';
                if (product.stock === 0) riskLevel = 'critical';
                else if (daysRemaining < 7) riskLevel = 'high';
                else if (daysRemaining < 14) riskLevel = 'medium';
                else if (daysRemaining > 60 && dailyVelocity > 0) riskLevel = 'overstock';

                // Trend Analysis
                // If last 7 days sales > (30 days avg / 4) * 1.2 -> Up
                const recentAvg = recentSales[product.id] || 0;
                const expectedWeekly = weeklyVelocity;

                let trend: 'up' | 'down' | 'stable' = 'stable';
                if (recentAvg > expectedWeekly * 1.2) trend = 'up';
                else if (recentAvg < expectedWeekly * 0.8) trend = 'down';

                return {
                    id: product.id,
                    name_en: product.title_en,
                    name_bn: product.title_bn,
                    currentStock: product.stock,
                    salesVelocity: parseFloat(weeklyVelocity.toFixed(1)),
                    daysRemaining: Math.floor(daysRemaining),
                    riskLevel,
                    trend,
                    image: product.images[0]
                };
            });

            // 3. Sort by Urgency (Critical > High > Medium > Trending Up)
            const sortedInsights = insights.sort((a, b) => {
                const riskScore = { critical: 5, high: 4, medium: 3, overstock: 2, low: 1 };
                return riskScore[b.riskLevel] - riskScore[a.riskLevel];
            });

            setForecasts(sortedInsights.slice(0, 5)); // Show top 5 insights
            setLoading(false);
        }, 800);
    };

    if (loading) return (
        <div className="h-full bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3 text-stone-400">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={16} className="text-stone-800" />
                    </div>
                </div>
                <span className="text-xs font-medium tracking-wider animate-pulse">
                    {t('ANALYZING SALES DATA...', 'বিক্রয় তথ্য বিশ্লেষণ করা হচ্ছে...')}
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100 flex flex-col h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h3 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                        <span className="bg-stone-100 p-1.5 rounded-lg border border-stone-200">
                            <TrendingUp className="text-stone-800" size={18} />
                        </span>
                        {t('The Logic Center', 'লজিক সেন্টার')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 ml-11">
                        {t('Predictive Inventory & Demand Insights', 'ভবিষ্যদ্বাণীমূলক ইনভেন্টরি এবং চাহিদা')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">
                        {t('LIVE AI', 'লাইভ এআই')}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-stone-200 z-10 max-h-[400px]">
                <AnimatePresence>
                    {forecasts.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border relative bg-white hover:bg-stone-50 transition-colors group/card ${item.riskLevel === 'critical' ? 'border-red-200 shadow-sm shadow-red-100' :
                                    item.riskLevel === 'high' ? 'border-orange-200 shadow-sm shadow-orange-100' :
                                        item.riskLevel === 'overstock' ? 'border-blue-200' : 'border-stone-100'
                                }`}
                        >
                            <div className="flex gap-4">
                                {/* Product Image */}
                                <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name_en} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <Package size={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-stone-800 text-sm line-clamp-1">
                                            {t(item.name_en, item.name_bn)}
                                        </h4>

                                        {/* Status Badge */}
                                        {item.riskLevel === 'critical' && (
                                            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap border border-red-200">
                                                <AlertCircle size={10} /> {t('Out of Stock', 'স্টক শেষ')}
                                            </span>
                                        )}
                                        {item.riskLevel === 'high' && (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap border border-orange-200">
                                                <AlertTriangle size={10} /> {t('Restock Soon', 'দ্রুত রিস্টক করুন')}
                                            </span>
                                        )}
                                        {item.riskLevel === 'overstock' && (
                                            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap border border-blue-100">
                                                <Package size={10} /> {t('Overstocked', 'অতিরিক্ত স্টক')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-end justify-between mt-2">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                            <div>
                                                <p className="text-[10px] text-stone-400 uppercase tracking-wider">{t('Stock', 'স্টক')}</p>
                                                <p className={`text-sm font-bold ${item.currentStock < 5 ? 'text-red-500' : 'text-stone-700'}`}>
                                                    {item.currentStock} {t('units', 'টি')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-stone-400 uppercase tracking-wider">{t('Demand/Wk', 'চাহিদা/সপ্তাহ')}</p>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm font-bold text-stone-700">
                                                        {item.salesVelocity}
                                                    </p>
                                                    {item.trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                                                    {item.trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prediction Message */}
                                        <div className="text-right">
                                            {item.daysRemaining < 30 ? (
                                                <p className="text-[10px] text-stone-500">
                                                    {t('Stock lasts:', 'স্টক থাকবে:')} <span className={`font-bold ${item.daysRemaining < 7 ? 'text-red-500' : 'text-stone-700'}`}>{item.daysRemaining} {t('days', 'দিন')}</span>
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-stone-400">{t('Healthy Stock', 'পর্যাপ্ত স্টক')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {forecasts.length === 0 && (
                        <div className="text-center py-12 text-stone-400">
                            <Package size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{t('Inventory looks healthy!', 'ইনভেন্টরি ঠিক আছে!')}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 text-center z-10">
                <Link to="/admin/products" className="text-xs font-medium text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 transition group">
                    {t('View Full Inventory Analytics', 'সম্পূর্ণ ইনভেন্টরি বিশ্লেষণ দেখুন')}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};
