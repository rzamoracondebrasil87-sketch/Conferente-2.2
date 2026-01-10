import React, { useEffect, useState } from 'react';
import { WeightData } from '../types';

interface Props {
  data: WeightData;
  targetWeightRaw: string;
  onTargetWeightChange: (val: string) => void;
  onWeightChange?: (newWeight: number) => void;
  supplier?: string;
  product?: string;
  hasPhoto?: boolean;
  onNextStep?: () => void;
  grossWeightRef?: React.RefObject<HTMLInputElement>;
}

const WeightCard: React.FC<Props> = ({ 
    data, targetWeightRaw, onTargetWeightChange, onWeightChange,
    onNextStep, grossWeightRef
}) => {
  const [isTargetFocused, setIsTargetFocused] = useState(false);
  
  // Timer for inactivity on Target Weight
  useEffect(() => {
    // CRITICAL FIX: Only run auto-jump logic if this specific field is focused
    if (!targetWeightRaw || !isTargetFocused) return;

    const timer = setTimeout(() => {
        if (targetWeightRaw.length > 0) {
            onNextStep?.();
        }
    }, 1000); // 1 second inactivity

    return () => clearTimeout(timer);
  }, [targetWeightRaw, onNextStep, isTargetFocused]);

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6b0fd4] to-[#4a0996] p-5 shadow-xl shadow-primary/30 group transition-all duration-300">
        
        {/* Decorative Blur Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10">
            {/* Header: Label & Status Indicator */}
            <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-wide font-display">Peso Líquido Total</span>
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-colors ${data.isStable ? 'bg-green-400' : 'bg-amber-400'}`}></div>
            </div>

            {/* Main Weight Display - Reduced Size */}
            <div className="flex items-baseline gap-1 mb-3">
                <h2 className="text-[2.75rem] leading-none font-bold text-white tracking-tighter font-display">
                    {data.net.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                </h2>
                <span className="text-xl text-white/60 font-medium font-display">kg</span>
            </div>

            {/* Sub-cards Grid - Rounder and Compact */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Peso Nota Input */}
                <div className={`rounded-2xl p-2.5 backdrop-blur-md border transition-all duration-300 ${isTargetFocused ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-black/20 border-white/5 hover:bg-black/30'}`}>
                    <p className="text-[9px] text-white/60 uppercase font-bold mb-0.5 tracking-wider font-display">Peso Nota</p>
                    <input 
                        type="number"
                        inputMode="decimal"
                        className="w-full bg-transparent border-none p-0 text-lg font-bold text-white placeholder:text-white/20 focus:ring-0 leading-none font-display"
                        placeholder="0,00"
                        value={targetWeightRaw}
                        onChange={(e) => onTargetWeightChange(e.target.value)}
                        onFocus={() => setIsTargetFocused(true)}
                        onBlur={() => setIsTargetFocused(false)}
                    />
                </div>

                {/* Peso Bruto Input/Display */}
                <div className="bg-black/20 rounded-2xl p-2.5 backdrop-blur-md border border-white/5 hover:bg-black/30 transition-colors focus-within:bg-black/40 focus-within:border-white/20">
                    <p className="text-[9px] text-white/60 uppercase font-bold mb-0.5 tracking-wider font-display">Peso Bruto</p>
                    <input 
                        ref={grossWeightRef}
                        type="number"
                        inputMode="decimal"
                        className="w-full bg-transparent border-none p-0 text-lg font-bold text-white placeholder:text-white/20 focus:ring-0 leading-none font-display"
                        placeholder="0,00"
                        value={data.current === 0 ? '' : data.current}
                        onChange={(e) => onWeightChange && onWeightChange(parseFloat(e.target.value) || 0)}
                        readOnly={!onWeightChange}
                    />
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex justify-between items-center text-[10px] text-white/70 border-t border-white/10 pt-2 font-display">
                <div className="flex items-center gap-2 pl-1">
                    <span className="font-medium">Tara:</span>
                    <span className="font-bold font-mono text-white">{data.tare.toFixed(3)} kg</span>
                </div>
            </div>
        </div>
    </section>
  );
};

export default WeightCard;