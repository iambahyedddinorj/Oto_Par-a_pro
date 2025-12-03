
import React, { useState, useEffect } from 'react';
import { Brand, PartCategory } from '../types';

interface BrandSelectorProps {
  selectedBrand: string | null;
  selectedModel: string | null;
  selectedYear: string | null;
  allowedBrands?: string[];
  onSelectBrand: (brandName: string) => void;
  onSelectModel: (modelName: string) => void;
  onSelectYear: (year: string) => void;
  onPartSelected: (category: PartCategory, subCategoryName: string) => void;
  onReset: () => void;
}

export const BRANDS: Brand[] = [
  // German Big 3 + VW Group
  { 
    id: 'mercedes', 
    name: 'Mercedes-Benz', 
    logoColor: 'bg-slate-700',
    models: [
      // A Class
      'A-Class (W176)', 'A-Class (W177)', 'A180 CDI', 'A200 AMG', 'A45 AMG',
      // B Class
      'B-Class (W246)', 'B-Class (W247)',
      // C Class
      'C-Class (W203)', 'C-Class (W204)', 'C-Class (W205)', 'C-Class (W206)',
      'C180 Kompressor', 'C200d Bluetec', 'C63 AMG',
      // E Class
      'E-Class (W211)', 'E-Class (W212)', 'E-Class (W213)',
      'E180', 'E250 CDI', 'E300', 'E63 AMG',
      // S Class Specifics
      'S-Class (W221)', 'S-Class (W222)', 'S-Class (W223)',
      'S320 CDI', 'S350 BlueTec', 'S400 Hybrid', 'S500 (V8)', 'S600 (V12)', 'S63 AMG',
      'Maybach S-Class', 'Maybach S580', 'Maybach S680', 'Maybach GLS 600',
      // CLA / CLS
      'CLA (C117)', 'CLA (C118)', 
      'CLS (C218)', 'CLS (C257)',
      // SUVs
      'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class (W463)',
      // Commercial
      'Vito (W639)', 'Vito (W447)', 'Sprinter', 'Citan', 'X-Class'
    ]
  },
  { 
    id: 'bmw', 
    name: 'BMW', 
    logoColor: 'bg-sky-600',
    models: [
      // 1 Series
      '1 Serisi (E87)', '1 Serisi (F20)', '1 Serisi (F40)',
      // 3 Series
      '3 Serisi (E36)', '3 Serisi (E46)', '3 Serisi (E90)', '3 Serisi (F30)', '3 Serisi (G20)',
      '316i', '318i', '320i ED', '320d', 'M3',
      // 4 Series
      '4 Serisi (F32)', '4 Serisi (G22)', '4 Serisi Gran Coupe',
      // 5 Series
      '5 Serisi (E39)', '5 Serisi (E60)', '5 Serisi (F10)', '5 Serisi (G30)', '5 Serisi (G60)',
      '520d', '520i', '525xd', '530i', 'M5',
      // 7 Series
      '7 Serisi (E65)', '7 Serisi (F01)', '7 Serisi (G11)', '7 Serisi (G70)',
      // SUVs
      'X1 (E84)', 'X1 (F48)', 
      'X3 (F25)', 'X3 (G01)', 
      'X5 (E53)', 'X5 (E70)', 'X5 (F15)', 'X5 (G05)',
      'X6', 'iX'
    ]
  },
  { 
    id: 'audi', 
    name: 'Audi', 
    logoColor: 'bg-red-600',
    models: [
      'A3 (8P)', 'A3 (8V)', 'A3 (8Y)', 'S3',
      'A4 (B6)', 'A4 (B7)', 'A4 (B8)', 'A4 (B9)',
      'A5 (8T)', 'A5 (F5)',
      'A6 (C6)', 'A6 (C7)', 'A6 (C8)',
      'A7 Sportback',
      'A8 (D3)', 'A8 (D4)', 'A8 (D5)',
      'Q2', 'Q3', 'Q5', 'Q7', 'Q8',
      'TT', 'e-tron'
    ]
  },
  { 
    id: 'vw', 
    name: 'Volkswagen', 
    logoColor: 'bg-blue-600',
    models: [
      // Golf Generations
      'Golf 4 (IV)', 'Golf 5 (V)', 'Golf 6 (VI)', 'Golf 7 (VII)', 'Golf 7.5', 'Golf 8 (VIII)', 'Golf GTI', 'Golf R',
      // Passat Generations
      'Passat B5', 'Passat B5.5', 'Passat B6', 'Passat B7', 'Passat B8', 'Passat Variant', 'Passat CC',
      // Polo
      'Polo (6N)', 'Polo (9N)', 'Polo (6R)', 'Polo (AW)',
      // Jetta & Bora
      'Bora', 'Jetta MK5', 'Jetta MK6',
      // Commercial & SUV
      'Caddy MK3', 'Caddy MK4', 'Caddy MK5',
      'Transporter T4', 'Transporter T5', 'Transporter T6', 'Caravelle',
      'Tiguan MK1', 'Tiguan MK2', 'Touareg', 'Amarok', 'Arteon', 'Scirocco', 'T-Roc'
    ]
  },
  { 
    id: 'opel', 
    name: 'Opel', 
    logoColor: 'bg-yellow-500 text-black',
    models: [
      // Vectra Ailesi
      'Vectra A (1988-1995)', 'Vectra A GT',
      'Vectra B (1995-2002)', 'Vectra B 2.0 CDX', 'Vectra B 2.5 V6', 'Vectra B 1.6 Comfort',
      'Vectra C (2002-2008)', 'Vectra C 1.9 CDTI', 'Vectra C OPC',
      
      // Astra Ailesi
      'Astra F', 'Astra F GSI',
      'Astra G (1998-2004)', 'Astra G 1.6 16V', 'Astra G Bertone',
      'Astra H (2004-2009)', 'Astra H 1.3 CDTI', 'Astra H GTC',
      'Astra J (2009-2015)', 'Astra J 1.4 Turbo', 'Astra J 1.6 CDTI',
      'Astra K (2015-2021)', 'Astra L (2021-Present)',
      
      // Corsa Ailesi
      'Corsa B (1993-2000)', 'Corsa B GSI',
      'Corsa C (2000-2006)', 'Corsa C 1.7 DTI', 'Corsa C 1.3 CDTI',
      'Corsa D (2006-2014)', 'Corsa D OPC',
      'Corsa E (2014-2019)', 
      'Corsa F (2019-Present)', 'Corsa-e',

      // Insignia
      'Insignia A (2008-2017)', 'Insignia A 2.0 Turbo 4x4', 'Insignia OPC',
      'Insignia B (2017-2022)', 'Insignia B GSI',

      // Others
      'Omega B', 'Omega B 2.5 V6', 'Omega B 3.0 MV6',
      'Tigra A', 'Tigra B TwinTop',
      'Mokka', 'Mokka X', 'Mokka-e',
      'Crossland', 'Crossland X',
      'Grandland X', 'Grandland',
      'Zafira A', 'Zafira B', 'Zafira C Tourer',
      'Meriva A', 'Meriva B',
      'Adam', 'Karl',
      
      // Commercial
      'Combo C', 'Combo D', 'Combo E', 
      'Vivaro A', 'Vivaro B', 'Vivaro C',
      'Movano'
    ]
  },
  { 
    id: 'porsche', 
    name: 'Porsche', 
    logoColor: 'bg-yellow-600 text-black',
    models: [
      '911 (997)', '911 (991)', '911 (992)',
      'Cayenne (955)', 'Cayenne (958)', 'Cayenne (E3)',
      'Macan', 'Panamera (970)', 'Panamera (971)',
      'Taycan', '718 Cayman/Boxster'
    ]
  },
  
  // French Group
  { 
    id: 'renault', 
    name: 'Renault', 
    logoColor: 'bg-yellow-400 text-black',
    models: [
      'Clio 2', 'Clio 3', 'Clio 4', 'Clio 5', 'Clio Symbol',
      'Megane 1', 'Megane 2', 'Megane 3', 'Megane 4',
      'Fluence', 'Symbol', 'Taliant',
      'Laguna 1', 'Laguna 2', 'Laguna 3', 'Talisman',
      'Captur', 'Kadjar', 'Austral', 'Koleos',
      'Kangoo 1', 'Kangoo 2', 'Kangoo 3',
      'Traffic', 'Master', 'Broadway (R9)', 'R19 Europa'
    ]
  },
  { 
    id: 'peugeot', 
    name: 'Peugeot', 
    logoColor: 'bg-blue-800',
    models: [
      // 100 Series
      '106', '106 GTI', '106 Quiksilver',
      '107', '108',
      
      // 200 Series
      '206', '206+', '206 GTI', '206 RC', '206 CC', '206 Sedan',
      '207', '207 GT', '207 RC', '207 CC', '207 Outdoor',
      '208 Mk1 (2012-2019)', '208 Mk2 (2019-Present)', 'e-208', '208 GTI',

      // 300 Series
      '301',
      '306', '306 GTI-6', '306 Cabriolet',
      '307', '307 SW', '307 CC',
      '308 Mk1 (T7)', '308 Mk2 (T9)', '308 Mk3 (P5)', '308 GT', '308 GTI',

      // 400 Series
      '406', '406 Coupe (Pininfarina)', '406 2.0 HDi',
      '407', '407 Coupe', '407 SW',
      '408 (Crossover Coupe)',

      // 500 Series
      '508 Mk1 (2010-2018)', '508 Mk2 (2018-Present)', '508 SW', '508 PSE (Sport Engineered)',
      '5008 Mk1 (MPV)', '5008 Mk2 (SUV)',

      // SUV / Crossover
      '2008 Mk1', '2008 Mk2', 'e-2008',
      '3008 Mk1', '3008 Mk2', '3008 Mk3', '3008 Hybrid4',
      
      // Sport / Luxury
      'RCZ', 'RCZ R',

      // Commercial
      'Partner (M49)', 'Partner (M59)', 'Partner Tepee (B9)', 'Rifter (K9)',
      'Bipper', 'Expert', 'Boxer', 'Traveller'
    ]
  },
  { 
    id: 'citroen', 
    name: 'Citroën', 
    logoColor: 'bg-red-500',
    models: [
      'C3', 'C3 Aircross', 'C4', 'C4 Picasso', 'C4 X', 'C5', 'C5 Aircross',
      'C-Elysee', 'Berlingo', 'Nemo', 'Saxo', 'Xsara'
    ]
  },

  // Italian Group
  { 
    id: 'fiat', 
    name: 'Fiat', 
    logoColor: 'bg-red-700',
    models: [
      'Egea Sedan', 'Egea Cross', 'Egea HB',
      'Linea', 'Albea', 'Palio', 'Siena',
      'Punto', 'Grande Punto', 'Punto Evo',
      'Doblo 1', 'Doblo 2', 'Doblo 3', 'Doblo 4',
      'Fiorino', 'Ducato',
      '500', '500X', '500L',
      'Bravo', 'Stilo', 'Marea', 'Tempra', 'Tipo (Eski)', 'Uno', 'Şahin/Doğan (Tofaş)'
    ]
  },
  { 
    id: 'alfa', 
    name: 'Alfa Romeo', 
    logoColor: 'bg-red-800',
    models: ['Giulietta', 'Giulia', 'Stelvio', 'Tonale', '159', '156', '147', 'GT', 'Mito']
  },

  // Asian (Japanese/Korean)
  { 
    id: 'toyota', 
    name: 'Toyota', 
    logoColor: 'bg-red-600',
    models: [
      'Corolla (AE101 - Efsane)', 'Corolla (Terra/Sol)', 'Corolla (E120)', 'Corolla (E140/E150)', 'Corolla (E160)', 'Corolla (E210 - Hybrid)',
      'Yaris', 'Auris', 'Avensis', 'Camry', 'C-HR', 'RAV4', 'Hilux', 'Proace'
    ]
  },
  { 
    id: 'honda', 
    name: 'Honda', 
    logoColor: 'bg-red-600',
    models: [
      'Civic (EG)', 'Civic (EK - 1.4/1.6ies)', 'Civic (ES7 - VTEC)', 'Civic (FD6)', 'Civic (FB7)', 'Civic (FC5)', 'Civic (FE1)',
      'City', 'Jazz', 'CR-V', 'HR-V', 'Accord'
    ]
  },
  { 
    id: 'hyundai', 
    name: 'Hyundai', 
    logoColor: 'bg-blue-700',
    models: [
      'Accent (Yumurta)', 'Accent (Milenyum)', 'Accent Admire', 'Accent Era', 'Accent Blue',
      'i10', 'i20', 'i30', 'Elantra', 'Tucson', 'Bayon', 'Kona', 'Getz', 'Starex'
    ]
  },
  { 
    id: 'nissan', 
    name: 'Nissan', 
    logoColor: 'bg-slate-600',
    models: ['Qashqai (J10)', 'Qashqai (J11)', 'Qashqai (J12)', 'Juke', 'X-Trail', 'Micra', 'Navara', 'Primera', 'Almera']
  },

  // American / Other
  { 
    id: 'ford', 
    name: 'Ford', 
    logoColor: 'bg-blue-800',
    models: [
      'Focus 1', 'Focus 2', 'Focus 2.5', 'Focus 3', 'Focus 3.5', 'Focus 4',
      'Fiesta', 'Mondeo', 'Fusion',
      'Courier', 'Connect', 'Custom', 'Transit',
      'Kuga', 'Puma', 'Ranger', 'Escort', 'Taunus'
    ]
  },
  { 
    id: 'skoda', 
    name: 'Skoda', 
    logoColor: 'bg-green-600',
    models: ['Octavia A4', 'Octavia A5', 'Octavia A7', 'Octavia A8', 'Superb', 'Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Scala', 'Rapid']
  },
  { 
    id: 'seat', 
    name: 'Seat', 
    logoColor: 'bg-red-600',
    models: ['Leon MK2', 'Leon MK3', 'Leon MK4', 'Ibiza', 'Toledo', 'Ateca', 'Arona', 'Altea']
  },
  { 
    id: 'dacia', 
    name: 'Dacia', 
    logoColor: 'bg-green-700',
    models: ['Duster', 'Sandero', 'Sandero Stepway', 'Lodgy', 'Dokker', 'Logan', 'Jogger']
  },
  {
    id: 'togg',
    name: 'Togg',
    logoColor: 'bg-blue-500',
    models: ['T10X V1', 'T10X V2 Long Range']
  }
];

const PART_CATEGORIES: PartCategory[] = [
  { 
    id: 'engine', 
    name: 'Motor ve Aksamları', 
    icon: '⚙️', 
    keywords: 'piston, segman, subap, eksantrik, motor kulağı, conta',
    subCategories: ['Piston Takımı', 'Segman Seti', 'Subap Takımı', 'Eksantrik Mili', 'Silindir Kapak Contası', 'Motor Kulağı', 'Yağ Pompası', 'Karter', 'Krank Kasnağı', 'Triger Seti', 'V Kayışı', 'Turboşarj']
  },
  { 
    id: 'brake', 
    name: 'Fren Sistemi', 
    icon: '🛑', 
    keywords: 'balata, disk, kampana, fren merkezi, abs sensörü',
    subCategories: ['Ön Fren Balatası', 'Arka Fren Balatası', 'Ön Fren Diski', 'Arka Fren Diski', 'Fren Ana Merkezi', 'Tekerlek Silindiri', 'ABS Sensörü', 'El Freni Teli', 'Fren Hortumu', 'Westinghouse']
  },
  { 
    id: 'filter', 
    name: 'Filtre Grubu', 
    icon: '🌪️', 
    keywords: 'yağ filtresi, hava filtresi, polen filtresi, yakıt filtresi',
    subCategories: ['Yağ Filtresi', 'Hava Filtresi', 'Polen (Kabin) Filtresi', 'Yakıt (Mazot/Benzin) Filtresi', 'Şanzıman Filtresi', 'LPG Filtresi']
  },
  { 
    id: 'suspension', 
    name: 'Süspansiyon & Yürüyen', 
    icon: '🚙', 
    keywords: 'amortisör, helezon, salıncak, rotil, rot başı',
    subCategories: ['Ön Amortisör', 'Arka Amortisör', 'Helezon Yayı', 'Salıncak (Tablalar)', 'Rotil', 'Rot Başı', 'Rot Mili', 'Z Rotu', 'Porya Rulmanı', 'Aks Kafası', 'Aks Mili']
  },
  { 
    id: 'electrical', 
    name: 'Elektrik & Aydınlatma', 
    icon: '⚡', 
    keywords: 'far, stop, akü, marş dinamosu, şarj dinamosu, buji',
    subCategories: ['Far (Sağ/Sol)', 'Stop Lambası', 'Sinyal Lambası', 'Sis Farı', 'Marş Dinamosu', 'Şarj Dinamosu', 'Ateşleme Bobini', 'Buji', 'Kızdırma Bujisi', 'Cam Açma Düğmesi', 'Korna', 'Park Sensörü']
  },
  { 
    id: 'body', 
    name: 'Kaporta & Karoser', 
    icon: '🚗', 
    keywords: 'tampon, çamurluk, kaput, ayna, silecek',
    subCategories: ['Ön Tampon', 'Arka Tampon', 'Çamurluk', 'Motor Kaputu', 'Yan Ayna', 'Kapı Kolu', 'Silecek Süpürgesi', 'Silecek Motoru', 'Bagaj Amortisörü', 'Panjur', 'Davlumbaz']
  },
  { 
    id: 'cooling', 
    name: 'Isıtma & Soğutma', 
    icon: '❄️', 
    keywords: 'radyatör, devirdaim, termostat, fan, klima kompresörü',
    subCategories: ['Su Radyatörü', 'Klima Radyatörü', 'Kalorifer Radyatörü', 'Devirdaim Pompası', 'Termostat', 'Radyatör Fanı', 'Klima Kompresörü', 'Genleşme Kabı', 'Radyatör Hortumu']
  },
  { 
    id: 'transmission', 
    name: 'Debriyaj & Şanzıman', 
    icon: '🕹️', 
    keywords: 'baskı balata, debriyaj seti, volan, şanzıman kulağı',
    subCategories: ['Debriyaj Seti (Baskı Balata)', 'Volan (Oynar Göbek)', 'Debriyaj Rulmanı', 'Debriyaj Üst Merkezi', 'Şanzıman Kulağı', 'Aks Körüğü', 'Vites Topuzu']
  }
];

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  selectedBrand,
  selectedModel,
  selectedYear,
  allowedBrands,
  onSelectBrand,
  onSelectModel,
  onSelectYear,
  onPartSelected,
  onReset
}) => {
  const [lockedBrand, setLockedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1980 - 2025 Years (Expanded for older models like Vectra A/B)
  const years = Array.from({ length: 46 }, (_, i) => (2025 - i).toString());

  // Filter Brands Logic (Combined Search + Permissions)
  const filteredBrands = BRANDS.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    brand.models.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If a brand is selected, we filter models if searching
  const filteredModels = selectedBrand 
    ? BRANDS.find(b => b.name === selectedBrand)?.models.filter(m => 
        m.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : [];

  // Reset category if main selection changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedBrand, selectedModel, selectedYear]);

  // Handle Breadcrumb Clicks
  const handleBreadcrumbClick = (step: 'brand' | 'model' | 'year' | 'category') => {
    if (step === 'brand') {
      onSelectBrand(''); // Reset everything
      onSelectModel('');
      onSelectYear('');
      setSelectedCategory(null);
    } else if (step === 'model') {
      onSelectModel('');
      onSelectYear('');
      setSelectedCategory(null);
    } else if (step === 'year') {
      onSelectYear('');
      setSelectedCategory(null);
    } else if (step === 'category') {
      setSelectedCategory(null);
    }
  };

  // STEP 1: BRAND SELECTION
  if (!selectedBrand) {
    return (
      <div key="step-brand" className="w-full animate-fadeInRight">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Marka veya Model ara (Örn: Vectra B, Golf 7, Mercedes W204...)"
            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-lg"
          />
        </div>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">1</span>
          Araç Markasını Seçin
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredBrands.map((brand, index) => {
            const isLocked = allowedBrands && allowedBrands.length > 0 && !allowedBrands.includes(brand.name);
            return (
              <button
                key={brand.id}
                onClick={() => {
                  if (isLocked) {
                    setLockedBrand(brand.name);
                  } else {
                    onSelectBrand(brand.name);
                    setSearchTerm(''); // Reset search after select
                  }
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`relative group p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 h-32 animate-fadeInUp
                  ${isLocked 
                    ? 'bg-slate-900 border-slate-800 opacity-75 grayscale cursor-not-allowed hover:bg-slate-800' 
                    : 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-1'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md ${brand.logoColor} group-hover:scale-110 transition-transform`}>
                  {brand.name.substring(0, 1)}
                </div>
                <span className="font-semibold text-sm text-slate-300 group-hover:text-white text-center">
                  {brand.name}
                </span>
                {isLocked && (
                  <div className="absolute top-2 right-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Locked Modal */}
        {lockedBrand && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl text-center animate-zoomIn">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Erişim Kısıtlı</h3>
              <p className="text-slate-400 mb-6">
                <span className="text-white font-bold">{lockedBrand}</span> markasına erişim yetkiniz bulunmamaktadır.
                Erişim satın almak için lütfen sistem yöneticisi ile iletişime geçin.
              </p>
              <a href="tel:+905425757098" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mb-4 transition-colors tracking-tighter">
                📞 +90 (542) 575 70-98
              </a>
              <button 
                onClick={() => setLockedBrand(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Common Header (Breadcrumbs)
  const renderHeader = () => (
    <div className="flex flex-wrap items-center gap-2 mb-6 text-sm md:text-base animate-fadeInDown bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <button onClick={() => handleBreadcrumbClick('brand')} className="text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">
        {selectedBrand}
      </button>
      
      {selectedModel && (
        <>
          <span className="text-slate-600">/</span>
          <button onClick={() => handleBreadcrumbClick('model')} className="text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">
            {selectedModel}
          </button>
        </>
      )}
      
      {selectedYear && (
        <>
          <span className="text-slate-600">/</span>
          <button onClick={() => handleBreadcrumbClick('year')} className="text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">
            {selectedYear}
          </button>
        </>
      )}

      {selectedCategory && (
        <>
          <span className="text-slate-600">/</span>
          <button onClick={() => handleBreadcrumbClick('category')} className="text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">
             {selectedCategory.name}
          </button>
        </>
      )}
      
      <button onClick={onReset} className="ml-auto text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
        Baştan Başla
      </button>
    </div>
  );

  // STEP 2: MODEL SELECTION
  if (!selectedModel) {
    return (
      <div key="step-model" className="w-full animate-fadeInRight">
        {renderHeader()}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">2</span>
          Model Seçin
        </h2>
        
        {/* Model Search */}
        <div className="mb-4">
           <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`${selectedBrand} içinde model ara...`}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredModels.map((model, index) => (
            <button
              key={model}
              onClick={() => {
                onSelectModel(model);
                setSearchTerm('');
              }}
              style={{ animationDelay: `${index * 30}ms` }}
              className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-750 hover:shadow-lg transition-all text-slate-300 hover:text-white font-medium animate-fadeInUp text-center"
            >
              {model}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // STEP 3: YEAR SELECTION
  if (!selectedYear) {
    return (
      <div key="step-year" className="w-full animate-fadeInRight">
        {renderHeader()}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">3</span>
          Yıl Seçin
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {years.map((year, index) => (
            <button
              key={year}
              onClick={() => onSelectYear(year)}
              style={{ animationDelay: `${index * 20}ms` }}
              className="py-3 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-600 hover:text-white transition-all text-slate-300 font-bold animate-fadeInUp"
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // STEP 4: CATEGORY SELECTION
  if (!selectedCategory) {
     return (
        <div key="step-category" className="w-full animate-fadeInRight">
           {renderHeader()}
           <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">4</span>
              Parça Kategorisi Seçin
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PART_CATEGORIES.map((category, index) => (
                 <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:border-blue-500 hover:bg-slate-750 hover:shadow-xl transition-all group animate-fadeInUp h-40"
                 >
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                    <span className="font-semibold text-slate-200 group-hover:text-white text-center">{category.name}</span>
                 </button>
              ))}
           </div>
        </div>
     );
  }

  // STEP 5: SUB-CATEGORY SELECTION (Specific Part)
  return (
    <div key="step-part" className="w-full animate-fadeInRight">
       {renderHeader()}
       <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">5</span>
          Hangi Parçayı Arıyorsunuz?
       </h2>
       <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl flex items-center gap-3">
          <span className="text-2xl">{selectedCategory.icon}</span>
          <div>
             <div className="font-bold text-blue-200">{selectedCategory.name}</div>
             <div className="text-xs text-slate-400">Kategorisindeki parçalar listeleniyor</div>
          </div>
       </div>
       
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedCategory.subCategories.map((subCat, index) => (
             <button
                key={subCat}
                onClick={() => onPartSelected(selectedCategory, subCat)}
                style={{ animationDelay: `${index * 30}ms` }}
                className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-green-500 hover:bg-slate-750 hover:shadow-lg transition-all text-left group animate-fadeInUp flex items-center justify-between"
             >
                <span className="text-slate-300 font-medium group-hover:text-white">{subCat}</span>
                <svg className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
          ))}
       </div>
    </div>
  );
};
