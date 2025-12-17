import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileInput, BrainCircuit, BarChart3, Settings, Menu, X, ExternalLink, Info, Activity, ShieldCheck, Server, Zap } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { DataInput } from './components/DataInput';
import { Analysis } from './components/Analysis';
import { getHistory, saveSnapshot } from './services/mockBackend';
import { SystemSnapshot, SOEMetrics } from './types';

// Simple Router implementation since we are in a single-file restricted environment
type Page = 'dashboard' | 'input' | 'analysis' | 'landing';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [history, setHistory] = useState<SystemSnapshot[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<SystemSnapshot | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    // Load initial data
    const data = getHistory();
    setHistory(data);
    if (data.length > 0) {
      setCurrentSnapshot(data[data.length - 1]);
    }
  }, []);

  const handleSaveData = (name: string, metrics: SOEMetrics) => {
    const newSnapshot = saveSnapshot(name, metrics);
    setHistory(prev => [...prev, newSnapshot]);
    setCurrentSnapshot(newSnapshot);
    setCurrentPage('dashboard');
  };

  const NavItem = ({ page, icon: Icon, label }: { page: Page; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        currentPage === page
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (currentPage === 'landing') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-6 relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]"></div>
             </div>

            <div className="z-10 text-center max-w-2xl animate-fade-in mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    <span className="text-xs font-medium text-secondary tracking-wider">SYSTEM OPERATIONAL EFFICIENCY v2.0</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    SOE Analyzer
                </h1>
                <p className="text-xl text-secondary mb-10 leading-relaxed">
                    The enterprise standard for visualizing reliability, efficiency, and performance. 
                    Now powered by Gemini AI for human-like system diagnosis.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => setCurrentPage('dashboard')}
                        className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform shadow-xl shadow-white/10 w-full sm:w-auto"
                    >
                        Launch Dashboard
                    </button>
                    <button 
                        onClick={() => setShowInfoModal(true)}
                        className="px-8 py-4 bg-white/5 text-white border border-white/10 font-semibold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Info size={20} />
                        What is SOE?
                    </button>
                </div>
            </div>

            {/* Developer Credit Footer */}
            <div className="absolute bottom-8 z-10 text-center animate-fade-in">
                <p className="text-[10px] uppercase tracking-widest text-secondary/60 mb-2">Developed By</p>
                <a 
                    href="https://almightportfolio.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                >
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        Akana Signing Josias Aaron (Almight)
                    </span>
                    <ExternalLink size={14} className="text-secondary group-hover:text-primary transition-colors" />
                </a>
            </div>

            {/* Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowInfoModal(false)}>
                    <div className="bg-surface border border-white/10 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setShowInfoModal(false)} 
                            className="absolute top-4 right-4 text-secondary hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-full bg-primary/20 text-primary">
                                <BrainCircuit size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Understanding SOE</h2>
                        </div>

                        <p className="text-gray-300 mb-8 leading-relaxed">
                            System Operational Efficiency (SOE) is a composite score (0-100) that quantifies the overall health of your software. 
                            It is calculated using a weighted algorithm across four critical pillars:
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:border-blue-500/30 transition-colors">
                                <Activity className="text-blue-400 shrink-0" size={24} />
                                <div>
                                    <h3 className="text-blue-100 font-semibold mb-1">Availability</h3>
                                    <p className="text-sm text-gray-400">Measures system uptime. High availability ensures your service is accessible to users when they need it.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:border-green-500/30 transition-colors">
                                <ShieldCheck className="text-green-400 shrink-0" size={24} />
                                <div>
                                    <h3 className="text-green-100 font-semibold mb-1">Reliability</h3>
                                    <p className="text-sm text-gray-400">Tracks error frequency. A reliable system processes requests correctly without failing.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:border-purple-500/30 transition-colors">
                                <Server className="text-purple-400 shrink-0" size={24} />
                                <div>
                                    <h3 className="text-purple-100 font-semibold mb-1">Efficiency</h3>
                                    <p className="text-sm text-gray-400">Analyzes resource usage (CPU/RAM). Efficient systems minimize cost and waste.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:border-amber-500/30 transition-colors">
                                <Zap className="text-amber-400 shrink-0" size={24} />
                                <div>
                                    <h3 className="text-amber-100 font-semibold mb-1">Performance</h3>
                                    <p className="text-sm text-gray-400">Evaluates speed (Latency) and volume (Throughput) to ensure responsiveness.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                            <button 
                                onClick={() => setShowInfoModal(false)}
                                className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-gray-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full bg-surface border-r border-white/5 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <BarChart3 size={18} className="text-white" />
                </div>
                SOE Analyzer
            </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <NavItem page="dashboard" icon={LayoutDashboard} label="Overview" />
            <NavItem page="input" icon={FileInput} label="Data Input" />
            <NavItem page="analysis" icon={BrainCircuit} label="AI Diagnosis" />
        </nav>

        <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                System Operational
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-10">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
            </button>
            <div className="flex items-center gap-4 ml-auto">
                 {currentSnapshot && (
                     <div className="text-xs text-right hidden sm:block">
                        <div className="text-white font-medium">{currentSnapshot.name}</div>
                        <div className="text-gray-500">{new Date(currentSnapshot.timestamp).toLocaleString()}</div>
                     </div>
                 )}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500"></div>
            </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {currentPage === 'dashboard' && <Dashboard history={history} current={currentSnapshot} />}
                {currentPage === 'input' && <DataInput onSave={handleSaveData} />}
                {currentPage === 'analysis' && <Analysis data={currentSnapshot?.score || null} />}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;