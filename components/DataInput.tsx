import React, { useState } from 'react';
import { Card } from './ui/Card';
import { SOEMetrics } from '../types';
import { analyzeSystemFromUrl } from '../services/geminiService';
import { Upload, Save, AlertCircle, Globe, Loader2, Search } from 'lucide-react';

interface DataInputProps {
  onSave: (name: string, metrics: SOEMetrics) => void;
}

export const DataInput: React.FC<DataInputProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload' | 'url'>('manual');
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisSummary, setAnalysisSummary] = useState('');

  const [formData, setFormData] = useState<SOEMetrics & { name: string }>({
    name: 'New-System-Snapshot',
    uptime: 99.9,
    errorRate: 0.05,
    cpuUtilization: 45,
    memoryUtilization: 50,
    throughput: 800,
    responseTime: 150,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, ...metrics } = formData;
    onSave(name, metrics);
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisSummary('');

    try {
      const result = await analyzeSystemFromUrl(urlInput);
      if (result) {
        setFormData({
          name: result.name,
          ...result.metrics
        });
        setAnalysisSummary(result.summary);
        setActiveTab('manual'); // Switch to manual tab to review data
      } else {
        setAnalysisError('Could not analyze URL. Please verify the link and try again.');
      }
    } catch (e) {
      setAnalysisError('An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file parsing delay
      setTimeout(() => {
        // Mock parsed data from "file"
        setFormData({
            name: file.name.split('.')[0] || 'Imported-Data',
            uptime: 98.5,
            errorRate: 1.2,
            cpuUtilization: 82,
            memoryUtilization: 70,
            throughput: 2400,
            responseTime: 350,
        });
        alert("File parsed successfully! Review the values below and click Calculate.");
        setActiveTab('manual');
      }, 1000);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-white'}`}
    >
        <Icon size={16} />
        {label}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-surface p-1 rounded-lg border border-white/10 flex overflow-x-auto max-w-full">
            <TabButton id="manual" label="Manual" icon={Save} />
            <TabButton id="upload" label="Upload" icon={Upload} />
            <TabButton id="url" label="URL Analyzer" icon={Globe} />
        </div>
      </div>

      <Card title={
          activeTab === 'manual' ? 'Enter System Metrics' : 
          activeTab === 'upload' ? 'Import Data File' : 
          'AI Website Analyzer'
      }>
        {activeTab === 'url' ? (
           <div className="space-y-6 py-6">
              <div className="text-center space-y-2 mb-6">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-white">Analyze Any Website</h3>
                  <p className="text-secondary text-sm max-w-md mx-auto">
                      Enter a public URL. Gemini AI will research the site's tech stack and scale to estimate realistic SOE metrics for you.
                  </p>
              </div>

              <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://example.com" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    onClick={handleUrlAnalysis}
                    disabled={isAnalyzing || !urlInput}
                    className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
                  </button>
              </div>

              {analysisError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {analysisError}
                  </div>
              )}
           </div>
        ) : activeTab === 'upload' ? (
             <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 transition-colors bg-white/5">
                <Upload className="w-12 h-12 text-secondary mb-4" />
                <p className="text-white font-medium mb-2">Click to upload CSV or Excel</p>
                <p className="text-sm text-secondary mb-6">Supported formats: .csv, .xlsx, .json</p>
                <input type="file" onChange={handleFileUpload} className="text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 cursor-pointer" />
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                {analysisSummary && (
                    <div className="mb-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                        <p className="text-sm text-accent mb-1 font-semibold">AI Estimation Loaded</p>
                        <p className="text-sm text-gray-300 italic">"{analysisSummary}"</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Snapshot Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Uptime (%)</label>
                        <input type="number" step="0.01" name="uptime" value={formData.uptime} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Error Rate (%)</label>
                        <input type="number" step="0.01" name="errorRate" value={formData.errorRate} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">CPU Usage (%)</label>
                        <input type="number" name="cpuUtilization" value={formData.cpuUtilization} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Memory Usage (%)</label>
                        <input type="number" name="memoryUtilization" value={formData.memoryUtilization} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Throughput (RPS)</label>
                        <input type="number" name="throughput" value={formData.throughput} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Latency (ms)</label>
                        <input type="number" name="responseTime" value={formData.responseTime} onChange={handleInputChange} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-200">The SOE engine will normalize these metrics against the configured baselines (99.99% uptime, 0 errors, &lt;70% resource usage).</p>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Save size={20} />
                    Calculate SOE Score
                </button>
            </form>
        )}
      </Card>
    </div>
  );
};
