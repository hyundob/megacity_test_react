import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GradientCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    gradient: string;
    shadowColor?: string;
    textColor?: 'light' | 'dark';
    className?: string;
}

export default function GradientCard({
    children,
    title,
    subtitle,
    icon: Icon,
    gradient,
    shadowColor = 'rgba(0, 0, 0, 0.1)',
    textColor = 'dark',
    className = ''
}: GradientCardProps) {
    const isLight = textColor === 'light';
    const textClasses = isLight ? 'text-white' : 'text-gray-900';
    const subtitleClasses = isLight ? 'text-white/80' : 'text-gray-500';
    const iconBgClasses = isLight ? 'bg-white/20' : 'bg-white';
    const iconColorClasses = isLight ? 'text-white' : 'text-gray-700';
    const contentBgClasses = isLight ? 'bg-white/10' : 'bg-white/10';

    return (
        <div
            className={`p-6 rounded-2xl ${className}`}
            style={{
                background: gradient,
                border: isLight ? 'none' : '1px solid rgba(148, 163, 184, 0.25)',
                boxShadow: `0 10px 25px -5px ${shadowColor}`
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className={`text-xl font-bold ${textClasses}`}>{title}</h2>
                    {subtitle && (
                        <p className={`text-xs ${subtitleClasses} mt-1`}>{subtitle}</p>
                    )}
                </div>
                <div className={`w-12 h-12 ${iconBgClasses} rounded-xl flex items-center justify-center ${isLight ? 'backdrop-blur-sm' : 'shadow-sm'}`}>
                    <Icon className={`w-6 h-6 ${iconColorClasses}`} />
                </div>
            </div>
            <div className={`${contentBgClasses} rounded-lg p-3 ${isLight ? 'backdrop-blur-sm' : ''}`}>
                {children}
            </div>
        </div>
    );
}

