/**
 * Core type definitions for Conferente weighing management app
 */

export type TareMode = 'manual' | 'none';
export type AppView = 'weighing' | 'history' | 'ticket';

export interface WeightData {
  current: number;
  tare: number;
  net: number;
  isStable: boolean;
}

export interface IdentificationData {
  supplier: string;
  product: string;
  targetWeight: string;
}

export interface WeighingRecord {
  id: string;
  supplier: string;
  product: string;
  targetWeight: number;
  grossWeight: number;
  tare: number;
  boxQuantity?: number;
  netWeight: number;
  timestamp: number;
  hasPhoto: boolean;
  photoData?: string;
}

export interface TareWarning {
  supplier: string;
  tare: number;
  usageCount: number;
  message: string;
}

export interface ProductMemory {
  display_name: string;
  tare: number;
  usage_count: number;
  last_used_at: number;
}

export interface SupplierMemory {
  display_name: string;
  last_product_slug: string;
  products: Record<string, ProductMemory>;
}

export interface Database {
  suppliers: Record<string, SupplierMemory>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  read: boolean;
  actionRoute?: AppView;
}