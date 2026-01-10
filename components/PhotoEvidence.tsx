import React, { useRef, useState } from 'react';

interface Props {
    onPhotoCaptured: (base64: string | null) => void;
}

const PhotoEvidence: React.FC<Props> = ({ onPhotoCaptured }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleMainButtonClick = () => {
    if (!preview) cameraInputRef.current?.click();
  };

  const clearPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreview(null);
      onPhotoCaptured(null);
  };

  const processImage = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.font = 'bold 20px sans-serif';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                const dateStr = new Date().toLocaleString('pt-BR');
                const metrics = ctx.measureText(dateStr);
                ctx.fillRect(canvas.width - metrics.width - 30, canvas.height - 45, metrics.width + 20, 35);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(dateStr, canvas.width - metrics.width - 20, canvas.height - 20);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setPreview(dataUrl);
                onPhotoCaptured(dataUrl);
            }
            setIsProcessing(false);
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processImage(e.target.files[0]);
    e.target.value = ''; 
  };

  return (
    <section className="w-full h-full">
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />

      {isProcessing ? (
          <div className="w-full h-28 flex flex-col items-center justify-center bg-surface-container-high rounded-[2rem]">
              <span className="material-symbols-rounded animate-spin text-primary text-3xl mb-1">progress_activity</span>
              <span className="text-[10px] font-bold text-on-surface-variant">Processando...</span>
          </div>
      ) : preview ? (
         <div className="relative w-full h-28 rounded-[2rem] overflow-hidden shadow-md group bg-black">
             <img src={preview} alt="Evidence" className="w-full h-full object-cover opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
             <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-lg">
                 <span className="material-symbols-rounded text-[12px]">check_circle</span> Salvo
             </div>
             <button onClick={clearPhoto} className="absolute bottom-2 right-2 bg-error text-white p-2 rounded-xl shadow-xl flex items-center gap-1 transform active:scale-95 transition-all">
                 <span className="material-symbols-rounded text-[18px]">delete</span>
             </button>
         </div>
      ) : (
         <div className="w-full h-28 bg-surface rounded-[2rem] overflow-hidden shadow-sm relative group hover:bg-surface-container transition-colors">
            <button onClick={handleMainButtonClick} className="w-full h-full flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-rounded text-[24px]">add_a_photo</span>
                </div>
                <div className="text-center">
                    <h3 className="text-[11px] font-black text-on-surface uppercase tracking-wide">Foto</h3>
                    <p className="text-[9px] text-on-surface-variant font-medium">Toque p/ abrir</p>
                </div>
            </button>
            <button onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }} className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 bg-surface-container shadow-sm rounded-lg text-on-surface-variant active:scale-90 transition-transform">
                <span className="material-symbols-rounded text-[16px]">photo_library</span>
            </button>
         </div>
      )}
    </section>
  );
};

export default PhotoEvidence;