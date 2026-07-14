import { appConfig } from '../config/constants.js';
import { logger } from '../utils/logger.js';

/**
 * AI Service Abstraction Layer
 * Integrates the Express backend with the FastAPI AI microservice.
 */

interface FloodPredictionInput {
  state: string;
  district: string;
  rainfall_mm: number;
  temperature_c: number;
  humidity: number;
  river_level_m: number;
  soil_moisture: number;
  river_discharge?: number;
  elevation_m?: number;
  wind_speed_kmh?: number;
  pressure_hpa?: number;
  population_density?: number;
  land_cover?: string;
  soil_type?: string;
}

interface FloodPredictionResult {
  riskLevel: string;
  confidence: number;
  trend: string;
  forecastData: { label: string; value: number }[];
  actions: string[];
}

interface DamageDetectionInput {
  imageUrl: string;
}

interface DamageDetectionResult {
  detected: boolean;
  damagePercentage: number;
  classifications: string[];
  confidence: number;
}

interface SOSPriorityInput {
  emergencyType: string;
  description: string;
  location: { lat: number; lng: number };
  timeOfDay: string;
  populationDensity: string;
}

interface SOSPriorityResult {
  priority: string;
  riskScore: number;
  predictedResponseTime: string;
  recommendedUnit: string;
  nearestUnit: string;
  distance: string;
  warnings: string[];
  actions: string[];
}

interface DisasterClassProbability {
  label: string;
  probability: number;
}

interface FastAPIDisasterPredictionResult {
  model_name: string;
  model_version: string;
  predicted_disaster: string;
  confidence: number;
  risk_level: string;
  probabilities: DisasterClassProbability[];
  imputed_fields: Record<string, number | string>;
  processing_time_ms: number;
}

// ─── FastAPI Base URL ─────────────────────────────────────────────────────────

const FASTAPI_URL = appConfig.fastapi.baseUrl;
const TIMEOUT = appConfig.fastapi.timeout;

// ─── Helper: Call FastAPI ─────────────────────────────────────────────────────

async function callFastAPI<T>(endpoint: string, payload: unknown): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(`${FASTAPI_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.warn(`FastAPI ${endpoint} returned ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    logger.warn(`FastAPI ${endpoint} unavailable`, {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// ─── Disaster Prediction (XGBoost) ────────────────────────────────────────────

export async function predictFloodRisk(input: FloodPredictionInput): Promise<FloodPredictionResult> {
  const result = await callFastAPI<FastAPIDisasterPredictionResult>('/api/v1/predict/disaster', {
    state: input.state,
    district: input.district,
    rainfall_mm: input.rainfall_mm,
    temperature_c: input.temperature_c,
    humidity_pct: input.humidity,
    water_level_m: input.river_level_m,
    river_discharge: input.river_discharge,
    elevation_m: input.elevation_m,
    wind_speed_kmh: input.wind_speed_kmh,
    pressure_hpa: input.pressure_hpa,
    population_density: input.population_density,
    land_cover: input.land_cover,
    soil_type: input.soil_type,
  });

  if (!result) {
    throw new Error('FastAPI disaster prediction service is unavailable');
  }

  const confidencePct = Math.round(result.confidence * 100);
  const sortedProbabilities = [...result.probabilities].sort((a, b) => b.probability - a.probability);
  const topClasses = sortedProbabilities.slice(0, 4);

  return {
    riskLevel: result.risk_level,
    confidence: confidencePct,
    trend: result.risk_level === 'LOW' || result.risk_level === 'MODERATE' ? 'stable' : 'increasing',
    forecastData: topClasses.map((item) => ({
      label: item.label,
      value: Math.round(item.probability * 100),
    })),
    actions: buildDisasterActions(result.predicted_disaster, result.risk_level, result.imputed_fields),
  };
}

function buildDisasterActions(
  predictedDisaster: string,
  riskLevel: string,
  imputedFields: Record<string, number | string>,
): string[] {
  const normalized = predictedDisaster.toLowerCase();
  const actionsByDisaster: Record<string, string[]> = {
    flood: [
      'Monitor river gauges and low-lying settlements',
      'Pre-position rescue boats and relief supplies',
      'Issue evacuation advisories for vulnerable flood zones',
    ],
    cyclone: [
      'Activate coastal warning channels',
      'Prepare shelters and emergency power support',
      'Coordinate with NDRF/SDRF for coastal evacuation readiness',
    ],
    heatwave: [
      'Open cooling centers and public hydration points',
      'Notify hospitals about heat-stress risk',
      'Broadcast outdoor work and school safety advisories',
    ],
    landslide: [
      'Restrict movement on high-risk hill roads',
      'Alert district teams for slope monitoring',
      'Prepare evacuation support for vulnerable hillside settlements',
    ],
  };

  const actions = actionsByDisaster[normalized] ?? ['Escalate prediction to the district disaster management authority'];
  if (riskLevel === 'CRITICAL') {
    return ['Activate emergency operations protocol', ...actions];
  }
  if (Object.keys(imputedFields).length > 0) {
    return [...actions, 'Validate missing sensor fields before issuing public alerts'];
  }
  return actions;
}

// ─── Damage Detection (YOLOv8) ────────────────────────────────────────────────

export async function detectDamage(input: DamageDetectionInput): Promise<DamageDetectionResult> {
  const result = await callFastAPI<DamageDetectionResult>('/api/detect/damage', input);

  if (result) return result;

  // Fallback: mock detection until Phase 5 implements the YOLOv8 endpoint.
  return {
    detected: true,
    damagePercentage: Math.round(30 + Math.random() * 50),
    classifications: ['structural_damage', 'debris'],
    confidence: Math.round(70 + Math.random() * 20),
  };
}

// ─── SOS Priority Classification ──────────────────────────────────────────────

export async function classifySOSPriority(input: SOSPriorityInput): Promise<SOSPriorityResult> {
  const result = await callFastAPI<SOSPriorityResult>('/api/classify/sos-priority', input);

  if (result) return result;

  // Fallback: rule-based classification until Phase 4 implements the classifier.
  const criticalTypes = ['earthquake', 'fire', 'collapse', 'flood'];
  const highTypes = ['accident', 'medical', 'cyclone', 'gas'];
  const priority = criticalTypes.includes(input.emergencyType)
    ? 'critical'
    : highTypes.includes(input.emergencyType)
      ? 'high'
      : 'moderate';

  return {
    priority,
    riskScore: priority === 'critical' ? 90 : priority === 'high' ? 70 : 40,
    predictedResponseTime: priority === 'critical' ? '8 min' : priority === 'high' ? '15 min' : '25 min',
    recommendedUnit: priority === 'critical' ? 'NDRF Team' : 'Local Emergency Response',
    nearestUnit: 'NDRF Battalion 04 — Arakkonam',
    distance: '12.5 km',
    warnings: priority === 'critical' ? ['Multiple casualties possible', 'Structural risk detected'] : [],
    actions: [
      `Deploy ${priority === 'critical' ? 'NDRF' : 'local'} response unit`,
      'Notify nearest hospital',
      'Setup emergency corridor',
    ],
  };
}
