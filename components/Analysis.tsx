import React, { useEffect, useState } from 'react';
import { SOEScoreResult, AIAnalysisResult } from '../types';
import { generateInsights } from '../services/geminiService';
import { Card } from './ui/Card';
import { Loader2, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

interface AnalysisProps {
  data: SOEScoreResult | null;
}

export const Analysis: React.FC<AnalysisProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const jsonStr = await generateInsights(data);
        // Clean markdown code blocks if present (fallback safety)
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);
        setAnalysis(result);
      } catch (e) {
        console.error("Failed to parse AI response", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [data]);

  if (!data) return <div className="text-secondary p-4">No data selected for analysis.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">AI System Diagnosis</h2>
        <span className="text-xs font-mono text-secondary bg-white/5 px-2 py-1 rounded">Model: Gemini 2.5 Flash</span>
      </div>

      {loading ? (
        <Card className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-secondary animate-pulse">Analyzing telemetry data & formulating boost strategy...</p>
        </Card>
      ) : analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20">
            <h3 className="text-xl font-medium text-blue-100 mb-2">Executive Summary</h3>
            <p className="text-blue-200/80 leading-relaxed">{analysis.summary}</p>
          </Card>

          <Card title="Strengths" className="border-green-500/10">
            <ul className="space-y-3">
              {analysis.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Detected Weaknesses" className="border-red-500/10">
            <ul className="space-y-3">
              {analysis.weaknesses.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="🚀 SOE Score Boosting Strategy" className="md:col-span-2 border-amber-500/10">
             <div className="grid gap-4">
                {analysis.recommendations.map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-accent/50 transition-colors group">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1 text-lg">{item.title}</h4>
                                <p className="text-secondary text-sm leading-relaxed max-w-2xl">{item.description}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 ${
                            item.impact === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                            item.impact === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                            {item.impact} Impact
                        </span>
                    </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
            <p className="text-secondary">Analysis unavailable. Please check your API key configuration.</p>
        </Card>
      )}
    </div>
  );
};