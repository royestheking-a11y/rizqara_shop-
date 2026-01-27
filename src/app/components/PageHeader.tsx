import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/app/context/StoreContext';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs: { label: string; path: string }[];
    backgroundImage?: string;
}

export const PageHeader = ({ title, subtitle, breadcrumbs, backgroundImage }: PageHeaderProps) => {
    const { t } = useStore();

    return (
        <div className="relative bg-gray-900 text-white py-24 overflow-hidden">
            {/* Background Image - Made more visible */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                    backgroundImage: `url(${backgroundImage || 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&q=80'})`
                }}
            />

            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Gradient Overlay - Lighter to show image */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/40" />

            <div className="container mx-auto px-4 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 animate-fade-in-up">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-gray-300 text-lg max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {subtitle}
                    </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Link to="/" className="hover:text-white transition">
                        {t('হোম', 'Home')}
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            <ChevronRight size={14} />
                            <Link
                                to={crumb.path}
                                className={`transition ${idx === breadcrumbs.length - 1 ? 'text-[#D91976] font-medium pointer-events-none' : 'hover:text-white'}`}
                            >
                                {crumb.label}
                            </Link>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};
