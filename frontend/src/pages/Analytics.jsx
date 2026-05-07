import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useJobStore from '../store/jobStore';
import { Target, Clock, TrendingUp, Filter } from 'lucide-react';

const Analytics = () => {
  const { jobs } = useJobStore();

  const statusData = useMemo(() => {
    const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0, Withdrawn: 0 };
    jobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status]++; });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(d => d.value > 0);
  }, [jobs]);

  const COLORS = {
    Applied: '#2563eb',   // blue
    Interview: '#d97706', // amber
    Offer: '#16a34a',     // green
    Rejected: '#dc2626',  // red
    Withdrawn: '#6b6860'  // gray
  };

  const sourceData = useMemo(() => {
    const counts = {};
    jobs.forEach(j => {
      const source = j.source || 'Other';
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [jobs]);

  const stats = {
    total: jobs.length,
    responseRate: jobs.length > 0 ? (((jobs.filter(j => j.status !== 'Applied' && j.status !== 'Withdrawn').length) / jobs.length) * 100).toFixed(1) : 0,
    offerRate: jobs.length > 0 ? (((jobs.filter(j => j.status === 'Offer').length) / jobs.length) * 100).toFixed(1) : 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-textPrimary">Analytics</h1>
        <p className="text-textSecondary mt-1">Insights and metrics from your job search.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-info/10 text-info rounded-lg"><Target size={24} /></div>
          <div>
            <p className="text-sm font-medium text-textSecondary">Total Applications</p>
            <p className="text-2xl font-heading font-bold text-textPrimary">{stats.total}</p>
          </div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-warning/10 text-warning rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-medium text-textSecondary">Response Rate</p>
            <p className="text-2xl font-heading font-bold text-textPrimary">{stats.responseRate}%</p>
          </div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-success/10 text-success rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-medium text-textSecondary">Offer Rate</p>
            <p className="text-2xl font-heading font-bold text-textPrimary">{stats.offerRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-lg font-heading font-bold text-textPrimary mb-6">Status Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)'}}
                  itemStyle={{color: 'var(--text-primary)'}}
                />
                <Legend wrapperStyle={{color: 'var(--text-secondary)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-border p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-lg font-heading font-bold text-textPrimary mb-6">Top Job Sources</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} width={80} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-surface2)'}}
                  contentStyle={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)'}}
                />
                <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} maxBarSize={40}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--accent)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
