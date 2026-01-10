import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import WeightCard from './components/WeightCard';
import IdentificationForm from './components/IdentificationForm';
import TareControl from './components/TareControl';
import PhotoEvidence from './components/PhotoEvidence';
import ActionFooter from './components/ActionFooter';
import HistoryScreen from './components/HistoryScreen';
import TicketScreen from './components/TicketScreen';
import Toast from './components/Toast';
import AIChatDrawer from './components/AIChatDrawer'; 
import SmartAdvisor from './components/SmartAdvisor';
import TareWarningDialog from './components/TareWarningDialog';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdateNotification } from './components/UpdateNotification';
import { AppView, WeightData, IdentificationData, TareMode, WeighingRecord } from './types';
import { saveRecord, getHistory } from './utils/historyStorage'; 
import { useNotifications } from './contexts/NotificationContext';
import { 
  learn, 
  getKnownSuppliers, 
  getKnownProducts, 
  predict, 
  checkOtherSupplierTare, 
  predictTareForSupplierProduct,
  confirmTare,
  TareWarning
} from './utils/learningSystem';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('weighing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { addNotification } = useNotifications();

  // Profile State
  const [userName, setUserName] = useState('Conferente');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Refs for sequential auto-focus navigation
  const supplierInputRef = useRef<HTMLInputElement>(null);
  const tareQtyInputRef = useRef<HTMLInputElement>(null);
  const grossWeightInputRef = useRef<HTMLInputElement>(null);

  const [weight, setWeight] = useState<WeightData>({
    current: 0,
    tare: 0,
    net: 0,
    isStable: true
  });

  const [ident, setIdent] = useState<IdentificationData>({
    supplier: '',
    product: '',
    targetWeight: ''
  });

  const [tareMode, setTareMode] = useState<TareMode>('manual');
  
  // Detailed Tare State
  const [productTare, setProductTare] = useState(0); // kg
  const [productQty, setProductQty] = useState(1);
  const [pkgUnitWeight, setPkgUnitWeight] = useState(0); // kg
  const [pkgQty, setPkgQty] = useState(0);

  const [photo, setPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [tareWarning, setTareWarning] = useState<TareWarning | null>(null);
  const [showTareWarning, setShowTareWarning] = useState(false);

  const [suggestions, setSuggestions] = useState<{suppliers: string[], products: string[]}>({ suppliers: [], products: [] });

  // AI Drawer State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<WeighingRecord[]>([]);

  useEffect(() => {
    // Load learning data
    setSuggestions({
        suppliers: getKnownSuppliers(),
        products: getKnownProducts()
    });

    // Load History for AI context
    setHistoryRecords(getHistory());

    // Load Profile
    const savedName = localStorage.getItem('conferente_name');
    const savedPhoto = localStorage.getItem('conferente_photo');
    if (savedName) setUserName(savedName);
    if (savedPhoto) setUserPhoto(savedPhoto);
  }, [view]);

  useEffect(() => {
    let totalTare = 0;
    if (tareMode === 'manual') {
        totalTare = (productTare * productQty) + (pkgUnitWeight * pkgQty);
    }
    setWeight(prev => ({
        ...prev,
        tare: totalTare,
        net: Math.max(0, prev.current - totalTare)
    }));
  }, [weight.current, tareMode, productTare, productQty, pkgUnitWeight, pkgQty]);

  // Detectar cambios de tara cuando cambian supplier y product
  useEffect(() => {
    if (ident.supplier && ident.product && !showTareWarning) {
      // Primero intentar obtener la tara específica de este fornecedor+producto
      const specificTare = predictTareForSupplierProduct(ident.supplier, ident.product);
      
      if (specificTare !== null && specificTare > 0) {
        // Si hay tara específica, usarla automáticamente
        if (Math.abs(productTare - specificTare) > 0.001) {
          setProductTare(specificTare);
          setProductQty(1);
        }
      } else {
        // Si no hay tara específica, verificar si hay de otro fornecedor
        const warning = checkOtherSupplierTare(ident.supplier, ident.product);
        if (warning) {
          // Solo mostrar si no hay tara actual o si la tara es diferente
          const shouldShow = productTare === 0 || Math.abs(productTare - warning.tare) > 0.001;
          if (shouldShow) {
            setTareWarning(warning);
            setShowTareWarning(true);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ident.supplier, ident.product]);

  const handleUpdateProfile = (name: string, photo: string | null) => {
      setUserName(name);
      setUserPhoto(photo);
      localStorage.setItem('conferente_name', name);
      if (photo) localStorage.setItem('conferente_photo', photo);
      else localStorage.removeItem('conferente_photo');
  };

  const handleResetTare = () => {
      setProductTare(0);
      setProductQty(1);
      setPkgUnitWeight(0);
      setPkgQty(0);
  };

  const handleSupplierMatch = (supplier: string) => {
    const prediction = predict(supplier);
    if (prediction) {
        setIdent(prev => ({ ...prev, product: prediction.product }));
        // La tara se establecerá automáticamente en el useEffect cuando se actualice el product
    }
  };

  const handleTareWarningConfirm = (tare: number) => {
    if (ident.supplier && ident.product) {
      // Confirmar la tara (se vuelve predeterminada para este fornecedor+producto)
      confirmTare(ident.supplier, ident.product, tare);
      setProductTare(tare);
      setProductQty(1);
      setToast({ msg: `Tara de ${(tare * 1000).toFixed(0)}g confirmada como padrão`, type: 'success' });
    }
    setShowTareWarning(false);
    setTareWarning(null);
  };

  const handleTareWarningCancel = () => {
    setShowTareWarning(false);
    setTareWarning(null);
  };

  const handleTareWarningKeepCurrent = () => {
    if (ident.supplier && ident.product && productTare > 0) {
      // Confirmar la tara actual como predeterminada
      confirmTare(ident.supplier, ident.product, productTare);
      setToast({ msg: `Tara atual de ${(productTare * 1000).toFixed(0)}g mantida`, type: 'info' });
    }
    setShowTareWarning(false);
    setTareWarning(null);
  };

  const handleRegister = () => {
    if (!ident.supplier) {
        setToast({ msg: "Fornecedor não informado!", type: 'error' });
        return;
    }
    if (!ident.product) {
        setToast({ msg: "Produto não selecionado!", type: 'error' });
        return;
    }
    if (weight.current <= 0) {
        setToast({ msg: "Sem carga na balança!", type: 'error' });
        return;
    }
    if (weight.net <= 0) {
        setToast({ msg: "Peso líquido inválido!", type: 'error' });
        return;
    }
    if (!ident.targetWeight || parseFloat(ident.targetWeight) <= 0) {
        setToast({ msg: "Peso da Nota não digitado!", type: 'error' });
        return;
    }

    if (weight.tare > 0) {
        const learnedTare = productQty > 0 ? (productTare) : 0; 
        if (learnedTare > 0) {
            learn(ident.supplier, ident.product, learnedTare);
            setSuggestions({
                suppliers: getKnownSuppliers(),
                products: getKnownProducts()
            });
        }
    }

    const newRecord: WeighingRecord = {
        id: Date.now().toString(),
        supplier: ident.supplier,
        product: ident.product,
        targetWeight: parseFloat(ident.targetWeight) || 0,
        grossWeight: weight.current,
        tare: weight.tare,
        boxQuantity: productQty,
        netWeight: weight.net,
        timestamp: Date.now(),
        hasPhoto: !!photo,
        photoData: photo || undefined
    };

    saveRecord(newRecord);
    setHistoryRecords(getHistory());
    setToast({ msg: "Registro Salvo!", type: 'success' });
    
    const target = parseFloat(ident.targetWeight) || 0;
    if (target > 0) {
        const diff = weight.net - target;
        if (diff < -0.01) {
            addNotification('Falta de Peso', `${ident.supplier}: Faltam ${Math.abs(diff).toFixed(2)}kg.`, 'error', 'history');
        } else if (diff > 0.01) {
            addNotification('Sobra de Peso', `${ident.supplier}: Sobram ${diff.toFixed(2)}kg.`, 'warning', 'history');
        } else {
             addNotification('Conferência Exata', `${ident.supplier}: Peso exato.`, 'success', 'history');
        }
    } else {
        addNotification('Entrada Registrada', `${ident.supplier}: ${weight.net.toFixed(2)}kg`, 'info', 'ticket');
    }

    setWeight(prev => ({ ...prev, current: 0 }));
    setIdent({ supplier: '', product: '', targetWeight: '' });
    setProductTare(0);
    setProductQty(1);
    setPkgUnitWeight(0);
    setPkgQty(0);
    setPhoto(null);
  };

  return (
    <div className="min-h-screen bg-background font-body pb-safe relative overflow-x-hidden selection:bg-primary/30">
        <div className="relative z-10">
            <Header 
                currentView={view} 
                isMenuOpen={isMenuOpen}
                onCloseMenu={() => setIsMenuOpen(false)}
                onNavigate={setView}
                userName={userName}
                userPhoto={userPhoto}
                onUpdateProfile={handleUpdateProfile}
            />
        </div>
        
        <div className="relative z-10 pb-32 px-4 mt-2">
            <main className="flex flex-col gap-3 max-w-md mx-auto w-full">
                
                {view === 'weighing' && (
                    <>
                        <WeightCard 
                            data={weight} 
                            targetWeightRaw={ident.targetWeight}
                            onTargetWeightChange={(val) => setIdent(prev => ({ ...prev, targetWeight: val }))}
                            onWeightChange={(val) => setWeight(prev => ({ ...prev, current: val }))}
                            supplier={ident.supplier}
                            product={ident.product}
                            hasPhoto={!!photo}
                            onNextStep={() => supplierInputRef.current?.focus()}
                            grossWeightRef={grossWeightInputRef}
                        />

                        {/* Smart AI Advisor Bubble */}
                        <SmartAdvisor 
                            weight={weight} 
                            ident={ident} 
                            hasPhoto={!!photo} 
                            historyCount={historyRecords.length} 
                        />
                        
                        <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500">
                            
                            <IdentificationForm 
                                data={ident} 
                                onChange={setIdent} 
                                knownSuppliers={suggestions.suppliers}
                                knownProducts={suggestions.products}
                                onSupplierMatch={handleSupplierMatch}
                                supplierRef={supplierInputRef}
                                onNextStep={() => tareQtyInputRef.current?.focus()}
                            />

                            <TareControl 
                                mode={tareMode}
                                onChange={setTareMode}
                                onResetTare={handleResetTare}
                                currentTare={productTare}
                                onTareChange={setProductTare}
                                quantity={productQty}
                                onQuantityChange={setProductQty}
                                packagingUnitWeight={pkgUnitWeight}
                                onPackagingUnitWeightChange={setPkgUnitWeight}
                                packagingQuantity={pkgQty}
                                onPackagingQuantityChange={setPkgQty}
                                quantityRef={tareQtyInputRef}
                                onNextStep={() => grossWeightInputRef.current?.focus()}
                            />

                            <div className="grid grid-cols-[100px_1fr] gap-3 h-28">
                                <button 
                                    onClick={() => setIsAIOpen(true)}
                                    className="bg-surface hover:bg-surface-container rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group border border-transparent dark:border-white/5"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[#4a0996] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-rounded text-[24px]">smart_toy</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-[11px] font-black text-on-surface uppercase tracking-wide">AI Chat</h3>
                                        <p className="text-[9px] text-on-surface-variant font-medium">Perguntar</p>
                                    </div>
                                </button>
                                
                                <div className="rounded-[2rem] overflow-hidden h-full">
                                    <PhotoEvidence onPhotoCaptured={setPhoto} />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {view === 'history' && (
                    <div className="bg-surface rounded-3xl p-4 shadow-soft min-h-[70vh] border border-transparent dark:border-white/5">
                        <HistoryScreen 
                            onShowToast={(msg, type) => setToast({msg, type})} 
                            onOpenAI={() => setIsAIOpen(true)}
                        />
                    </div>
                )}
                
                {view === 'ticket' && <div className="bg-surface rounded-3xl p-4 shadow-soft min-h-[70vh] border border-transparent dark:border-white/5"><TicketScreen /></div>}
            </main>
        </div>

        <ActionFooter 
            activeView={view}
            onRegister={handleRegister}
            onHistory={() => setView('history')}
            onTicket={() => setView('ticket')}
            onWeighing={() => setView('weighing')}
            onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />
        
        <AIChatDrawer 
            isOpen={isAIOpen} 
            onClose={() => setIsAIOpen(false)} 
            records={historyRecords}
            currentWeight={weight}
            identification={ident}
            tareDetails={{
                mode: tareMode,
                productTare,
                productQty,
                pkgUnitWeight,
                pkgQty
            }}
        />

        {toast && (
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={() => setToast(null)} 
            />
        )}

        <TareWarningDialog
            isOpen={showTareWarning}
            warning={tareWarning}
            currentTare={productTare}
            onConfirm={handleTareWarningConfirm}
            onCancel={handleTareWarningCancel}
            onKeepCurrent={handleTareWarningKeepCurrent}
        />

        <InstallPrompt />
        <UpdateNotification />
    </div>
  );
};

export default App;