/**
 * GenderChart Component
 * 
 * Vanilla SVG donut chart for gender distribution
 */

'use client';

import { GenderDistribution } from '../types';

interface GenderChartProps {
    data: GenderDistribution;
}

export function GenderChart({ data }: GenderChartProps) {
    const total = data.male + data.female + data.other;
    
    if (total === 0) return <div className="text-center p-8 text-muted-foreground italic">No data</div>;

    const malePerc = (data.male / total) * 100;
    const femalePerc = (data.female / total) * 100;
    const otherPerc = (data.other / total) * 100;

    // SVG parameters
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const strokeWidth = 30;
    const circumference = 2 * Math.PI * radius;

    // Offsets
    const maleOffset = 0;
    const femaleOffset = (malePerc / 100) * circumference;
    const otherOffset = ((malePerc + femalePerc) / 100) * circumference;

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 self-start">Gender Distribution</h3>
            
            <div className="relative w-[200px] h-[200px]">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    {/* Other */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="transparent"
                        stroke="#e2e8f0" // slate-200
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${(otherPerc / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-otherOffset}
                    />
                    {/* Female */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="transparent"
                        stroke="#ec4899" // pink-500
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${(femalePerc / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-femaleOffset}
                    />
                    {/* Male */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="transparent"
                        stroke="#3b82f6" // blue-500
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${(malePerc / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-maleOffset}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-foreground">{total}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-[200px]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-foreground">Male: {malePerc.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-xs font-semibold text-foreground">Female: {femalePerc.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-xs font-semibold text-foreground">Other: {otherPerc.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
}
