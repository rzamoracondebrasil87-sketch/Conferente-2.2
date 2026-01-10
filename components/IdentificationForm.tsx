import React, { useRef, useEffect, useState } from 'react';
import { IdentificationData } from '../types';
import { predict } from '../utils/learningSystem';

interface Props {
  data: IdentificationData;
  onChange: (data: IdentificationData) => void;
  knownSuppliers?: string[];
  knownProducts?: string[];
  onSupplierMatch?: (supplier: string) => void;
  supplierRef?: React.RefObject<HTMLInputElement>;
  onNextStep?: () => void;
}

interface InputFieldProps {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: string;
    id: string;
    list?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, icon, id, list, onBlur, onFocus, placeholder, inputRef }) => {
    return (
        <div>
            <label htmlFor={id} className="text-xs font-bold text-on-surface-variant/80 ml-3 mb-1.5 block uppercase tracking-wider font-display">{label}</label>
            <div className="bg-surface hover:bg-surface-container transition-colors rounded-[2rem] p-4 flex items-center gap-3 group cursor-pointer relative focus-within:bg-surface-container shadow-sm">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">{icon}</span>
                <input 
                    ref={inputRef}
                    id={id}
                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    list={list}
                    autoComplete="off"
                    placeholder={placeholder || "Selecione ou digite..."}
                />
                <span className="material-symbols-outlined text-on-surface-variant/50 pointer-events-none">expand_more</span>
            </div>
        </div>
    );
};

const IdentificationForm: React.FC<Props> = ({ data, onChange, knownSuppliers = [], knownProducts = [], onSupplierMatch, supplierRef, onNextStep }) => {
  const productInputRef = useRef<HTMLInputElement>(null);
  
  const [activeField, setActiveField] = useState<'supplier' | 'product' | null>(null);

  // Timer Ref
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup
  useEffect(() => {
      return () => {
          if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      };
  }, []);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({ ...data, supplier: val });
    
    if (knownSuppliers.some(s => s.toLowerCase() === val.toLowerCase())) {
        if (onSupplierMatch) onSupplierMatch(val);
    }

    if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);

    // Only set timer if this field is active
    if (activeField === 'supplier' && val.trim().length > 0) {
        sequenceTimerRef.current = setTimeout(() => {
            productInputRef.current?.focus();
        }, 1000);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange({ ...data, product: val });

      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);

      if (activeField === 'product' && val.trim().length > 0) {
          sequenceTimerRef.current = setTimeout(() => {
              onNextStep?.();
          }, 1000);
      }
  };

  const handleSupplierBlur = () => {
    setActiveField(null);
    if (data.supplier && !data.product) {
      const prediction = predict(data.supplier);
      if (prediction) onChange({ ...data, product: prediction.product });
    }
  };

  return (
    <section className="flex flex-col gap-3">
        <datalist id="suppliers-list">
            {knownSuppliers.map((s, i) => <option key={`${s}-${i}`} value={s} />)}
        </datalist>
        <datalist id="products-list">
            {knownProducts.map((p, i) => <option key={`${p}-${i}`} value={p} />)}
        </datalist>

        <InputField 
            inputRef={supplierRef}
            id="supplier"
            label="Fornecedor"
            value={data.supplier}
            onChange={handleSupplierChange}
            onFocus={() => setActiveField('supplier')}
            onBlur={handleSupplierBlur}
            icon="local_shipping"
            list="suppliers-list"
        />

        <InputField 
            inputRef={productInputRef}
            id="product"
            label="Produto"
            value={data.product}
            onChange={handleProductChange}
            onFocus={() => setActiveField('product')}
            onBlur={() => setActiveField(null)}
            icon="inventory_2"
            list="products-list"
        />
    </section>
  );
};

export default IdentificationForm;