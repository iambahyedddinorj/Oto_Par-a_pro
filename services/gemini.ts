
import { GoogleGenAI, Type } from "@google/genai";
import { CarPartData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCarPart = async (
  query: string, 
  selectedBrand?: string, 
  selectedModel?: string,
  selectedYear?: string,
  selectedCategory?: string,
  selectedSubCategory?: string,
  isOemSearch: boolean = false // New flag for OEM lookup
): Promise<CarPartData[]> => {
  const model = "gemini-2.5-flash";
  
  let fullContext = "";
  let taskDescription = "";

  if (isOemSearch) {
    // OEM SEARCH CONTEXT
    fullContext = `ARAMA TÜRÜ: OEM / Parça Numarası Sorgusu. GİRİLEN NO: "${query}"`;
    taskDescription = `
      Kullanıcı bir yedek parça numarası girdi. 
      1. Bu numaranın (OEM) hangi parçaya ve hangi araçlara ait olduğunu tespit et.
      2. Bu parça için 3 seçenek sun:
         - Seçenek 1: Tam olarak bu OEM numarasına sahip Orijinal parça.
         - Seçenek 2: Bu numaranın kaliteli muadili (Bosch, Valeo vb.).
         - Seçenek 3: Ekonomik yan sanayi karşılığı.
    `;
  } else {
    // WIZARD SEARCH CONTEXT
    const vehicleIdentity = [selectedBrand, selectedModel, selectedYear].filter(Boolean).join(" ");
    fullContext = `ARAÇ: ${vehicleIdentity} | KATEGORİ: ${selectedCategory || 'Genel'} | PARÇA: ${selectedSubCategory || query}`;
    taskDescription = `
      Bu araç ve parça için Türkiye piyasasında bulunabilecek 3 FARKLI SEÇENEK içeren bir liste oluştur.
      - Seçenek 1: Orijinal (OEM)
      - Seçenek 2: Kaliteli Muadil
      - Seçenek 3: Fiyat/Performans
    `;
  }
  
  const prompt = `
    GÖREV: Otomotiv Yedek Parça Kataloğu Uzmanı olarak hareket et.
    BAĞLAM: ${fullContext}
    
    DETAY: ${taskDescription}
    
    KURALLAR:
    - Gerçek parça numaraları kullan.
    - Fiyatlar gerçekçi TL aralıkları olsun.
    - "type" alanını tam olarak belirtilen enum değerleriyle doldur.
    - Eğer OEM araması yapıldıysa, "partName" ve "vehicleModel" alanlarını tespit ettiğin parçaya göre doldur.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            partName: { type: Type.STRING },
            vehicleModel: { type: Type.STRING, description: "Uyumlu olduğu başlıca araç modelleri" },
            year: { type: Type.STRING, description: "Uyumlu yıl aralığı" },
            category: { type: Type.STRING },
            subCategory: { type: Type.STRING },
            description: { type: Type.STRING },
            oemNumber: { type: Type.STRING },
            oemCrossReference: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedPriceRange: { type: Type.STRING },
            priceNumeric: { type: Type.NUMBER, description: "Sıralama için ortalama fiyat (Sayısal)" },
            type: { type: Type.STRING, enum: ['Orijinal (OEM)', 'Kaliteli Muadil', 'Fiyat/Performans'] },
            brand: { type: Type.STRING, description: "Parça Markası (Örn: VW AG, Bosch)" },
            compatibility: { type: Type.ARRAY, items: { type: Type.STRING } },
            installationDifficulty: { type: Type.STRING, enum: ["Kolay", "Orta", "Zor", "Uzman"] },
            maintenanceTips: { type: Type.STRING },
            dimensions: { type: Type.STRING },
            weight: { type: Type.STRING },
            material: { type: Type.STRING }
          },
          required: ["partName", "oemNumber", "type", "brand", "priceNumeric"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Veri alınamadı");
  
  try {
    const rawData = JSON.parse(text) as CarPartData[];
    // Add IDs for React keys and sanitize arrays to prevent "undefined.length" errors
    return rawData.map((item, index) => ({ 
      ...item, 
      id: `part-${index}-${Date.now()}`,
      oemCrossReference: Array.isArray(item.oemCrossReference) ? item.oemCrossReference : [],
      compatibility: Array.isArray(item.compatibility) ? item.compatibility : []
    }));
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("Veri işlenirken hata oluştu.");
  }
};

export const generatePartImage = async (partData: CarPartData): Promise<string> => {
  const model = "gemini-2.5-flash-image";
  const imagePrompt = `
    Automotive spare part studio photography: ${partData.brand} ${partData.partName}.
    Context: ${partData.subCategory} for ${partData.vehicleModel}.
    Style: High-end catalog, white background, soft studio lighting, 4k.
    View: Isometric 3/4.
    Material: ${partData.material}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: imagePrompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (error) {
    console.error("Image generation error:", error);
    return ""; 
  }
};
