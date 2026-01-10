import React from 'react';
import { createPortal } from 'react-dom';
import { TareWarning } from '../utils/learningSystem';

interface Props {
  isOpen: boolean;
  warning: TareWarning | null;
  currentTare: number;
  onConfirm: (tare: number) => void;
  onCancel: () => void;
  onKeepCurrent: () => void;
}

const TareWarningDialog: React.FC<Props> = ({ isOpen, warning, currentTare, onConfirm, onCancel, onKeepCurrent }) => {
  if (!isOpen || !warning) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-body">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onCancel}
      ></div>
      
      {/* Dialog */}
      <div 
        className="relative bg-[#1e1626] border border-white/10 rounded-[2rem] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-rounded text-primary text-4xl">info</span>
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-white text-center mb-3 font-display">
          Atenção: Tara Diferente
        </h3>
        
        <p className="text-sm text-gray-300 text-center mb-6 leading-relaxed">
          {warning.message}
        </p>

        {/* Current vs Suggested */}
        <div className="bg-[#231a2e] rounded-2xl p-4 mb-6 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Tara Atual:</span>
            <span className="text-sm font-bold text-gray-200">
              {currentTare > 0 ? `${(currentTare * 1000).toFixed(0)}g` : 'Nenhuma'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Tara Sugerida ({warning.supplier}):</span>
            <span className="text-sm font-bold text-primary">
              {(warning.tare * 1000).toFixed(0)}g
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirm(warning.tare)}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-xl">check</span>
            Usar Tara de {warning.supplier} ({(warning.tare * 1000).toFixed(0)}g)
          </button>
          
          {currentTare > 0 && (
            <button
              onClick={onKeepCurrent}
              className="w-full bg-surface-container-high text-on-surface py-3 rounded-xl font-bold text-sm hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded">close</span>
              Manter Tara Atual ({(currentTare * 1000).toFixed(0)}g)
            </button>
          )}
          
          <button
            onClick={onCancel}
            className="w-full bg-transparent text-gray-400 py-2.5 rounded-xl font-bold text-xs hover:text-white active:scale-95 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TareWarningDialog;
