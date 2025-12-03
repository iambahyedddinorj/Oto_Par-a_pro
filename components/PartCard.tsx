
import React, { useState, useEffect } from 'react';
import { CarPartData } from '../types';

interface PartCardProps {
  data: CarPartData;
  imageUrl: string | null;
  loadingImage: boolean;
  onGenerateImage?: () => void;
}

export const PartCard: React.FC<PartCardProps> = ({ data, imageUrl, loadingImage, onGenerateImage }) => {
  const [copied, setCopied] = useState(false);
  const [crossRefInput, setCrossRefInput] = useState('');

  // Sync input with data props when they change
  useEffect(() => {
    setCrossRefInput(Array.isArray(data.oemCrossReference) ? data.oemCrossReference.join(', ') : '');
  }, [data.oemCrossReference]);

  const handleCopyOem = () => {
    if (data.oemNumber) {
      navigator.clipboard.writeText(data.oemNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBadgeColor = (type: string) => {
    if (type.includes('Orijinal')) return 'bg-blue-600 border-blue-500 text-white';
    if (type.includes('Muadil')) return 'bg-purple-600 border-purple-500 text-white';
    return 'bg-green-600 border-green-500 text-white';
  };

  return (
    <div className="w-full bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden flex flex-col md:flex-row shadow-xl hover:shadow-2xl transition-all duration-300 animate-fadeIn group">
      {/* Image Section */}
      <div className="w-full md:w-1/3 bg-slate-900 relative min-h-[250px] md:min-h-0">
        {imageUrl ? (
          <img src={imageUrl} alt={data.partName} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             {onGenerateImage && (
               <button
                 onClick={onGenerateImage}
                 disabled={loadingImage}
                 className="px-4 py-2 bg-slate-700 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600 hover:border-blue-500 flex items-center gap-2"
               >
                 {loadingImage ? (
                   <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Oluşturuluyor...</>
                 ) : (
                   <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Görsel Oluştur</>
                 )}
               </button>
             )}
          </div>
        )}
        {/* Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border shadow-lg ${getBadgeColor(data.type)}`}>
          {data.type}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
         <div className="flex justify-between items-start mb-4">
           <div>
             <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{data.partName}</h3>
             <p className="text-slate-400 text-sm flex items-center gap-2">
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">{data.vehicleModel}</span>
                <span className="text-slate-600">•</span>
                <span>{data.year}</span>
                <span className="text-slate-600">•</span>
                <span className="text-blue-400 font-semibold">{data.brand}</span>
             </p>
           </div>
           <div className="text-right">
             <div className="text-2xl font-bold text-green-400">{data.estimatedPriceRange}</div>
             <div className="text-xs text-slate-500">Ortalama Piyasa Fiyatı</div>
           </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">OEM Numarası</div>
              <button onClick={handleCopyOem} className="font-mono text-blue-300 hover:text-white flex items-center gap-2 transition-colors relative group/btn">
                 {data.oemNumber}
                 <svg className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                 {copied && <span className="absolute -top-8 left-0 bg-green-500 text-slate-900 text-xs font-bold px-2 py-1 rounded animate-fadeIn">Kopyalandı!</span>}
              </button>
            </div>
            <div>
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">Materyal</div>
               <div className="text-sm text-slate-300">{data.material || '-'}</div>
            </div>
            <div>
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">Ağırlık</div>
               <div className="text-sm text-slate-300">{data.weight || '-'}</div>
            </div>
            <div>
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">Montaj</div>
               <div className={`text-sm font-bold ${data.installationDifficulty === 'Kolay' ? 'text-green-400' : data.installationDifficulty === 'Zor' ? 'text-red-400' : 'text-yellow-400'}`}>
                 {data.installationDifficulty}
               </div>
            </div>
         </div>

         {/* Description */}
         <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
           {data.description}
         </p>

         {/* Cross Reference Input */}
         <div className="mt-auto bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">OEM Cross Reference / Çapraz Kodlar</label>
            <input 
               type="text" 
               value={crossRefInput}
               onChange={(e) => setCrossRefInput(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500 focus:outline-none transition-colors font-mono"
               placeholder="Çapraz referans kodları..."
            />
            <p className="text-[10px] text-slate-600 mt-1">Kodları virgül ile ayırarak düzenleyebilirsiniz.</p>
         </div>
      </div>
    </div>
  );
};
