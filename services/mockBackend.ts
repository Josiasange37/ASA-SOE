import { SOEMetrics, SOEWeightConfig, SOEScoreResult, SystemSnapshot } from '../types';

const STORAGE_KEY = 'soe_app_data';

// Default Weights
const DEFAULT_WEIGHTS: SOEWeightConfig = {
  uptime: 0.35,
  errorRate: 0.25,
  resourceEfficiency: 0.20,
  throughput: 0.20,
};

// Mock Initial Data
const MOCK_SNAPSHOTS: SystemSnapshot[] = [
  {
    id: '1',
    name: 'Production-US-East',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    metrics: { uptime: 99.99, errorRate: 0.01, cpuUtilization: 45, memoryUtilization: 60, throughput: 1200, responseTime: 120 },
    score: { overallScore: 98, categoryScores: { availability: 100, reliability: 99, efficiency: 95, performance: 98 }, trend: 'stable', metrics: { uptime: 99.99, errorRate: 0.01, cpuUtilization: 45, memoryUtilization: 60, throughput: 1200, responseTime: 120 }, timestamp: '' }
  },
  {
    id: '2',
    name: 'Production-US-East',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    metrics: { uptime: 99.5, errorRate: 0.5, cpuUtilization: 75, memoryUtilization: 80, throughput: 1150, responseTime: 200 },
    score: { overallScore: 88, categoryScores: { availability: 95, reliability: 90, efficiency: 80, performance: 87 }, trend: 'down', metrics: { uptime: 99.5, errorRate: 0.5, cpuUtilization: 75, memoryUtilization: 80, throughput: 1150, responseTime: 200 }, timestamp: '' }
  },
];

export const calculateSOE = (metrics: SOEMetrics, weights: SOEWeightConfig = DEFAULT_WEIGHTS): SOEScoreResult => {
  // 1. Availability Score (Exponential decay as it drops below 99.9%)
  // Simple linear model for demo: 99.99 = 100, 99.0 = 90, 95 = 50
  const availabilityScore = Math.max(0, Math.min(100, (metrics.uptime - 95) * 20)); 

  // 2. Reliability Score (Error rate)
  // 0% errors = 100, 1% errors = 80, 5% errors = 0
  const reliabilityScore = Math.max(0, 100 - (metrics.errorRate * 20));

  // 3. Efficiency Score (Resource utilization)
  // Ideal range is 40-70%. Too low = waste, Too high = risk.
  let efficiencyScore = 0;
  const avgResource = (metrics.cpuUtilization + metrics.memoryUtilization) / 2;
  if (avgResource >= 40 && avgResource <= 75) {
    efficiencyScore = 100;
  } else if (avgResource < 40) {
    efficiencyScore = 80 - ((40 - avgResource) * 1.5); // Penalty for underutilization (cost inefficiency)
  } else {
    efficiencyScore = 100 - ((avgResource - 75) * 3); // Penalty for saturation
  }
  efficiencyScore = Math.max(0, efficiencyScore);

  // 4. Performance Score (Throughput & Latency)
  // This is relative to a baseline. Let's assume baseline 1000 rps and 100ms latency.
  const throughputScore = Math.min(100, (metrics.throughput / 1000) * 100);
  const latencyScore = Math.max(0, 100 - ((metrics.responseTime - 50) * 0.5));
  const performanceScore = (throughputScore * 0.6) + (latencyScore * 0.4);

  // Overall Weighted Score
  const overall = (
    (availabilityScore * weights.uptime) +
    (reliabilityScore * weights.errorRate) +
    (efficiencyScore * weights.resourceEfficiency) +
    (performanceScore * weights.throughput)
  );

  return {
    overallScore: Math.round(overall),
    categoryScores: {
      availability: Math.round(availabilityScore),
      reliability: Math.round(reliabilityScore),
      efficiency: Math.round(efficiencyScore),
      performance: Math.round(performanceScore),
    },
    metrics,
    trend: 'stable', // calculated relative to history usually
    timestamp: new Date().toISOString(),
  };
};

export const getHistory = (): SystemSnapshot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_SNAPSHOTS;
  } catch (e) {
    return MOCK_SNAPSHOTS;
  }
};

export const saveSnapshot = (name: string, metrics: SOEMetrics): SystemSnapshot => {
  const score = calculateSOE(metrics);
  const newSnapshot: SystemSnapshot = {
    id: Date.now().toString(),
    name,
    timestamp: new Date().toISOString(),
    metrics,
    score,
  };
  
  const current = getHistory();
  const updated = [...current, newSnapshot];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newSnapshot;
};
