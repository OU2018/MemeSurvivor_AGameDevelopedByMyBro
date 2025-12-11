
import React from 'react';
import { GLOSSARY_TERMS } from '../../../data/memeContent';

export const GlossaryList: React.FC = () => {
    return (
        <div className="space-y-4 animate-pop-in">
            <h2 className="text-2xl font-bold text-white mb-6">职场黑话词典</h2>
            <div className="grid gap-4">
                {GLOSSARY_TERMS.map((term, idx) => {
                    // Split definition and roast by '——'
                    const parts = term.desc.split('——');
                    const definition = parts[0];
                    const roast = parts[1] || "";

                    return (
                        <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">{term.title}</h3>
                            <div className="text-slate-300 leading-relaxed">
                                <span>{definition}</span>
                                {roast && (
                                    <>
                                        <br/>
                                        <span className="text-yellow-500/80 italic text-sm mt-1 block">—— {roast}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
