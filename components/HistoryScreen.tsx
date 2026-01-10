import React, { useState, useEffect, useMemo } from 'react';
import { WeighingRecord } from '../types';
import { getHistory, clearHistory } from '../utils/historyStorage';

type FilterType = 'day' | 'week' | 'month' | 'year';

interface Props {
    onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    onOpenAI?: () => void;
}

const HistoryScreen: React.FC<Props> = ({ onShowToast, onOpenAI }) => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('day');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProductSelect, setExportProductSelect] = useState<string>('');

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = records.map(r => r.supplier);
    return Array.from(new Set(suppliers)).sort();
  }, [records]);

  const uniqueProducts = useMemo(() => {
    const products = records.map(r => r.product);
    return Array.from(new Set(products)).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const weekStart = new Date(now);
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartTime = weekStart.getTime();
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

    return records.filter(r => {
        let timeMatch = true;
        if (filter === 'day') timeMatch = r.timestamp >= todayStart;
        else if (filter === 'week') timeMatch = r.timestamp >= weekStartTime;
        else if (filter === 'month') timeMatch = r.timestamp >= monthStart;
        else if (filter === 'year') timeMatch = r.timestamp >= yearStart;

        const supplierMatch = selectedSupplier === 'all' || r.supplier === selectedSupplier;
        return timeMatch && supplierMatch;
    });
  }, [records, filter, selectedSupplier]);

  const performClearHistory = () => {
    clearHistory();
    setRecords([]);
    setShowClearConfirm(false);
  };

  const handleFeatureNotReady = () => {
      onShowToast("Função em desenvolvimento", "info");
  };

  const generateReportText = (items: WeighingRecord[]) => {
    if (items.length === 0) return '';
    
    const nowStr = new Date().toLocaleString('pt-BR');
    let text = `📊 *RELATÓRIO DE CONFERÊNCIA*\n`;
    text += `🗓️ Gerado em: ${nowStr}\n`;
    text += `📋 Total de Registros: ${items.length}\n`;
    text += `--------------------------------\n`;

    items.forEach(r => {
        const date = new Date(r.timestamp).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'});
        const diff = r.netWeight - r.targetWeight;
        const diffStr = diff > 0 ? `+${diff.toFixed(2)}kg` : `${diff.toFixed(2)}kg`;
        const statusIcon = Math.abs(diff) < 0.1 ? '✅' : (diff > 0 ? '📈' : '📉');
        const statusText = Math.abs(diff) < 0.1 ? 'Exato' : (diff > 0 ? 'Sobra' : 'Falta');

        text += `\n⏰ *${date}*\n`;
        text += `🏭 *${r.supplier}*\n`;
        text += `📦 *Produto:* ${r.product}\n`;
        text += `⚖️ *Liq:* ${r.netWeight.toFixed(2)}kg | 🎯 *Nota:* ${r.targetWeight.toFixed(2)}kg\n`;
        text += `${statusIcon} *Dif:* ${diffStr} (${statusText})\n`;
        
        if (r.boxQuantity && r.boxQuantity > 0) {
            text += `📦 Vols: ${r.boxQuantity}cx (Tara: ${r.tare.toFixed(3)}kg)\n`;
        }
        if (r.hasPhoto) text += `📸 Evidência Anexada\n`;
        text += `................................\n`;
    });

    // Summary at bottom
    const totalNet = items.reduce((acc, curr) => acc + curr.netWeight, 0);
    text += `\n⚖️ *TOTAL LÍQUIDO GERAL: ${totalNet.toFixed(2)}kg*`;
    
    return text;
  };

  const executeExport = (mode: 'all' | 'product') => {
      let dataToExport = filteredRecords;
      
      if (mode === 'product' && exportProductSelect) {
          dataToExport = records.filter(r => r.product === exportProductSelect);
      }

      if (dataToExport.length === 0) {
          onShowToast("Nenhum dado encontrado para exportar.", "error");
          return;
      }

      const text = generateReportText(dataToExport);
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      setShowExportModal(false);
  };

  const formatFullDateTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return {
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
  };

  const getFilterLabel = (f: FilterType) => {
      switch(f) {
          case 'day': return 'Hoje';
          case 'week': return 'Semana';
          case 'month': return 'Mês';
          case 'year': return 'Ano';
          default: return '';
      }
  };

  const renderDifference = (net: number, target: number) => {
    if (!target || target === 0) return null;
    const diff = net - target;
    const isLoss = diff < -0.005; // Falta (Menos que nota)
    const isGain = diff > 0.005;  // Sobra (Mais que nota)
    
    let colorClass = 'bg-surface-container-high text-on-surface-variant';
    let icon = 'check';
    let sign = '';
    
    if (isLoss) {
        // Red for Loss/Falta
        colorClass = 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50';
        icon = 'trending_down';
    } else if (isGain) {
        // Green for Gain/Sobra
        colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50';
        icon = 'trending_up';
        sign = '+';
    }

    return (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg ${colorClass}`}>
            <span>{sign}{diff.toFixed(2)} kg</span>
            {Math.abs(diff) > 0.005 && (
                 <span className="material-symbols-rounded text-[14px]">{icon}</span>
            )}
        </div>
    );
  };

  return (
    <>
    <div id="history-content" className="flex flex-col gap-5 pb-24 animate-in fade-in slide-in-from-right-4 duration-300 relative">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-on-surface">Histórico</h2>
                <div className="text-xs font-bold text-on-secondary-container bg-secondary-container px-3 py-1 rounded-full">
                    {filteredRecords.length}
                </div>
            </div>
            
            {/* AI Shortcut */}
            {onOpenAI && (
                <button 
                    onClick={onOpenAI}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#4a0996] text-white shadow-lg active:scale-95 transition-all"
                >
                    <span className="material-symbols-rounded text-[20px]">smart_toy</span>
                </button>
            )}
        </div>

        {/* Filter Segmented Button - Pill */}
        <div className="flex rounded-full bg-surface-container-high/30 p-1 relative no-print">
            <div 
                className="absolute top-1 bottom-1 bg-gradient-to-br from-secondary-container to-secondary-container/80 rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{
                    left: filter === 'day' ? '4px' : filter === 'week' ? '25%' : filter === 'month' ? '50%' : '75%',
                    width: 'calc(25% - 4px)'
                }}
            ></div>
            
            {(['day', 'week', 'month', 'year'] as FilterType[]).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                        flex-1 py-2 text-xs font-bold transition-colors relative z-10 rounded-full
                        ${filter === f 
                            ? 'text-on-secondary-container' 
                            : 'text-on-surface-variant hover:text-on-surface'
                        }
                    `}
                >
                    {getFilterLabel(f)}
                </button>
            ))}
        </div>

        {/* Supplier Dropdown (Pill Style) */}
        <div className="no-print">
          <div className="relative group">
            <select 
              className="w-full appearance-none bg-transparent border border-outline-variant/50 dark:border-white/10 rounded-full py-3 pl-12 pr-10 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all bg-gradient-to-r from-surface-container-low to-surface-container"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="all">Todos os Fornecedores</option>
              {uniqueSuppliers.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">local_shipping</span>
            <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Actions Row - Compact Buttons */}
        {filteredRecords.length > 0 && (
            <div className="flex gap-2 no-print overflow-x-auto pb-2 scrollbar-hide items-center">
                
                <button onClick={() => setShowExportModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-full text-[11px] font-bold text-on-surface whitespace-nowrap active:scale-95 transition-transform border border-outline-variant/10 dark:border-white/5">
                    <span className="material-symbols-rounded text-[16px] text-emerald-600">chat</span> WhatsApp
                </button>
                
                <button onClick={handleFeatureNotReady} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-full text-[11px] font-bold text-on-surface whitespace-nowrap active:scale-95 transition-transform border border-outline-variant/10 dark:border-white/5">
                    <span className="material-symbols-rounded text-[16px] text-primary">table_view</span> Excel
                </button>
                
                <button onClick={() => setShowClearConfirm(true)} className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-error-container text-error active:scale-95 transition-transform shrink-0">
                    <span className="material-symbols-rounded text-[18px]">delete</span>
                </button>
            </div>
        )}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/50">
            <span className="material-symbols-rounded text-6xl mb-4 opacity-30">inbox</span>
            <p className="text-sm font-medium">Sem registros</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRecords.map((record) => {
            const { date, time } = formatFullDateTime(record.timestamp);
            const unitTare = record.boxQuantity && record.boxQuantity > 0 ? (record.tare / record.boxQuantity).toFixed(3) : '0.000';
            
            return (
            <div key={record.id} className="bg-gradient-to-br from-surface-container-low to-surface-container border border-outline-variant/10 dark:border-white/5 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Header Line */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center min-w-[3.5rem] bg-surface-container-high/50 rounded-2xl shrink-0 border border-outline-variant/10 dark:border-white/5 p-1">
                        <span className="text-[10px] font-bold uppercase text-on-surface-variant/80">{date}</span>
                        <span className="text-xs font-black text-on-surface">{time}</span>
                    </div>
                    <div>
                        <h3 className="text-base font-black text-on-surface leading-tight tracking-tight">{record.supplier}</h3>
                        <p className="text-xs text-on-surface-variant font-medium mt-1">{record.product}</p>
                    </div>
                  </div>
                  {renderDifference(record.netWeight, record.targetWeight)}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-surface/50 dark:bg-black/20 p-3 rounded-2xl border border-outline-variant/10 dark:border-white/5">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Líquido</p>
                        <p className="text-lg font-black text-on-surface">{record.netWeight.toFixed(2)}<span className="text-xs ml-0.5">kg</span></p>
                    </div>
                    <div className="bg-surface/50 dark:bg-black/20 p-3 rounded-2xl border border-outline-variant/10 dark:border-white/5">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Bruto</p>
                        <p className="text-sm font-bold text-on-surface-variant">{record.grossWeight.toFixed(2)}kg</p>
                    </div>
                    <div className="bg-surface/50 dark:bg-black/20 p-3 rounded-2xl border border-outline-variant/10 dark:border-white/5">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tara</p>
                        <p className="text-sm font-bold text-on-surface-variant">{record.tare.toFixed(3)}kg</p>
                    </div>
                </div>

                {/* Detailed Info (Unit of Measure) */}
                <div className="flex items-center gap-4 bg-surface-container-high/30 p-2.5 rounded-xl border border-outline-variant/5 dark:border-white/5 mb-4 text-xs text-on-surface-variant/80">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-rounded text-[14px]">package_2</span>
                        <span>{record.boxQuantity || 1} Caixas</span>
                    </div>
                    <div className="w-px h-3 bg-outline-variant/30"></div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-rounded text-[14px]">scale</span>
                        <span>{unitTare}kg/un</span>
                    </div>
                </div>

                {record.hasPhoto && record.photoData && (
                     <button 
                        onClick={() => setSelectedPhoto(record.photoData || null)} 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold text-primary bg-primary-container/30 hover:bg-primary-container/50 transition-colors no-print border border-primary/5"
                     >
                        <span className="material-symbols-rounded text-[18px]">image</span>
                        Visualizar Evidência
                     </button>
                   )}
            </div>
            );
          })}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 no-print" onClick={() => setSelectedPhoto(null)}>
            <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <img src={selectedPhoto} alt="Evidence" className="w-full rounded-[2rem] shadow-2xl bg-black" />
                <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute -top-14 right-0 bg-surface/20 backdrop-blur-md text-white p-3 rounded-full"
                >
                    <span className="material-symbols-rounded text-2xl">close</span>
                </button>
            </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowClearConfirm(false)}>
            <div 
                className="bg-surface-container w-full max-w-xs rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <span className="material-symbols-rounded text-5xl text-error drop-shadow-sm">delete</span>
                    <div>
                        <h3 className="text-xl font-black text-on-surface">Apagar Histórico?</h3>
                        <p className="text-sm text-on-surface-variant mt-2">
                            Essa ação removerá todos os registros e não pode ser desfeita.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 py-3 rounded-full font-bold text-primary hover:bg-primary/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={performClearHistory}
                            className="flex-1 py-3 rounded-full font-bold bg-error text-on-error shadow-lg shadow-error/30 transition-all active:scale-95"
                        >
                            Apagar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Export Selection Modal - CENTERED */}
      {showExportModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowExportModal(false)}>
              <div 
                  className="bg-surface w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
              >
                   <div className="flex justify-between items-center mb-5">
                       <h3 className="text-xl font-black text-on-surface">Exportar Relatório</h3>
                       <button onClick={() => setShowExportModal(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-rounded">close</span></button>
                   </div>

                   <div className="flex flex-col gap-3">
                       {/* Option 1: Full Report */}
                       <button 
                           onClick={() => executeExport('all')}
                           className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-surface-container hover:bg-surface-container-high border border-transparent hover:border-primary/20 transition-all group text-left"
                       >
                           <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                               <span className="material-symbols-rounded text-2xl">assignment</span>
                           </div>
                           <div>
                               <p className="font-bold text-sm text-on-surface">Relatório Completo</p>
                               <p className="text-xs text-on-surface-variant">Todos os {filteredRecords.length} itens listados</p>
                           </div>
                       </button>
                       
                       {/* Option 2: By Product */}
                       <div className="p-4 rounded-[1.5rem] bg-surface-container border border-transparent transition-all">
                           <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-rounded text-2xl">inventory_2</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-on-surface">Por Produto</p>
                                    <p className="text-xs text-on-surface-variant">Filtrar apenas um item</p>
                                </div>
                           </div>
                           
                           <select 
                                className="w-full bg-surface-container-high border-none rounded-xl text-sm font-bold text-on-surface p-3 focus:ring-1 focus:ring-primary mb-3"
                                value={exportProductSelect}
                                onChange={(e) => setExportProductSelect(e.target.value)}
                           >
                               <option value="" disabled>Selecione o produto...</option>
                               {uniqueProducts.map(p => (
                                   <option key={p} value={p}>{p}</option>
                               ))}
                           </select>

                           <button 
                                disabled={!exportProductSelect}
                                onClick={() => executeExport('product')}
                                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                           >
                               Exportar Produto
                           </button>
                       </div>
                   </div>
              </div>
          </div>
      )}
    </div>
    </>
  );
};

export default HistoryScreen;