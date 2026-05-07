import { useState, useEffect } from 'react';
import { LayoutList, Kanban, Search, Plus, MapPin, Building, Calendar, DollarSign, ExternalLink, MoreVertical, Sparkles, X, Edit2, Trash2 } from 'lucide-react';
import useJobStore from '../store/jobStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const { user } = useAuthStore();
  const { jobs, addJob, updateJob, deleteJob, loadJobs } = useJobStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) loadJobs(user.id);
  }, [user, loadJobs]);

  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const statuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return 'bg-info/10 text-info border-info/20';
      case 'Interview': return 'bg-warning/10 text-warning border-warning/20';
      case 'Offer': return 'bg-success/10 text-success border-success/20';
      case 'Rejected': return 'bg-danger/10 text-danger border-danger/20';
      case 'Withdrawn': return 'bg-surface2 text-textSecondary border-border';
      default: return 'bg-surface2 text-textSecondary border-border';
    }
  };

  const handleOpenModal = (job = null) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteJob(user.id, id);
    }
  };

  // Drag and Drop handlers for Kanban
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('jobId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    const id = Number(e.dataTransfer.getData('jobId'));
    if (id) updateJob(user.id, id, { status });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-textPrimary">My Applications</h1>
          <p className="text-textSecondary mt-1">Manage and track your job search progress.</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-surface border border-border rounded-lg p-1">
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${view === 'list' ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
            >
              <LayoutList size={18} />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${view === 'kanban' ? 'bg-surface2 text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}
            >
              <Kanban size={18} />
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input 
            type="text" 
            placeholder="Search company or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
          />
        </div>
        {view === 'list' && (
          <div className="flex flex-wrap gap-2">
            {['All', ...statuses].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === s 
                    ? 'bg-textPrimary text-surface border-textPrimary' 
                    : 'bg-surface text-textSecondary border-border hover:border-textSecondary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === 'list' ? (
          <div className="h-full overflow-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface2 sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-medium text-textSecondary text-sm border-b border-border">Company</th>
                  <th className="p-4 font-medium text-textSecondary text-sm border-b border-border">Role</th>
                  <th className="p-4 font-medium text-textSecondary text-sm border-b border-border">Status</th>
                  <th className="p-4 font-medium text-textSecondary text-sm border-b border-border">Date Applied</th>
                  <th className="p-4 font-medium text-textSecondary text-sm border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-textSecondary">No applications found.</td>
                  </tr>
                ) : (
                  filteredJobs.map(job => (
                    <tr key={job.id} className="border-b border-border hover:bg-surface2/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-accentLight text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-textPrimary">{job.company}</span>
                        </div>
                      </td>
                      <td className="p-4 text-textSecondary">{job.title}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-textSecondary text-sm">{job.appliedDate}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => navigate('/cover-letter', { state: { job } })} className="p-1.5 text-accent hover:bg-accentLight rounded transition-colors" title="AI Cover Letter">
                            <Sparkles size={16} />
                          </button>
                          <button onClick={() => handleOpenModal(job)} className="p-1.5 text-textSecondary hover:text-textPrimary hover:bg-surface2 rounded transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(job.id)} className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full flex space-x-4 overflow-x-auto pb-4">
            {statuses.map(status => (
              <div 
                key={status} 
                className="w-80 flex-shrink-0 flex flex-col bg-surface2/50 rounded-xl border border-border"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <h3 className="font-medium text-textPrimary">{status}</h3>
                  <span className="text-xs bg-surface text-textSecondary px-2 py-1 rounded-full border border-border">
                    {jobs.filter(j => j.status === status).length}
                  </span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {jobs.filter(j => j.status === status).map(job => (
                    <div 
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      className="bg-surface p-3 rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors"
                      onClick={() => handleOpenModal(job)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-textMuted">{job.company}</span>
                        {job.source && <span className="text-[10px] bg-surface2 px-1.5 py-0.5 rounded text-textSecondary">{job.source}</span>}
                      </div>
                      <h4 className="font-medium text-textPrimary text-sm leading-tight mb-2">{job.title}</h4>
                      <div className="flex justify-between items-center text-xs text-textSecondary mt-3">
                        <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(job.appliedDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <JobModal 
          job={editingJob} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => {
            if (editingJob) updateJob(user.id, editingJob.id, data);
            else addJob(user.id, data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const JobModal = ({ job, onClose, onSave }) => {
  const [formData, setFormData] = useState(job || {
    title: '', company: '', location: '', status: 'Applied', appliedDate: new Date().toISOString().split('T')[0], salary: '', jobUrl: '', description: '', notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface2/50 rounded-t-2xl">
          <h2 className="text-lg font-heading font-bold text-textPrimary">{job ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary p-1 rounded-md hover:bg-surface transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="jobForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Job Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Company Name *</label>
                <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent">
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Applied Date</label>
                <input type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Salary Range</label>
                <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" placeholder="e.g. $100k - $120k" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Job URL</label>
              <input type="url" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Job Description</label>
              <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent resize-none" placeholder="Paste JD here (useful for AI cover letter)"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Notes</label>
              <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent resize-none" placeholder="Interview prep, contacts, etc."></textarea>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-border flex justify-end space-x-3 bg-surface2/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 bg-surface text-textPrimary border border-border rounded-lg font-medium hover:bg-surface2 transition-colors">Cancel</button>
          <button form="jobForm" type="submit" className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors">Save Application</button>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
