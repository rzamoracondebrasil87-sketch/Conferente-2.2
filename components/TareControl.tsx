import React, { useState, useEffect, useRef } from 'react';
import { TareMode } from '../types';

interface Props {
  mode: TareMode;
  onChange: (mode: TareMode) => void;
  onResetTare: () => void;
  onTareChange?: (value: number) => void;
  currentTare: number; 
  quantity: number;
  onQuantityChange: (qty: number) => void;
  packagingUnitWeight: number; 
  onPackagingUnitWeightChange: (val: number) => void;
  packagingQuantity: number;
  onPackagingQuantityChange: (val: number) => void;
  quantityRef?: React.RefObject<HTMLInputElement>;
  onNextStep?: () => void;
}

const TareControl: React.FC<Props> = ({ 
  mode, onChange, onResetTare, onTareChange, currentTare, quantity, onQuantityChange,
  packagingUnitWeight, onPackagingUnitWeightChange, packagingQuantity, onPackagingQuantityChange, quantityRef, onNextStep
}) => {
  const [localUnitTareStr, setLocalUnitTareStr] = useState(currentTare > 0 ? (currentTare * 1000).toString() : '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeInput, setActiveInput] = useState<'qty' | 'unit' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Ref for the Weight input (Unit Tare)
  const unitTareInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const val = currentTare * 1000;
    if (Math.abs(parseFloat(localUnitTareStr || '0') - val) > 0.1) {
         setLocalUnitTareStr(currentTare === 0 ? '' : parseFloat(val.toFixed(1)).toString());
    }
  }, [currentTare]);

  // Clean up timer on unmount
  useEffect(() => {
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, []);

  // Logic to jump from Qty -> Weight
  const handleQuantityChangeWrapped = (val: number) => {
      onQuantityChange(val);
      
      if (timerRef.current) clearTimeout(timerRef.current);

      // Auto-jump only if this field is active and value > 0
      if (activeInput === 'qty' && val > 0) {
          timerRef.current = setTimeout(() => {
              unitTareInputRef.current?.focus();
          }, 1000);
      }
  };

  // Logic to jump from Weight -> Next (Gross Weight)
  const handleUnitTareStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalUnitTareStr(val);
    const grams = parseFloat(val);
    
    if (!isNaN(grams)) {
        if (onTareChange) onTareChange(grams / 1000);
        
        if (timerRef.current) clearTimeout(timerRef.current);

        // Auto-jump to Gross Weight if weight entered and field is active
        if (activeInput === 'unit' && grams > 0) {
            timerRef.current = setTimeout(() => {
                onNextStep?.();
            }, 1000);
        }
    }
  };

  const handlePkgWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const grams = parseFloat(e.target.value);
      if (!isNaN(grams)) {
          onPackagingUnitWeightChange(grams / 1000);
          if (grams > 0 && !packagingQuantity) onPackagingQuantityChange(1);
      } else {
          onPackagingUnitWeightChange(0);
      }
  };

  const totalCalculatedTare = (quantity * currentTare) + (packagingQuantity * packagingUnitWeight);

  const toggleExpand = () => {
      const newState = !isExpanded;
      setIsExpanded(newState);
      
      if (newState) {
          // Open Logic: Reset quantity to allow immediate typing and focus
          if (quantity <= 1) onQuantityChange(0); 
          
          setTimeout(() => {
              if (quantityRef?.current) {
                  quantityRef.current.focus();
              }
          }, 150); 
      }
  };

  return (
    <div>
        <label className="text-xs font-bold text-on-surface-variant/80 ml-3 mb-1.5 block uppercase tracking-wider font-display">
            Configuração de Tara
        </label>
        <section className={`bg-surface shadow-sm transition-all duration-300 overflow-hidden ${isExpanded ? 'rounded-[2rem]' : 'rounded-[2.5rem]'}`}>
        
        {/* Header / Toggle Trigger */}
        <div 
            className="flex items-center justify-between p-4 cursor-pointer active:bg-surface-container-high/30 transition-colors select-none" 
            onClick={toggleExpand}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${totalCalculatedTare > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-xl">tune</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface font-display leading-none">Ajuste Manual</span>
                    {totalCalculatedTare > 0 ? (
                        <span className="text-[10px] font-bold text-primary mt-1">
                            -{totalCalculatedTare.toFixed(3)}kg
                        </span>
                    ) : (
                    <span className="text-[10px] font-medium text-on-surface-variant mt-1">
                            Toque para abrir
                        </span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {!isExpanded && (
                    <>
                    {(quantity > 1 || currentTare > 0) && (
                        <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-lg">
                            <span className="material-symbols-rounded text-[14px] text-primary">package_2</span>
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[9px] font-bold text-on-surface">{quantity}x</span>
                                {currentTare > 0 && <span className="text-[7px] font-medium text-on-surface-variant">{(currentTare * 1000).toFixed(0)}g</span>}
                            </div>
                        </div>
                    )}
                    
                    {(packagingQuantity > 0 || packagingUnitWeight > 0) && (
                        <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-lg">
                            <span className="material-symbols-rounded text-[14px] text-orange-400">pallet</span>
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[9px] font-bold text-on-surface">{packagingQuantity}x</span>
                                {packagingUnitWeight > 0 && <span className="text-[7px] font-medium text-on-surface-variant">{(packagingUnitWeight * 1000).toFixed(0)}g</span>}
                            </div>
                        </div>
                    )}
                    </>
                )}
                
                <span className={`material-symbols-rounded text-on-surface-variant transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
            <div className="flex flex-col gap-3 px-4 pb-4 pt-0 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="w-full h-px bg-outline-variant/10 mb-2"></div>

                <div className="flex bg-surface-container-high rounded-2xl p-1 relative mb-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChange('manual'); }} 
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all ${mode === 'manual' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Manual
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChange('none'); onResetTare(); setLocalUnitTareStr(''); }} 
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all ${mode === 'none' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Sem Tara
                    </button>
                </div>

                {mode === 'manual' && (
                    <div className="flex flex-col gap-3">
                        
                        {/* Item Box Row */}
                        <div className="bg-surface-container-low rounded-[1.5rem] p-3 border border-transparent dark:border-white/5">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Item / Unidade</span>
                            </div>
                            <div className="grid grid-cols-[1fr_1.5fr] gap-2">
                                {/* Quantity Input */}
                                <div className={`bg-surface-container rounded-2xl flex items-center px-2 py-2 relative transition-all ${activeInput === 'qty' ? 'ring-1 ring-primary/50' : ''}`}>
                                    <span className="material-symbols-rounded text-primary text-lg mr-1 ml-1">package_2</span>
                                    <input 
                                        ref={quantityRef}
                                        type="number"
                                        className="w-full bg-transparent border-none p-0 text-center text-sm font-bold text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
                                        value={quantity === 0 ? '' : quantity}
                                        placeholder="0"
                                        onChange={(e) => handleQuantityChangeWrapped(parseInt(e.target.value) || 0)}
                                        onFocus={() => setActiveInput('qty')}
                                        onBlur={() => setActiveInput(null)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                
                                {/* Weight Input */}
                                <div className={`bg-surface-container rounded-2xl flex items-center px-3 py-2 relative transition-all ${activeInput === 'unit' ? 'ring-1 ring-primary/50' : ''}`}>
                                    <input 
                                        ref={unitTareInputRef}
                                        type="text"
                                        inputMode="decimal"
                                        className="w-full bg-transparent border-none p-0 text-right text-sm font-bold text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
                                        value={localUnitTareStr}
                                        placeholder="0"
                                        onChange={handleUnitTareStringChange}
                                        onFocus={() => setActiveInput('unit')}
                                        onBlur={() => setActiveInput(null)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-xs font-bold text-on-surface-variant ml-1">g</span>
                                </div>
                            </div>
                        </div>

                        {/* Packaging/Pallet Box Row */}
                        <div className="bg-surface-container-low rounded-[1.5rem] p-3 border border-transparent dark:border-white/5">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Embalagem Extra</span>
                            </div>
                            <div className="grid grid-cols-[1fr_1.5fr] gap-2">
                                <div className="bg-surface-container rounded-2xl flex items-center px-2 py-2 relative focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                                    <span className="material-symbols-rounded text-orange-400 text-lg mr-1 ml-1">pallet</span>
                                    <input 
                                        type="number"
                                        className="w-full bg-transparent border-none p-0 text-center text-sm font-bold text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
                                        value={packagingQuantity || ''}
                                        placeholder="0"
                                        onChange={(e) => onPackagingQuantityChange(parseInt(e.target.value) || 0)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                
                                <div className="bg-surface-container rounded-2xl flex items-center px-3 py-2 relative focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                                    <input 
                                        type="number"
                                        inputMode="decimal"
                                        className="w-full bg-transparent border-none p-0 text-right text-sm font-bold text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
                                        value={packagingUnitWeight > 0 ? (packagingUnitWeight * 1000) : ''}
                                        placeholder="0"
                                        onChange={handlePkgWeightChange}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-xs font-bold text-on-surface-variant ml-1">g</span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        )}
        </section>
    </div>
  );
};

export default TareControl;