import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
    const baseClasses = "bg-gray-200 animate-pulse";
    const variantClasses = {
        rectangular: "rounded-lg",
        circular: "rounded-full",
        text: "rounded h-4 w-3/4"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
};

export const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-full p-0">
            <div className="aspect-[4/5] bg-gray-200 animate-pulse relative">
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-300" />
            </div>
            <div className="p-4 space-y-3">
                <Skeleton variant="text" className="w-1/3 h-3" />
                <Skeleton variant="text" className="w-full h-5" />
                <div className="flex gap-1 py-1">
                    <Skeleton variant="rectangular" className="w-4 h-4" />
                    <Skeleton variant="rectangular" className="w-4 h-4" />
                    <Skeleton variant="rectangular" className="w-4 h-4" />
                    <Skeleton variant="rectangular" className="w-4 h-4" />
                    <Skeleton variant="rectangular" className="w-4 h-4" />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <Skeleton variant="text" className="w-1/2 h-6" />
                    <Skeleton variant="text" className="w-1/4 h-3" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Skeleton variant="rectangular" className="h-9 w-full rounded-lg" />
                    <Skeleton variant="rectangular" className="h-9 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export const CarouselSkeleton: React.FC = () => {
    return (
        <div className="relative aspect-video sm:aspect-auto sm:h-[350px] md:h-[400px] overflow-hidden rounded-xl mx-4 my-6 bg-gray-200 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-8 h-1.5 bg-gray-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            </div>
        </div>
    );
};
