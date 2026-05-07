import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle, XCircle, TrendingUp, Plus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useJobStore from '../store/jobStore';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { jobs, loadJobs } = useJobStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      loadJobs(user.id);
    }
  }, [user, loadJobs]);

  const stats = {
    total: jobs.length,
    interviews: jobs.filter(j => j.status === 'Interview').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  const successRate = stats.total > 0 ? ((stats.offers / stats.total) * 100).toFixed(1) : 0;

  // Mock data for chart
  const chartData = [
    { name: 'Week 1', apps: 4 },
    { name: 'Week 2', apps: 7 },
    { name: 'Week 3', apps: 2 },
    { name: 'Week 4', apps: 8 },
  ];

  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return 'bg-info/10 text-info border-info/20';
      case 'Interview': return 'bg-warning/10 text-warning border-warning/20';
      case 'Offer': return 'bg-success/10 text-success border-success/20';
      case 'Rejected': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-surface2 text-textSecondary border-border';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-textPrimary">Dashboard</h1>
          <p className="text-textSecondary mt-1">Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/cover-letter')}
            className="px-4 py-2 bg-surface2 text-textPrimary rounded-lg font-medium hover:bg-surface2/80 transition-colors border border-border flex items-center"
          >
            <Sparkles className="w-4 h-4 mr-2 text-accent" />
            AI Cover Letter
          </button>
          <button 
            onClick={() => navigate('/applications')}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Applications" 
          value={stats.total} 
          subtitle="All time"
          icon={Briefcase} 
          colorClass="bg-info/10 text-info"
          delay={0.1}
        />
        <StatCard 
          title="Interviews" 
          value={stats.interviews} 
          subtitle="Scheduled"
          icon={Calendar} 
          colorClass="bg-warning/10 text-warning"
          delay={0.2}
        />
        <StatCard 
          title="Offers" 
          value={stats.offers} 
          subtitle="Received"
          icon={CheckCircle} 
          colorClass="bg-success/10 text-success"
          delay={0.3}
        />
        <StatCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={XCircle} 
          colorClass="bg-danger/10 text-danger"
          delay={0.4}
        />
        <StatCard 
          title="Success Rate" 
          value={`${successRate}%`} 
          subtitle="Offers / Total"
          icon={TrendingUp} 
          colorClass="bg-accent/10 text-accent"
          delay={0.5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading font-bold text-textPrimary">Application Activity</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-surface2)'}}
                  contentStyle={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)'}}
                />
                <Bar dataKey="apps" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Applications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading font-bold text-textPrimary">Recent Applications</h2>
            <Link to="/applications" className="text-sm font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {recentJobs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-surface2 rounded-full flex items-center justify-center mb-3 text-textMuted">
                  <Briefcase size={20} />
                </div>
                <p className="text-textSecondary text-sm">No applications yet.</p>
              </div>
            ) : (
              recentJobs.map(job => (
                <div key={job.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface2 transition-colors border border-transparent hover:border-border cursor-pointer" onClick={() => navigate('/applications')}>
                  <div className="w-10 h-10 rounded bg-accentLight text-accent flex items-center justify-center font-bold flex-shrink-0">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-textPrimary truncate">{job.title}</p>
                    <p className="text-xs text-textSecondary truncate">{job.company}</p>
                  </div>
                  <div className={`px-2 py-1 text-[10px] font-medium rounded-full border ${getStatusColor(job.status)}`}>
                    {job.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
