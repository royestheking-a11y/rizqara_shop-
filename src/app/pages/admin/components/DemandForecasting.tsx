import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, ArrowRight, Activity, ShoppingBag, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '@/app/context/StoreContext';

interface InsightItem {
    id: string;
    product: any;
    type: 'alert' | 'bestseller' | 'prediction';
    message_en: string;
    message_bn: string;
    metric: string;
}

export const DemandForecasting = () => {
    const { products, orders, language } = useStore();
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<InsightItem[]>([]);

    const t = (en: string, bn: string) => language === 'bn' ? bn : en;

    useEffect(() => {
        analyzeData();
    }, [products, orders]);

    const analyzeData = () => {
        setLoading(true);
        setTimeout(() => {
            const calculatedInsights: InsightItem[] = [];
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Sales Analysis to map product IDs to quantity sold
            const salesCount: { [key: string]: number } = {};
            orders.forEach(o => {
                if (new Date(o.date) > sevenDaysAgo) {
                    o.items.forEach(i => salesCount[i.id] = (salesCount[i.id] || 0) + i.quantity);
                }
            });

            products.forEach(p => {
                const weeklySales = salesCount[p.id] || 0;

                // 1. Low Stock Alert (Stock < 5)
                if (p.stock < 5) {
                    calculatedInsights.push({
                        id: `alert-${p.id}`,
                        product: p,
                        type: 'alert',
                        message_en: "Low Stock Alert! Restock immediately.",
                        message_bn: "স্টক কম! অবিলম্বে রিস্টক করুন।",
                        metric: `${p.stock} left`
                    });
                }

                // 2. Best Sellers (Sold > 3 in last week) - Lowered threshold
                else if (weeklySales > 3) {
                    calculatedInsights.push({
                        id: `top-${p.id}`,
                        product: p,
                        type: 'bestseller',
                        message_en: "High Demand! Best Seller this week.",
                        message_bn: "উচ্চ চাহিদা! এই সপ্তাহের বেস্ট সেলার।",
                        metric: `${weeklySales} sold/week`
                    });
                }

                // 3. Predictions (Stock is healthy, but demand is picking up)
                else if (weeklySales > 1 && p.stock < 20) {
                    calculatedInsights.push({
                        id: `pred-${p.id}`,
                        product: p,
                        type: 'prediction',
                        message_en: "Trend Rising. Consider stocking up.",
                        message_bn: "চাহিদা বাড়ছে। স্টক বাড়ানো বিবেচনা করুন।",
                        metric: `Predicted: need 10+`
                    });
                }
            });

            // FALLBACK: If list is empty or short, add Healthy Stock items
            if (calculatedInsights.length < 3) {
                const remainingProducts = products.filter(p => !calculatedInsights.find(i => i.product.id === p.id));
                // Sort by stock high to low
                remainingProducts.sort((a, b) => b.stock - a.stock);

                remainingProducts.slice(0, 3 - calculatedInsights.length).forEach(p => {
                    calculatedInsights.push({
                        id: `info-${p.id}`,
                        product: p,
                        type: 'prediction', // reusing prediction style for general info
                        message_en: "Stock Healthy. Ready for orders.",
                        message_bn: "স্টক পর্যাপ্ত। অর্ডারের জন্য প্রস্তুত।",
                        metric: `${p.stock} units`
                    });
                });
            }

            // Prioritize Alerts > Best Sellers > Predictions
            calculatedInsights.sort((a, b) => {
                const map = { alert: 3, bestseller: 2, prediction: 1 };
                return map[b.type] - map[a.type];
            });

            setInsights(calculatedInsights.slice(0, 5)); // Show top 5
            setLoading(false);
        }, 1000);
    };

    if (loading) return (
        <div className="h-full bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center min-h-[400px]">
            <span className="text-xs text-stone-400 animate-pulse">{t('Analyzing Inventory...', 'ইনভেন্টরি বিশ্লেষণ করা হচ্ছে...')}</span>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col h-[600px] relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                        <span className="bg-stone-100 p-1.5 rounded-lg border border-stone-200">
                            <Activity className="text-stone-800" size={18} />
                        </span>
                        {t('Logic Center', 'লজিক সেন্টার')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 ml-11">
                        {t('Hybrid Automation & Insights', 'হাইব্রিড অটোমেশন এবং ইনসাইটস')}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-stone-200">
                <AnimatePresence>
                    {insights.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border flex gap-4 ${item.type === 'alert' ? 'bg-red-50 border-red-100' :
                                item.type === 'bestseller' ? 'bg-emerald-50 border-emerald-100' :
                                    'bg-blue-50 border-blue-100'
                                }`}
                        >
                            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-stone-100">
                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-stone-800 text-sm line-clamp-1">{language === 'bn' ? item.product.title_bn : item.product.title_en}</h4>
                                    {item.type === 'alert' && <AlertTriangle size={14} className="text-red-500" />}
                                    {item.type === 'bestseller' && <Zap size={14} className="text-emerald-500" />}
                                    {item.type === 'prediction' && <TrendingUp size={14} className="text-blue-500" />}
                                </div>

                                <p className={`text-xs mt-1 font-medium ${item.type === 'alert' ? 'text-red-600' :
                                    item.type === 'bestseller' ? 'text-emerald-600' :
                                        'text-blue-600'
                                    }`}>
                                    {t(item.message_en, item.message_bn)}
                                </p>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-stone-500 bg-white/50 px-2 py-0.5 rounded border border-stone-100">
                                        {item.metric}
                                    </span>

                                    {item.type === 'alert' && (
                                        <button className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700 transition">
                                            {t('Manage Stock', 'স্টক পরিচালনা')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {insights.length === 0 && (
                    <div className="text-center py-20 text-stone-400">
                        <ShoppingBag className="mx-auto mb-2 opacity-50" size={32} />
                        <p>{t('No urgent insights required.', 'কোন জরুরি ইনসাইট নেই।')}</p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                <Link to="/admin/products" className="text-xs font-medium text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 transition group">
                    {t('View Full Automations', 'সম্পূর্ণ অটোমেশন দেখুন')}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};
