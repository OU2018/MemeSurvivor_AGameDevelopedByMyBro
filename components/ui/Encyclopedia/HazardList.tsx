
import React from 'react';
import { HAZARDS } from '../../../data/hazards';

export const HazardList: React.FC = () => {
    return (
        <div className="space-y-6 animate-pop-in pb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-2">职场危害 (环境突变)</h2>
            <p className="text-slate-400 text-sm mb-6 bg-red-900/20 p-3 rounded border border-red-900/50">
                警告：在无尽加班模式中，每过 5 波环境会发生一次不可逆的恶化。以下是已知的职场危害。
            </p>
            
            <div className="grid gap-4">
                {HAZARDS.map((hazard) => {
                    return (
                        <div 
                            key={hazard.id} 
                            className="p-4 rounded-xl shadow-md transition-all bg-slate-800 border-l-4"
                            style={{ borderLeftColor: hazard.color }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700">
                                    {hazard.icon}
                                </span>
                                <div>
                                    <h3 className="text-xl font-black" style={{ color: hazard.color }}>{hazard.name}</h3>
                                </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-slate-300 leading-relaxed pl-16">
                                {hazard.description}
                            </div>

                            {hazard.quote && (
                                <div className="mt-3 ml-16 bg-black/30 p-2 rounded border-l-2 border-slate-600 italic text-slate-500 text-xs">
                                    {hazard.quote}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
