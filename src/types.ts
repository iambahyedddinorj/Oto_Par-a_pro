
export interface CarPartData {
  id: string; // Unique ID for list rendering
  partName: string;
  vehicleModel: string;
  year: string;
  category: string;
  subCategory: string; // New: Specific part name (e.g. "Fren Balatası")
  description: string;
  oemNumber: string;
  oemCrossReference: string[];
  estimatedPriceRange: string;
  priceNumeric: number; // For sorting
  type: 'Orijinal (OEM)' | 'Kaliteli Muadil' | 'Fiyat/Performans'; // New: For filtering
  brand: string; // Manufacturer brand (e.g. Bosch, VW AG)
  compatibility: string[];
  installationDifficulty: 'Kolay' | 'Orta' | 'Zor' | 'Uzman';
  maintenanceTips: string;
  dimensions: string;
  weight: string;
  material: string;
}

export interface Brand {
  id: string;
  name: string;
  logoColor: string;
  models: string[];
}

export interface PartCategory {
  id: string;
  name: string;
  icon: string;
  keywords: string;
  subCategories: string[]; // Added this field
}

export interface SearchResult {
  data: CarPartData[]; // Changed to Array
  loading: boolean;
  error: string | null;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string; // Firebase UID
  name: string;
  username: string;
  email: string;
  // password removed, handled by Firebase Auth
  role: UserRole;
  isApproved: boolean;
  allowedBrands?: string[];
}