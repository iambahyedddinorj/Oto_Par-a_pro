
import React, { useState, useRef, useEffect } from 'react';
import { analyzeCarPart, generatePartImage } from '../services/gemini';
import { SearchResult, User, PartCategory, CarPartData } from '../types';
import { BrandSelector } from './BrandSelector';
import { PartCard } from './PartCard';
import { FilterBar } from './FilterBar';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToAdmin: () => void;
}

// Icons
const SearchIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const SparklesIcon = () => (<svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 5H7a1 1 0 010-2h7.586l-1.293-1.293A1 1 0 0112 1z" clipRule="evenodd" /></svg>);
const MenuIcon = () => (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>);
const OemIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>);
const WizardIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>);

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout, onNavigateToProfile, onNavigateToAdmin }) => {
  const [query, setQuery] = useState('');
  const [oemQuery, setOemQuery] = useState('');
  
  // Search Mode: 'wizard' | 'oem'
  const [searchMode, setSearchMode] = useState<'wizard' | 'oem'>('wizard');
  
  // Selection State
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Results State (Now Array)
  const [result, setResult] = useState<SearchResult>({ data: [], loading: false, error: null });
  // Map partId to imageUrl
  const [images, setImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  // Filter & Sort State
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [activeSort, setActiveSort] = useState('recommended');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (searchQuery: string, categoryName?: string, subCategoryName?: string, isOem: boolean = false) => {
     setResult({ data: [], loading: true, error: null });
     setImages({});
     
     try {
       const brandContext = selectedBrand || '';
       const modelContext = selectedModel || '';
       const yearContext = selectedYear || '';
       const categoryContext = categoryName || '';
       
       // Call API to get LIST of parts
       const dataList = await analyzeCarPart(
         searchQuery, 
         brandContext, 
         modelContext, 
         yearContext, 
         categoryContext, 
         subCategoryName, 
         isOem
       );
       
       setResult({ data: dataList, loading: false, error: null });

       const primaryPart = dataList.find(p => p.type.includes('Orijinal')) || dataList[0];
       if (primaryPart) {
         handleGenerateImage(primaryPart);
       }
 
     } catch (error) {
       console.error(error);
       setResult({ data: [], loading: false, error: "Parça bilgileri alınırken bir hata oluştu." });
     }
  };

  const handleGenerateImage = async (part: CarPartData) => {
    if (images[part.id] || loadingImages[part.id]) return;

    setLoadingImages(prev => ({ ...prev, [part.id]: true }));
    const base64 = await generatePartImage(part);
    setImages(prev => ({ ...prev, [part.id]: base64 }));
    setLoadingImages(prev => ({ ...prev, [part.id]: false }));
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeSearch(query);
  };

  const handleOemSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oemQuery.trim()) return;
    executeSearch(oemQuery, undefined, undefined, true);
  };

  const handleSubCategorySelect = (category: PartCategory, subCategoryName: string) => {
    const fullQuery = `${subCategoryName}`;
    setQuery(fullQuery);
    executeSearch(fullQuery, category.name, subCategoryName);
  };

  const handleReset = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setQuery('');
    setOemQuery('');
    setResult({ data: [], loading: false, error: null });
  };

  const handleSwitchMode = (mode: 'wizard' | 'oem') => {
    handleReset();
    setSearchMode(mode);
  }

  // Filter Logic
  const getFilteredAndSortedResults = () => {
    let filtered = [...result.data];

    if (activeFilter !== 'Tümü') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }

    if (activeSort === 'priceAsc') {
      filtered.sort((a, b) => a.priceNumeric - b.priceNumeric);
    } else if (activeSort === 'priceDesc') {
      filtered.sort((a, b) => b.priceNumeric - a.priceNumeric);
    }

    return filtered;
  };

  const displayResults = getFilteredAndSortedResults();

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Navbar */}
      <nav className="w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 fixed top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">OtoParça Pro</span>
          </div>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none">
              <MenuIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn origin-top-right">
                 <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/50">
                   <p className="text-white font-bold truncate">{currentUser.name}</p>
                   <p className="text-xs text-slate-500 truncate">{currentUser.username}</p>
                 </div>
                 <div className="p-2 space-y-1">
                   {currentUser.role === 'admin' && (
                     <button onClick={() => { onNavigateToAdmin(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-purple-400 hover:bg-purple-500/10 rounded-xl flex items-center gap-3 transition-colors">Admin Paneli</button>
                   )}
                   <button onClick={() => { onNavigateToProfile(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl flex items-center gap-3 transition-colors">Profilim</button>
                   <div className="h-px bg-slate-700/50 mx-2 my-1"></div>
                   <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-colors">Çıkış Yap</button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full pt-24 px-4 container mx-auto flex flex-col items-center">
        {!result.data.length && !result.loading && (
          <header className="text-center mb-8 animate-fadeInDown w-full max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-300 text-sm font-semibold mb-4 backdrop-blur-sm">
              <SparklesIcon /><span>AI Destekli Araç Asistanı</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6 tracking-tight">
              Parça <span className="text-blue-500">Sihirbazı</span>
            </h1>
            
            {/* Mode Switcher */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800/80 p-1.5 rounded-xl inline-flex border border-slate-700/50">
                <button 
                  onClick={() => handleSwitchMode('wizard')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${searchMode === 'wizard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <WizardIcon />
                  Parça Sihirbazı
                </button>
                <button 
                  onClick={() => handleSwitchMode('oem')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${searchMode === 'oem' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <OemIcon />
                  OEM No ile Bul
                </button>
              </div>
            </div>
          </header>
        )}

        {/* --- MODE: WIZARD --- */}
        {searchMode === 'wizard' && (
          <div className={`w-full max-w-5xl mb-12 transition-all duration-500 ${result.data.length ? 'hidden' : 'block'}`}>
            <BrandSelector 
              selectedBrand={selectedBrand} 
              selectedModel={selectedModel}
              selectedYear={selectedYear}
              allowedBrands={currentUser.role === 'user' ? currentUser.allowedBrands : undefined}
              onSelectBrand={(b) => { setSelectedBrand(b); setSelectedModel(null); setSelectedYear(null); }}
              onSelectModel={(m) => { setSelectedModel(m); setSelectedYear(null); }}
              onSelectYear={(y) => { setSelectedYear(y); }}
              onPartSelected={handleSubCategorySelect}
              onReset={handleReset}
            />
            
            {/* Manual Search Fallback inside Wizard */}
            {selectedYear && (
              <div className="mt-8 pt-8 border-t border-slate-800 animate-fadeIn">
                <p className="text-center text-slate-500 text-sm mb-4">veya manuel arama yapın</p>
                <form onSubmit={handleManualSearch} className="relative group max-w-2xl mx-auto">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500"><SearchIcon /></div>
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Örn: Sol Ön Kapı, Turbo, Silecek..." className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border-2 border-slate-700 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all shadow-xl" />
                  <button type="submit" disabled={result.loading} className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">Ara</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- MODE: OEM SEARCH --- */}
        {searchMode === 'oem' && !result.data.length && (
          <div className="w-full max-w-3xl mb-12 animate-fadeInUp">
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl text-center">
              <h3 className="text-2xl font-bold text-white mb-2">OEM Numarası Sorgula</h3>
              <p className="text-slate-400 mb-8">Parça numarasını girin, aracınıza uygunluğunu ve fiyatını anında öğrenin.</p>
              
              <form onSubmit={handleOemSearch} className="relative group max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                  <span className="font-mono font-bold text-lg text-purple-500">#</span>
                </div>
                <input 
                  type="text" 
                  value={oemQuery} 
                  onChange={(e) => setOemQuery(e.target.value)} 
                  placeholder="Örn: 1J0 615 301, 5N0 820 803..." 
                  className="w-full pl-10 pr-32 py-5 bg-slate-900 border-2 border-purple-500/30 focus:border-purple-500 rounded-2xl text-xl font-mono text-white placeholder-slate-600 focus:outline-none transition-all shadow-xl" 
                />
                <button 
                  type="submit" 
                  disabled={result.loading} 
                  className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <SearchIcon />
                  Sorgula
                </button>
              </form>
              
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">1J0615301</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">8K0 407 151 F</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Bosch 0242236564</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="w-full pb-20">
           {/* Back Button */}
           {result.data.length > 0 && (
             <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center animate-fadeIn">
                <button onClick={handleReset} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Yeni Arama
                </button>
                {searchMode === 'oem' && (
                  <span className="text-purple-400 text-sm font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    OEM Sorgusu: {oemQuery}
                  </span>
                )}
             </div>
           )}

           {result.data.length > 0 && (
             <FilterBar 
                resultCount={displayResults.length}
                activeFilter={activeFilter}
                activeSort={activeSort}
                onFilterChange={setActiveFilter}
                onSortChange={setActiveSort}
             />
           )}

           {/* List of Results */}
           <div className="max-w-5xl mx-auto space-y-6">
             {displayResults.map(item => (
               <PartCard 
                 key={item.id} 
                 data={item} 
                 imageUrl={images[item.id] || null}
                 loadingImage={!!loadingImages[item.id]}
                 onGenerateImage={() => handleGenerateImage(item)}
               />
             ))}
           </div>

           {/* Loading Overlay */}
           {result.loading && (
             <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold text-white animate-pulse">Parçalar ve Alternatifler Hazırlanıyor...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
