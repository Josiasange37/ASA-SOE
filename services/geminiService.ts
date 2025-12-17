import { GoogleGenAI } from "@google/genai";
import { SOEScoreResult, SOEMetrics } from "../types";

// In a real app, this key comes from env. 
// We are following the instruction to assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY || '';

export const generateInsights = async (scoreData: SOEScoreResult): Promise<string> => {
  if (!API_KEY) {
    return "API Key not configured. Unable to generate AI insights. Please configure your environment variables.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      Act as a Senior Site Reliability Engineer (SRE) and Performance Architect.
      Analyze the following System Operational Efficiency (SOE) Data to provide a strategic plan to BOOST the score:
      
      Overall Score: ${scoreData.overallScore}/100
      
      Category Scores:
      - Availability: ${scoreData.categoryScores.availability}/100 (Based on Uptime: ${scoreData.metrics.uptime}%)
      - Reliability: ${scoreData.categoryScores.reliability}/100 (Based on Error Rate: ${scoreData.metrics.errorRate}%)
      - Efficiency: ${scoreData.categoryScores.efficiency}/100 (CPU: ${scoreData.metrics.cpuUtilization}%, Mem: ${scoreData.metrics.memoryUtilization}%)
      - Performance: ${scoreData.categoryScores.performance}/100 (Throughput: ${scoreData.metrics.throughput} rps, Latency: ${scoreData.metrics.responseTime}ms)

      Please provide a response in valid JSON format with the following structure:
      {
        "summary": "A 1-sentence executive summary of the system health.",
        "strengths": ["Point 1", "Point 2"],
        "weaknesses": ["Point 1", "Point 2"],
        "recommendations": [
          {
            "title": "Short, punchy action title (e.g. Optimize Database Indexing)",
            "description": "Specific technical advice on what to do and why it will boost the SOE score.",
            "impact": "High" | "Medium" | "Low"
          }
        ]
      }
      
      Prioritize the recommendations. "High" impact items should be those that address the lowest scoring categories.
      Do not include markdown code blocks, just the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return JSON.stringify({
      summary: "AI analysis unavailable due to a service error.",
      strengths: [],
      weaknesses: [],
      recommendations: [{ title: "Check Connection", description: "Ensure API key is valid", impact: "High" }]
    });
  }
};

export interface UrlAnalysisResponse {
  name: string;
  metrics: SOEMetrics;
  summary: string;
}

export const analyzeSystemFromUrl = async (url: string): Promise<UrlAnalysisResponse | null> => {
  if (!API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      I need to estimate the System Operational Efficiency (SOE) for the website: ${url}.
      
      1. Use Google Search to find out what this website is, its probable tech stack, and its scale/popularity.
      2. Based on industry benchmarks for this TYPE of application (e.g., e-commerce, blog, SaaS, dev tool), generate a HYPOTHETICAL but REALISTIC set of operational metrics.
      3. Return the data as a valid JSON object.
      
      The JSON structure must be:
      {
        "name": "A short descriptive name (e.g. GitHub-Production-Est)",
        "summary": "A one sentence explanation of why you chose these metrics based on the site type.",
        "metrics": {
          "uptime": number (percentage, e.g. 99.95),
          "errorRate": number (percentage, e.g. 0.05),
          "cpuUtilization": number (percentage 0-100),
          "memoryUtilization": number (percentage 0-100),
          "throughput": number (requests per second estimate),
          "responseTime": number (milliseconds estimate)
        }
      }

      Strictly return valid JSON. Do not include markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean potential markdown wrappers
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as UrlAnalysisResponse;

  } catch (error) {
    console.error("Gemini URL Analysis Error:", error);
    return null;
  }
};