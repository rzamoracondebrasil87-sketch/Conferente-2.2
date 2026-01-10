import React, { useEffect, useState } from 'react';
import { getHistory, clearHistory } from '../utils/historyStorage';
import { WeighingRecord } from '../types';

const TicketScreen: React.FC = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);

  useEffect(() => {
    // Load all history records.
    setRecords(getHistory());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleClearTicket = () => {
    if (window.confirm("⚠️ ATENÇÃO: Deseja apagar este ticket?\n\nIsso limpará todo o histórico de pesagens permanentemente.\nEsta ação não pode ser desfeita.")) {
        clearHistory();
        setRecords([]);
    }
  };

  const handleShare = () => {
    const text = generateTextReport();
    if (navigator.share) {
        navigator.share({ 
            title: 'Relatório Conferente', 
            text: text 
        }).catch((err) => console.error('Error sharing:', err));
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const generateTextReport = () => {
      const total = calculateTotalNet().toFixed(2);
      const dateStr = new Date().toLocaleString('pt-BR');
      let text = `📋 RELATÓRIO DE CONFERÊNCIA\nData: ${dateStr}\n\n`;
      
      records.forEach((r, index) => {
          const itemNum = records.length - index;
          const diff = r.netWeight - r.targetWeight;
          const sign = diff > 0 ? '+' : '';
          
          text += `Item #${itemNum}: ${r.supplier} | ${r.product}\n`;
          text += `Peso: ${r.netWeight.toFixed(2)}kg (Nota: ${r.targetWeight.toFixed(2)})\n`;
          text += `Dif: ${sign}${diff.toFixed(2)}kg\n`;
          text += `--------------------------------\n`;
      });
      text += `\nTOTAL GERAL: ${total} kg`;
      return text;
  };

  const calculateTotalNet = () => records.reduce((acc, r) => acc + r.netWeight, 0);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-on-surface-variant/50">
        <span className="material-symbols-rounded text-6xl mb-4 opacity-50">receipt_long</span>
        <p className="text-sm font-medium">Nenhum registro para gerar ticket</p>
      </div>
    );
  }

  return (
    <>
    <style>{`
      @media print {
        html, body, #root, main {
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
        }

        body * { visibility: hidden; }
        
        #ticket-view, #ticket-view * { visibility: visible; }
        
        #ticket-view { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            max-width: none !important;
            margin: 0 !important; 
            padding: 10px !important;
            background: white; 
            color: black;
            box-shadow: none !important;
        }
        
        .no-print { display: none !important; }
      }
      .font-mono { font-family: 'Courier New', Courier, monospace; }
      
      /* High Contrast Border Helper */
      .ticket-border { border: 2px solid #000; }
      .ticket-border-b { border-bottom: 2px solid #000; }
      .ticket-border-t { border-top: 2px dashed #000; }
    `}</style>

    <div className="flex flex-col items-center pb-24 px-4 pt-2 animate-in zoom-in-95 duration-300 h-full overflow-y-auto w-full">
      
      {/* THERMAL TICKET DESIGN v2 */}
      <div id="ticket-view" className="w-full max-w-[380px] bg-white text-black p-4 text-xs font-sans leading-tight shadow-lg mb-4 mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-4">
            <h1 className="text-2xl font-black uppercase mb-1">CONFERENTE</h1>
            <div className="border-t-2 border-black w-full my-1"></div>
            <div className="flex justify-between font-bold text-[10px] mt-1">
                <span>DATA: {new Date().toLocaleDateString('pt-BR')}</span>
                <span>HORA: {new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="border-b-2 border-black w-full my-1"></div>
        </div>

        {/* ITEMS LIST */}
        <div className="flex flex-col gap-4">
            {records.map((record, index) => {
                const diff = record.netWeight - record.targetWeight;
                const sign = diff > 0 ? '+' : '';
                const itemNum = records.length - index;
                const unitTare = record.boxQuantity > 0 ? (record.tare / record.boxQuantity) : 0;
                const status = Math.abs(diff) < 0.05 ? 'EXATO' : (diff > 0 ? 'SOBRA' : 'FALTA');
                
                return (
                    <div key={record.id} className="flex flex-col">
                        
                        {/* Item Header Box */}
                        <div className="flex justify-between items-center bg-black text-white px-2 py-1 font-bold">
                            <span className="text-sm">ITEM #{String(itemNum).padStart(2, '0')}</span>
                            <span className="text-[10px]">{new Date(record.timestamp).toLocaleTimeString('pt-BR')}</span>
                        </div>

                        {/* Details */}
                        <div className="border-x-2 border-b-2 border-black p-2 flex flex-col gap-1">
                            
                            {/* Product & Supplier */}
                            <div className="mb-1">
                                <span className="block font-bold text-sm uppercase">{record.product}</span>
                                <span className="block text-[10px] uppercase truncate">{record.supplier}</span>
                            </div>

                            {/* Weight Grid */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] border-t border-dashed border-black pt-1">
                                
                                {/* Row 1 */}
                                <div>
                                    <span className="block font-bold">BRUTO:</span>
                                    <span>{record.grossWeight.toFixed(3)} kg</span>
                                </div>
                                <div>
                                    <span className="block font-bold">TARA TOTAL:</span>
                                    <span>{record.tare.toFixed(3)} kg</span>
                                </div>

                                {/* Row 2 (Tare Details) */}
                                <div className="col-span-2 flex gap-2 text-[9px] opacity-75">
                                    <span>Qtd: {record.boxQuantity} cx</span>
                                    <span>Unit: {unitTare.toFixed(3)} kg</span>
                                </div>
                            </div>

                            {/* Main Result Box */}
                            <div className="mt-2 border-2 border-black p-1 flex justify-between items-center bg-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold">LÍQUIDO</span>
                                    <span className="text-xl font-black">{record.netWeight.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <span className="text-[9px] font-bold">NOTA: {record.targetWeight.toFixed(2)}</span>
                                    <span className="text-sm font-bold">
                                        {status} ({sign}{diff.toFixed(2)})
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>

        {/* TOTALS FOOTER */}
        <div className="mt-6 border-t-4 border-black pt-2">
            <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-sm">TOTAL ITENS:</span>
                <span className="font-black text-xl">{records.length}</span>
            </div>
            
            <div className="bg-black text-white p-3 flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL KG</span>
                <span className="font-black text-3xl">{calculateTotalNet().toFixed(2)}</span>
            </div>

            {/* Signature Lines */}
            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                    <div className="border-b border-black w-full h-1 mb-1"></div>
                    <span className="text-[9px] font-bold uppercase">Conferente</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-b border-black w-full h-1 mb-1"></div>
                    <span className="text-[9px] font-bold uppercase">Motorista</span>
                </div>
            </div>
            
            <div className="text-center mt-4 text-[9px] font-mono">
                Emitido por Conferente 2.1
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col w-full max-w-[360px] gap-3 no-print">
          <div className="flex gap-3 w-full">
            <button 
                onClick={handlePrint}
                className="flex-1 bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
                <span className="material-symbols-rounded">print</span>
                Imprimir
            </button>
            <button 
                onClick={handleShare}
                className="flex-1 bg-primary text-on-primary hover:bg-primary/90 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
                <span className="material-symbols-rounded">share</span>
                Enviar
            </button>
          </div>

          <button 
            onClick={handleClearTicket}
            className="w-full bg-error-container text-error hover:bg-error-container/80 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 opacity-90 hover:opacity-100"
          >
            <span className="material-symbols-rounded">delete_forever</span>
            Limpar Ticket e Histórico
          </button>
      </div>

    </div>
    </>
  );
};

export default TicketScreen;