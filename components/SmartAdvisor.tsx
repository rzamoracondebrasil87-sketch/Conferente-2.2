import React, { useEffect, useState } from 'react';
import { WeightData, IdentificationData } from '../types';

interface Props {
  weight: WeightData;
  ident: IdentificationData;
  hasPhoto: boolean;
  historyCount: number;
}

interface Advice {
    text: string;
    type: 'neutral' | 'warning' | 'error' | 'success';
    icon: string;
}

const SmartAdvisor: React.FC<Props> = ({ weight, ident, hasPhoto, historyCount }) => {
  const [advice, setAdvice] = useState<Advice | null>(null);

  useEffect(() => {
    // Proactive Intelligence Logic
    const analyze = () => {
        // 1. Critical Errors
        if (weight.current > 0 && weight.tare >= weight.current) {
            return { text: "Atenção: A Tara é maior ou igual ao Peso Bruto.", type: 'error', icon: 'scale_error' };
        }

        // 2. Identification Gaps
        if (!ident.targetWeight) {
             return { text: "Comece digitando o Peso da Nota para referência.", type: 'neutral', icon: 'edit_note' };
        }
        
        if (!ident.supplier) {
             return { text: "Qual fornecedor estamos conferindo?", type: 'neutral', icon: 'local_shipping' };
        }

        // 3. Weight Discrepancy Analysis (Live)
        const target = parseFloat(ident.targetWeight);
        if (target > 0 && weight.net > 0) {
            const diff = weight.net - target;
            const tolerance = 0.05; // 50g tolerance
            
            if (Math.abs(diff) <= tolerance) {
                if (!hasPhoto) return { text: "Peso exato! Não esqueça a foto de evidência.", type: 'success', icon: 'camera_enhance' };
                return { text: "Perfeito. Pode registrar.", type: 'success', icon: 'check_circle' };
            } else if (diff > tolerance) {
                return { text: `Passou ${diff.toFixed(2)}kg da nota. Verifique itens extras.`, type: 'warning', icon: 'add_shopping_cart' };
            } else {
                 return { text: `Faltam ${Math.abs(diff).toFixed(2)}kg. Verifique se falta mercadoria.`, type: 'warning', icon: 'remove_shopping_cart' };
            }
        }

        // 4. Operational Tips
        if (historyCount > 0 && historyCount % 10 === 0) {
            return { text: "Muitos registros. Lembre-se de enviar o relatório.", type: 'neutral', icon: 'share' };
        }

        // Default
        if (weight.current === 0) {
             return { text: "Aguardando peso na balança...", type: 'neutral', icon: 'hourglass_empty' };
        }

        return null;
    };

    setAdvice(analyze() as Advice | null);
  }, [weight, ident, hasPhoto, historyCount]);

  if (!advice) return null;

  const getColors = () => {
      switch(advice.type) {
          case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
          case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          default: return 'bg-surface-container text-on-surface-variant border-transparent';
      }
  };

  return (
    <div className={`mx-2 mb-3 rounded-2xl p-3 flex items-start gap-3 border animate-in slide-in-from-top-2 duration-300 ${getColors()}`}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-rounded text-[18px]">{advice.icon}</span>
        </div>
        <div>
            <p className="text-[10px] font-bold uppercase opacity-70 mb-0.5">Assistente Inteligente</p>
            <p className="text-xs font-bold leading-tight">{advice.text}</p>
        </div>
    </div>
  );
};

export default SmartAdvisor;