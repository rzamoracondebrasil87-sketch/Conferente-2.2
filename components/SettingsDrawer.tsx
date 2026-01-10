import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userPhoto: string | null;
  onUpdateProfile: (name: string, photo: string | null) => void;
}

const SettingsDrawer: React.FC<Props> = ({ isOpen, onClose, userName, userPhoto, onUpdateProfile }) => {
  const [isDark, setIsDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Profile State
  const [editName, setEditName] = useState(userName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme_mode') === 'dark';
    setIsDark(savedMode);
    setEditName(userName);
  }, [isOpen, userName]);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    if (typeof (window as any).updateAppTheme === 'function') {
        (window as any).updateAppTheme('refined', newMode);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEditName(val);
      onUpdateProfile(val, userPhoto);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  onUpdateProfile(editName, ev.target.result as string);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const faqs = [
      { q: "Como uso a Tara?", a: "Selecione 'Manual'. O cursor vai para a quantidade. Se já houver histórico, a tara entra sozinha. Após digitar as caixas e parar, a janela fecha sozinha." },
      { q: "Funciona Offline?", a: "Sim. Apenas a IA precisa de internet. O resto funciona 100% no seu dispositivo." },
      { q: "Como imprimir?", a: "Aba 'Ticket' > botão Imprimir. Ou use o botão 'Compartilhar' para WhatsApp." },
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end font-body">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Drawer Panel */}
      <div 
        className="relative w-full max-w-[350px] h-full bg-[#1e1626] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-safe pb-4 px-6 flex items-center justify-between z-10 border-b border-white/5 min-h-[90px]">
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">Ajustes</h2>
            <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white active:scale-95"
            >
                <span className="material-symbols-rounded">close</span>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-24">
            
            {/* Profile Section */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                    Perfil
                </h3>
                <div className="bg-[#231a2e] p-5 rounded-[2rem] border border-white/5 flex flex-col gap-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden relative group cursor-pointer shadow-lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {userPhoto ? (
                                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-rounded text-3xl">person</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-rounded text-white">edit</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        
                        <div className="flex-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Nome de Exibição</label>
                            <input 
                                type="text" 
                                value={editName}
                                onChange={handleNameChange}
                                className="w-full bg-[#191022] border border-white/5 rounded-xl text-sm font-bold text-white px-3 py-2.5 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 placeholder-gray-600 transition-all"
                                placeholder="Seu Nome"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Appearance Section */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                    Sistema
                </h3>
                
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between bg-[#231a2e] p-5 rounded-[2rem] border border-white/5 mb-4 shadow-lg">
                    <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 text-primary`}>
                             <span className="material-symbols-rounded">{isDark ? 'dark_mode' : 'light_mode'}</span>
                         </div>
                         <div>
                             <p className="text-sm font-bold text-white font-display">Modo Escuro</p>
                             <p className="text-[10px] text-gray-400">Recomendado</p>
                         </div>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`w-12 h-7 rounded-full transition-colors relative ${isDark ? 'bg-primary' : 'bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'left-6' : 'left-1'}`}></span>
                    </button>
                </div>
            </section>

            {/* Support Section */}
            <section>
                <a 
                    href="https://t.me/Best_87" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-gradient-to-br from-[#229ED9] to-[#0088cc] p-5 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-rounded text-2xl group-hover:rotate-12 transition-transform">send</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold font-display">Fale Comigo</p>
                        <p className="text-[10px] opacity-80">Telegram Direto</p>
                    </div>
                </a>
            </section>

            {/* FAQ Section */}
            <section>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
                    Perguntas Frequentes
                </h3>
                <div className="flex flex-col gap-2">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-[#231a2e] rounded-[1.5rem] border border-white/5 overflow-hidden transition-all duration-300">
                            <button 
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="text-xs font-bold text-gray-200 pr-2">{faq.q}</span>
                                <span className={`material-symbols-rounded text-gray-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {openFaq === idx && (
                                <div className="px-4 pb-4 pt-0">
                                    <div className="bg-[#191022] p-3 rounded-2xl border border-white/5">
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsDrawer;