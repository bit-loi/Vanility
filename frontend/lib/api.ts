import { Batch } from '../components/types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface EstimateRequestData {
  farmer_name: string;
  location_region: string;
  pollination_date: string;
  curing_method: string;
  sweating_duration_days: number;
  sun_drying_duration_days: number;
  conditioning_duration_days: number;
  quantity_kg_wet: number;
}

export interface EstimateResponseData {
  harvest_status: string;
  predicted_grade: string;
  confidence_score: number;
  recommendations: string[];
  quantity_kg_dry_estimate: number;
  estimated_price_usd_per_kg_min: number;
  estimated_price_usd_per_kg_max: number;
  feature_importances?: Record<string, number>;
}

export interface ValueAddRequestData {
  quantity_kg_dry: number;
  predicted_grade: string;
}

export interface ValueAddResponseData {
  raw_bean_income_usd: number;
  extract_income_usd: number;
  value_add_gap_usd: number;
  value_add_gap_percentage: number;
}

export interface PriceReferenceItem {
  grade: string;
  price_usd_per_kg_min: number;
  price_usd_per_kg_max: number;
}

export async function estimateBatch(data: any): Promise<EstimateResponseData> {
  const res = await fetch(`${API_BASE_URL}/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('API error on estimate');
  return res.json();
}

export async function calculateValueAdd(data: ValueAddRequestData): Promise<ValueAddResponseData> {
  const res = await fetch(`${API_BASE_URL}/value-add-calculator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('API error on value addition calculation');
  return res.json();
}

export async function getPriceReferences(): Promise<PriceReferenceItem[]> {
  const res = await fetch(`${API_BASE_URL}/price-reference`);
  if (!res.ok) throw new Error('API error fetching price references');
  return res.json();
}
