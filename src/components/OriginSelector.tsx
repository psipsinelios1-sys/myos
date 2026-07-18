import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StartingOrigin } from '../types';

interface OriginSelectorProps {
  onSelectOrigin: (origin: StartingOrigin) => void;
}

export const OriginSelector: React.FC<OriginSelectorProps> = ({ onSelectOrigin }) => {
  const [selected, setSelected] = useState<StartingOrigin | null>(null);

  const origins = [
    {
      id: 'NORMAL_STARTUP' as StartingOrigin,
      name: 'Normal Startup',
      tagline: 'The classic Silicon Valley journey.',
      cash: 'Customizable',
      equity: 'Customizable',
      hardware: 'Customizable',
      perk: 'No special perks or penalties. You will pick your own Seed Capital Funding step.',
      color: 'from-blue-600 to-indigo-600',
      borderColor: 'border-blue-500'
    },
    {
      id: 'GARAGE_HACKER' as StartingOrigin,
      name: 'Garage Hacker',
      tagline: 'Bootstrapped and brilliant.',
      cash: '$50,000',
      equity: '100%',
      hardware: '200 TFLOPS (Aging GPUs)',
      perk: 'Founder generates 50% more manual Research Points. Very low overhead.',
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'border-emerald-500'
    },
    {
      id: 'NEPO_BABY' as StartingOrigin,
      name: 'The Nepo Baby',
      tagline: 'Unlimited runway, zero respect.',
      cash: '$100,000,000',
      equity: '100%',
      hardware: '10,000 TFLOPS',
      perk: 'Start with incredible wealth. However, founder stats are terrible, staff costs are doubled, and public sentiment is permanently lower.',
      color: 'from-rose-600 to-pink-600',
      borderColor: 'border-rose-500'
    },
    {
      id: 'DESPERATE_PIVOT' as StartingOrigin,
      name: 'Desperate Pivot',
      tagline: 'A ticking debt time bomb.',
      cash: '$250,000',
      equity: '100%',
      hardware: '2,500 TFLOPS',
      perk: 'Start with -$5,000,000 corporate debt ($50k/mo interest). However, your survival instinct doubles all app/API revenue.',
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="text-center mb-10 max-w-2xl mt-20">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4 tracking-tight">
          CHOOSE YOUR ORIGIN
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The background of your company dictates your starting capital, compute power, and unique operational perks. Choose wisely—your origin permanently alters your strategic path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full pb-20">
        {origins.map((orig) => (
          <motion.div
            key={orig.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(orig.id)}
            className={`relative p-6 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-200 ${
              selected === orig.id 
                ? `bg-slate-900 border-2 ${orig.borderColor} shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] shadow-${orig.borderColor.split('-')[1]}-500/30` 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            {selected === orig.id && (
              <div className={`absolute inset-0 bg-gradient-to-br ${orig.color} opacity-10 pointer-events-none`} />
            )}
            
            <h3 className="text-xl font-bold text-slate-100 mb-1">{orig.name}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">{orig.tagline}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Starting Cash</span>
                <span className="text-sm text-emerald-400 font-mono font-bold">{orig.cash}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Equity</span>
                <span className="text-sm text-cyan-400 font-mono font-bold">{orig.equity}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Initial Hardware</span>
                <span className="text-sm text-indigo-400 font-mono font-bold">{orig.hardware}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Origin Trait</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 min-h-[60px]">
                {orig.perk}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-10">
        <button
          onClick={() => selected && onSelectOrigin(selected)}
          disabled={!selected}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-12 py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all text-sm uppercase tracking-wider font-mono"
        >
          {selected ? 'Initialize Company' : 'Select an Origin'}
        </button>
      </div>
    </div>
  );
};
