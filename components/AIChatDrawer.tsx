import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { WeighingRecord, WeightData, IdentificationData, TareMode } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: WeighingRecord[];
  currentWeight: WeightData;
  identification: IdentificationData;
  tareDetails: {
      mode: TareMode;
      productTare: number;
      productQty: number;
      pkgUnitWeight: number;
      pkgQty: number;
  };
}

const AIChatDrawer: React.FC<Props> = ({ 
    isOpen, onClose, records, 
    currentWeight, identification, tareDetails 
}) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const liveContext = {
          CONTEXTO_TEMPO_REAL: {
              fornecedor: identification.supplier || "Não informado",
              produto: identification.product || "Não informado",
              peso_nota: parseFloat(identification.targetWeight) || 0,
              balanca: {
                  bruto: currentWeight.current,
                  liquido: currentWeight.net,
                  tara: currentWeight.tare
              },
              analise_diferenca: parseFloat(identification.targetWeight) > 0 
                ? (currentWeight.net - parseFloat(identification.targetWeight)).toFixed(2) 
                : 'N/A'
          }
      };

      const systemInstruction = `Atue como um Especialista em Logística e Prevenção de Perdas usando este app.
      Seu objetivo é encontrar erros, sugerir correções e garantir que o conferente não cometa falhas.
      
      DADOS ATUAIS: ${JSON.stringify(liveContext)}
      
      REGRAS:
      1. Se houver diferença de peso > 1%, alerte imediatamente e sugira contar as caixas novamente.
      2. Se a Tara for > 0 e o Peso Liquido for muito baixo, pergunte se a tara está correta.
      3. Seja muito breve e direto. Use emojis.
      4. Fale como um colega de trabalho experiente ("Cara, olha isso...").
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: { systemInstruction, temperature: 0.4 },
      });

      setMessages([...newMessages, { role: 'ai', text: response.text || "Sem resposta." }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', text: "⚠️ Erro de conexão com a IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="mt-auto w-full max-w-md mx-auto bg-surface rounded-t-[2.5rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300 h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0 bg-surface rounded-t-[2.5rem] z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#4a0996] text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-rounded text-[28px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-extrabold text-on-surface leading-tight font-display text-lg">Copiloto Logístico</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Monitorando</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {/* Chat Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 no-scrollbar bg-surface-container-low scroll-smooth pb-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center px-2">
              
              <div className="mb-8 p-6 bg-surface rounded-[2rem] shadow-sm w-full">
                  <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wide flex items-center justify-center gap-1">
                      <span className="material-symbols-rounded text-sm">info</span> Status Atual
                  </p>
                  <p className="text-xl font-bold text-on-surface leading-tight font-display mb-1">
                      {identification.supplier || "Aguardando dados..."}
                  </p>
                  <p className="text-sm font-medium text-on-surface-variant mb-4">
                      {identification.product || 'Selecione um produto'}
                  </p>
                  
                  {identification.targetWeight && (
                      <div className="flex items-center justify-center gap-4 mt-3 pt-4 border-t border-outline-variant/10">
                          <div className="bg-surface-container px-3 py-2 rounded-xl">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Nota</p>
                              <p className="text-sm font-bold text-on-surface">{identification.targetWeight} kg</p>
                          </div>
                          <div className="bg-surface-container px-3 py-2 rounded-xl">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase">Balança</p>
                              <p className={`text-sm font-bold ${Math.abs(currentWeight.net - parseFloat(identification.targetWeight)) > 0.1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {currentWeight.net.toFixed(2)} kg
                              </p>
                          </div>
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-1 gap-3 w-full">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 ml-2 text-left">Sugestões de Análise</p>
                {[
                  "Analise a pesagem atual ⚠️",
                  "Verifique se a tara está correta 📦",
                  "Estou esquecendo de algo?",
                ].map((q) => (
                  <button 
                    key={q} 
                    onClick={() => handleSend(q)}
                    className="text-left p-4 rounded-2xl bg-surface hover:bg-surface-container text-sm font-bold text-on-surface transition-all shadow-sm flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <span className="material-symbols-rounded text-primary opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              <div className={`max-w-[88%] p-5 rounded-[1.5rem] text-[15px] shadow-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-sm shadow-primary/20' 
                  : 'bg-surface text-on-surface rounded-tl-sm'
              }`}>
                <div className="whitespace-pre-wrap font-medium">{m.text}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="bg-surface p-5 rounded-[1.5rem] rounded-tl-sm flex gap-2 items-center shadow-sm">
                  <span className="text-xs font-bold text-on-surface-variant">Analisando</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface border-t border-outline-variant/10 pb-10 shrink-0 z-20">
          <div className="flex items-center gap-2 bg-surface-container rounded-2xl p-2 pr-2 focus-within:ring-1 focus-within:ring-primary/50 transition-colors">
            <input 
              className="flex-1 bg-transparent border-0 py-3 px-4 text-sm font-semibold text-on-surface focus:ring-0 placeholder:text-on-surface-variant"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                input.trim() && !isLoading ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-rounded">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatDrawer;