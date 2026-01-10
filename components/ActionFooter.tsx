import React from 'react';
import { AppView } from '../types';

interface Props {
  activeView: AppView;
  onRegister: () => void;
  onHistory: () => void;
  onTicket: () => void;
  onWeighing: () => void;
  onToggleMenu: () => void;
}

const ActionFooter: React.FC<Props> = ({ activeView, onRegister, onHistory, onTicket, onWeighing }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pb-8 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[22rem] bg-[#1e1626]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] h-20 flex items-center justify-between px-8 relative overflow-visible transition-all duration-300">
            
            <button onClick={onHistory} className="nav-item group h-full flex flex-col justify-center w-12 items-center active:scale-90 transition-transform">
                <span className={`material-symbols-rounded text-[28px] transition-colors ${activeView === 'history' ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`}>history</span>
                {activeView === 'history' && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
            </button>

            {/* Floating FAB */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%]">
                <button 
                    onClick={activeView === 'weighing' ? onRegister : onWeighing}
                    className="pointer-events-auto flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-tr from-primary to-[#9e4bf6] text-white shadow-[0_8px_25px_rgba(127,19,236,0.4)] border-[6px] border-[#191022] dark:border-[#191022] hover:scale-105 active:scale-95 transition-all duration-300 group z-10 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="material-symbols-rounded text-4xl drop-shadow-md">
                        {activeView === 'weighing' ? 'check' : 'scale'}
                    </span>
                </button>
            </div>

            <button onClick={onTicket} className="nav-item group h-full flex flex-col justify-center w-12 items-center active:scale-90 transition-transform">
                <span className={`material-symbols-rounded text-[28px] transition-colors ${activeView === 'ticket' ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`}>receipt_long</span>
                 {activeView === 'ticket' && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
            </button>
            
        </div>
    </div>
  );
};

export default ActionFooter;