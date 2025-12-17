import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { Activity, Server, ShieldCheck, Zap } from 'lucide-react';
import { Card } from './ui/Card';
import { SystemSnapshot } from '../types';

interface DashboardProps {
  history: SystemSnapshot[];
  current: SystemSnapshot | null;
}

const KPICard = ({ title, value, unit, icon: Icon, color, subtext }: any) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
        <Icon size={64} />
    </div>
    <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-white/5 ${color} text-white`}>
                <Icon size={18} />
            </div>
            <span className="text-secondary text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
            <span className="text-sm text-secondary font-medium">{unit}</span>
        </div>
        <p className="text-xs text-secondary mt-2 opacity-80">{subtext}</p>
    </div>
  </Card>
);

export const Dashboard: React.FC<DashboardProps> = ({ history, current }) => {
  const chartData = useMemo(() => {
    return history.map(h => ({
      name: new Date(h.timestamp).toLocaleDateString(),
      score: h.score.overallScore,
      uptime: h.metrics.uptime,
      throughput: h.metrics.throughput,
    })).slice(-10); // Last 10 points
  }, [history]);

  if (!current) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center animate-fade-in">
              <div className="bg-surface p-6 rounded-full mb-6">
                 <Activity className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
              <p className="text-secondary max-w-md">Start by importing a dataset or manually entering metrics to generate your first SOE report.</p>
          </div>
      )
  }

  const { metrics, score } = current;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h1>
            <p className="text-secondary text-sm">Real-time operational efficiency monitoring</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Overall SOE Score</span>
            <div className={`text-4xl font-bold ${score.overallScore > 90 ? 'text-success' : score.overallScore > 75 ? 'text-accent' : 'text-danger'}`}>
                {score.overallScore}
            </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
            title="Availability" 
            value={metrics.uptime} 
            unit="%" 
            icon={Activity} 
            color="bg-blue-500" 
            subtext="Target: 99.99%"
        />
        <KPICard 
            title="Reliability" 
            value={(100 - metrics.errorRate).toFixed(2)} 
            unit="%" 
            icon={ShieldCheck} 
            color="bg-green-500" 
            subtext={`Error Rate: ${metrics.errorRate}%`}
        />
        <KPICard 
            title="Resource Eff." 
            value={Math.round((metrics.cpuUtilization + metrics.memoryUtilization) / 2)} 
            unit="%" 
            icon={Server} 
            color="bg-purple-500" 
            subtext={`CPU: ${metrics.cpuUtilization}% | MEM: ${metrics.memoryUtilization}%`}
        />
        <KPICard 
            title="Performance" 
            value={metrics.throughput} 
            unit="rps" 
            icon={Zap} 
            color="bg-amber-500" 
            subtext={`Latency: ${metrics.responseTime}ms`}
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Efficiency Trend" subtitle="Historical SOE score over time">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                        <YAxis stroke="#666" tick={{fontSize: 12}} domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card title="Category Breakdown" subtitle="Current snapshot analysis">
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'Avail', val: score.categoryScores.availability },
                        { name: 'Reli', val: score.categoryScores.reliability },
                        { name: 'Eff', val: score.categoryScores.efficiency },
                        { name: 'Perf', val: score.categoryScores.performance },
                    ]} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="#666" hide />
                        <YAxis dataKey="name" type="category" stroke="#999" width={40} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                        <Bar dataKey="val" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </div>
    </div>
  );
};
