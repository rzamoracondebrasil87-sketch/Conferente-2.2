import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { WeighingRecord, WeightData, IdentificationData, TareMode } from '../types';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

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

/**
 * AI Chat Drawer Component
 *
 * Provides an intelligent logistics advisor powered by Google Gemini API.
 * Analyzes real-time weighing data and historical records to provide insights.
 */
const AIChatDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  records,
  currentWeight,
  identification,
  tareDetails
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      const scrollTimeout = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages, isLoading]);

  /**
   * Prepare context data from current weighing session
   */
  const buildContextData = useCallback(() => {
    const variance = parseFloat(identification.targetWeight) > 0
      ? currentWeight.net - parseFloat(identification.targetWeight)
      : null;

    return {
      current_weighing: {
        supplier: identification.supplier || 'Não informado',
        product: identification.product || 'Não informado',
        target_weight_kg: parseFloat(identification.targetWeight) || 0,
        gross_weight_kg: currentWeight.current,
        net_weight_kg: currentWeight.net,
        tare_weight_kg: currentWeight.tare,
        variance_kg: variance,
        variance_percent: variance !== null && parseFloat(identification.targetWeight) > 0
          ? ((variance / parseFloat(identification.targetWeight)) * 100).toFixed(2)
          : 'N/A',
        tare_mode: tareDetails.mode,
        is_weight_stable: currentWeight.isStable,
        has_variance_warning: variance !== null && Math.abs(variance) > 0.1
      },
      tare_configuration: {
        mode: tareDetails.mode,
        product_tare_kg: tareDetails.productTare,
        product_quantity: tareDetails.productQty,
        packaging_unit_weight_kg: tareDetails.pkgUnitWeight,
        packaging_quantity: tareDetails.pkgQty
      },
      history_summary: {
        total_records: records.length,
        recent_records: records.slice(0, 5).map(r => ({
          supplier: r.supplier,
          product: r.product,
          net_weight: r.netWeight,
          target_weight: r.targetWeight,
          variance: r.netWeight - r.targetWeight
        }))
      }
    };
  }, [currentWeight, identification, records, tareDetails]);

  /**
   * Send message to Gemini AI
   */
  const handleSend = useCallback(
    async (customPrompt?: string) => {
      const textToSend = customPrompt || input;
      if (!textToSend.trim() || isLoading) return;

      // Add user message to chat
      const userMessage: ChatMessage = {
        role: 'user',
        text: textToSend,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        // Get API key from multiple sources in order of priority
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 
                      process.env.API_KEY ||
                      (window as any).__GEMINI_API_KEY__ ||
                      (window as any).GEMINI_API_KEY || 
                      (window as any).ENV?.GEMINI_API_KEY ||
                      '';

        if (!apiKey || apiKey.trim() === '') {
          const errorMsg =
            '⚠️ API Key não configurada. Verifique as variáveis de ambiente.';
          console.error('❌ Gemini API Key not found');
          console.error('Available sources:');
          console.error('  - process.env.REACT_APP_GEMINI_API_KEY:', !!process.env.REACT_APP_GEMINI_API_KEY);
          console.error('  - process.env.API_KEY:', !!process.env.API_KEY);
          console.error('  - window.__GEMINI_API_KEY__:', !!(window as any).__GEMINI_API_KEY__);
          setMessages(prev => [
            ...prev,
            { role: 'ai', text: errorMsg, timestamp: Date.now() }
          ]);
          setError('API Key ausente');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Gemini API Key loaded successfully');

        // Initialize Gemini AI
        const ai = new GoogleGenAI({ apiKey });

        // Build system instruction with real-time context
        const contextData = buildContextData();
        const systemInstruction = `Você é um Especialista Logístico em Prevenção de Perdas.
Analisa pesagens de mercadorias e orienta conferentes.

=== DADOS ATUAIS (Tempo Real) ===
${JSON.stringify(contextData.current_weighing, null, 2)}

=== HISTÓRICO RECENTE ===
${contextData.history_summary.recent_records.map((r, i) =>
  `${i + 1}. ${r.supplier} - ${r.product}: ${r.net_weight}kg (Nota: ${r.target_weight}kg, Diff: ${r.variance.toFixed(2)}kg)`
).join('\n')}

=== INSTRUÇÕES ===
1. Analise diferenças de peso > 0.5% e alerte imediatamente
2. Se tara > 0 e peso líquido baixo, questione a validade da tara
3. Seja conciso, prático e use emojis
4. Fale como colega experiente ("Olha só isso...", "Ó lá...")
5. Forneça ações corretivas claras

Responda em português (Brasil).`;

        // Call Gemini API
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: textToSend }]
            }
          ],
          systemInstruction,
          config: {
            temperature: 0.4,
            maxOutputTokens: 500
          }
        });

        const aiResponse = response.text || 'Sem resposta da IA.';
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: aiResponse, timestamp: Date.now() }
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('AI Error:', err);
        setError(errorMessage);
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: `⚠️ Erro de conexão: ${errorMessage}`,
            timestamp: Date.now()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, buildContextData]
  );

  /**
   * Handle Enter key press
   */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (!isOpen) return null;

  const hasWeightData = identification.supplier && identification.product;
  const weightVariance =
    hasWeightData && parseFloat(identification.targetWeight) > 0
      ? currentWeight.net - parseFloat(identification.targetWeight)
      : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="mt-auto w-full max-w-md mx-auto bg-surface rounded-t-[2.5rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300 h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0 bg-surface rounded-t-[2.5rem] z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#4a0996] text-white flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <span className="material-symbols-rounded text-[28px]">smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-on-surface leading-tight font-display text-lg truncate">
                Copiloto Logístico
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest whitespace-nowrap">
                  Monitorando
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant hover:text-on-surface flex-shrink-0"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {/* Chat Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 no-scrollbar bg-surface-container-low scroll-smooth"
        >
          {/* Initial State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-start py-6 text-center px-2 gap-4">
              {/* Current Status Card */}
              {hasWeightData && (
                <div className="mb-4 p-6 bg-surface rounded-[2rem] shadow-sm w-full">
                  <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wide flex items-center justify-center gap-1">
                    <span className="material-symbols-rounded text-sm">info</span> Status Atual
                  </p>
                  <p className="text-xl font-bold text-on-surface leading-tight font-display mb-1 break-words">
                    {identification.supplier}
                  </p>
                  <p className="text-sm font-medium text-on-surface-variant mb-4 break-words">
                    {identification.product}
                  </p>

                  {identification.targetWeight && (
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-outline-variant/10 flex-wrap">
                      <div className="bg-surface-container px-3 py-2 rounded-xl">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                          Nota
                        </p>
                        <p className="text-sm font-bold text-on-surface">
                          {identification.targetWeight} kg
                        </p>
                      </div>
                      <div
                        className={`bg-surface-container px-3 py-2 rounded-xl ${
                          weightVariance !== null &&
                          Math.abs(weightVariance) > 0.1
                            ? 'ring-2 ring-amber-400'
                            : ''
                        }`}
                      >
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                          Balança
                        </p>
                        <p
                          className={`text-sm font-bold ${
                            weightVariance !== null &&
                            Math.abs(weightVariance) > 0.1
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {currentWeight.net.toFixed(2)} kg
                        </p>
                      </div>
                      {weightVariance !== null && (
                        <div className="bg-surface-container px-3 py-2 rounded-xl w-full">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                            Diferença
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              Math.abs(weightVariance) > 0.1
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {weightVariance > 0 ? '+' : ''}
                            {weightVariance.toFixed(2)} kg
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Suggestion Buttons */}
              <div className="grid grid-cols-1 gap-3 w-full">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 ml-2 text-left">
                  💡 Sugestões de Análise
                </p>
                {[
                  '📊 Analise a pesagem atual',
                  '📦 Verifique se a tara está correta',
                  '🔍 Há algo estranho nessa pesagem?',
                  '📈 Como estão as pesagens recentes?'
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left p-4 rounded-2xl bg-surface hover:bg-surface-container text-sm font-bold text-on-surface transition-all shadow-sm flex items-center justify-between group active:scale-95"
                  >
                    <span className="break-words text-left">{q}</span>
                    <span className="material-symbols-rounded text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-in fade-in slide-in-from-bottom-4 duration-300`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-[1.5rem] text-[15px] shadow-sm leading-relaxed break-words ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm shadow-primary/20'
                    : 'bg-surface text-on-surface rounded-tl-sm border border-outline-variant/10'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">{m.text}</div>
                <p className="text-xs opacity-70 mt-1 font-normal">
                  {new Date(m.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-surface p-4 rounded-[1.5rem] rounded-tl-sm flex gap-2 items-center shadow-sm border border-outline-variant/10">
                <span className="text-xs font-bold text-on-surface-variant">
                  Analisando
                </span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex justify-center p-3">
              <div className="text-xs text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/30">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface border-t border-outline-variant/10 pb-10 shrink-0 z-20">
          <div className="flex items-center gap-2 bg-surface-container rounded-2xl p-2 pr-2 focus-within:ring-1 focus-within:ring-primary/50 transition-colors">
            <input
              className="flex-1 bg-transparent border-0 py-3 px-4 text-sm font-semibold text-on-surface focus:ring-0 placeholder:text-on-surface-variant outline-none"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
                input.trim() && !isLoading
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95'
                  : 'bg-surface-container-high text-on-surface-variant opacity-50'
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
