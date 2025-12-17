export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface SOEMetrics {
  uptime: number; // percentage 0-100
  errorRate: number; // percentage 0-100
  cpuUtilization: number; // percentage 0-100
  memoryUtilization: number; // percentage 0-100
  throughput: number; // requests per second
  responseTime: number; // milliseconds
}

export interface SOEWeightConfig {
  uptime: number;
  errorRate: number;
  resourceEfficiency: number; // Combined CPU/Mem
  throughput: number;
}

export interface SOEScoreResult {
  overallScore: number; // 0-100
  categoryScores: {
    availability: number;
    reliability: number;
    efficiency: number;
    performance: number;
  };
  metrics: SOEMetrics;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

export interface SystemSnapshot {
  id: string;
  name: string;
  timestamp: string;
  metrics: SOEMetrics;
  score: SOEScoreResult;
}

export interface SOEAdvice {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: SOEAdvice[];
}