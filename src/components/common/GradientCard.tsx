import React from 'react';
import { LucideIcon } from 'lucide-react';

const GLASS_ICON_CLASSES: Record<string, string> = {
    blue:    'icon-box icon-box-blue',
    orange:  'icon-box icon-box-orange',
    cyan:    'icon-box icon-box-cyan',
    amber:   'icon-box icon-box-amber',
    emerald: 'icon-box icon-box-emerald',
    violet:  'icon-box icon-box-violet',
    pink:    'icon-box icon-box-pink',
    teal:    'icon-box icon-box-teal',
};

const GLASS_ICON_COLORS: Record<string, string> = {
    blue:    'text-blue-500 dark:text-blue-400',
    orange:  'text-orange-500 dark:text-orange-400',
    cyan:    'text-cyan-500 dark:text-cyan-400',
    amber:   'text-amber-500 dark:text-amber-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet:  'text-violet-500 dark:text-violet-400',
    pink:    'text-pink-500 dark:text-pink-400',
    teal:    'text-teal-500 dark:text-teal-400',
};

interface GradientCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    gradient: string;
    shadowColor?: string;
    textColor?: 'light' | 'dark';
    className?: string;
    glass?: boolean;
    glassColor?: string;
}

export default function GradientCard({
    children,
    title,
    subtitle,
    icon: Icon,
    gradient,
    shadowColor = 'rgba(0, 0, 0, 0.1)',
    textColor = 'dark',
    className = '',
    glass = false,
    glassColor = 'blue',
}: GradientCardProps) {
    if (glass) {
        const iconBoxClass = GLASS_ICON_CLASSES[glassColor] ?? 'icon-box icon-box-blue';
        const iconColorClass = GLASS_ICON_COLORS[glassColor] ?? 'text-blue-500 dark:text-blue-400';
        return (
            <div className={`p-6 glass-card glass-card-${glassColor} ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
                        {subtitle && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={iconBoxClass}>
                        <Icon className={`w-6 h-6 ${iconColorClass}`} />
                    </div>
                </div>
                <div className="bg-black/5 dark:bg-black/20 rounded-lg p-3 border border-black/8 dark:border-white/5">
                    {children}
                </div>
            </div>
        );
    }

    // Legacy light mode (fallback)
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
