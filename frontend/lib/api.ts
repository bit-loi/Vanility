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
  warning_message?: string;
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

export async function toggleBuyerMode(token: string, isActive: boolean, criteria?: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/buyer-mode/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ is_active: isActive, criteria })
  });
  if (!res.ok) throw new Error('Failed to toggle buyer mode');
  return res.json();
}

export async function postHeartbeat(token: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/buyer-mode/heartbeat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to pulse heartbeat');
  return res.json();
}

export async function getActiveBuyerCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/buyer-mode/active-count`);
  if (!res.ok) throw new Error('Failed to get active buyer count');
  const data = await res.json();
  return data.active_buyer_count;
}

export async function getLiveMatches(batchId: string, lang: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/matches/${batchId}?lang=${lang}`);
  if (!res.ok) throw new Error('Failed to fetch buyer matches');
  return res.json();
}

export async function saveBatchToDb(token: string, batchData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/batches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(batchData)
  });
  if (!res.ok) throw new Error('Failed to save batch to database');
  return res.json();
}

export async function getBatchesList(token: string, status?: string, sellerId?: string): Promise<any[]> {
  let url = `${API_BASE_URL}/batches`;
  const params: string[] = [];
  if (status) params.push(`status=${status}`);
  if (sellerId) params.push(`seller_id=${sellerId}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch batches list');
  return res.json();
}

export async function createContactRequest(token: string, batchId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/contact-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ batch_id: batchId })
  });
  if (!res.ok) throw new Error('Failed to create contact request');
  return res.json();
}
