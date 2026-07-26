import { useState, useEffect } from 'react';
import { History, FileText, Calendar, Copy, Check, Trash2, CopyPlus } from 'lucide-react';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.DEV ? 'http://localhost:8080/api' : (import.meta.env.VITE_API_URL || '/api');

const CoverLetterHistory = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/ai/cover-letter/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch cover letter history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id) => {
    try {
      const res = await fetch(`${API_URL}/ai/cover-letter/${id}`);
      if (res.ok) {
        const letter = await res.json();
        navigator.clipboard.writeText(letter.generatedText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      console.error('Failed to copy full letter', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;
    try {
      const res = await fetch(`${API_URL}/ai/cover-letter/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete letter', error);
    }
  };
  
  const handleDuplicate = async (id) => {
      try {
          const res = await fetch(`${API_URL}/ai/cover-letter/${id}/duplicate`, { method: 'POST' });
          if(res.ok) {
              fetchHistory(); // Refresh to get the new duplicate
          }
      } catch (error) {
          console.error("Failed to duplicate letter", error);
      }
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full text-textSecondary">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-textPrimary flex items-center">
          <History className="text-accent mr-3" size={28} />
          Letter History
        </h1>
        <p className="text-textSecondary mt-1">Review and reuse your previously generated cover letters.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <FileText className="mx-auto text-textMuted mb-4" size={48} />
          <h3 className="text-lg font-medium text-textPrimary">No history yet</h3>
          <p className="text-textSecondary mt-2">Generate a cover letter to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((letter) => (
            <div key={letter.id} className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-textPrimary truncate" title={letter.company}>{letter.company}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${letter.qualityMode === 'PROFESSIONAL' ? 'bg-accent/10 text-accent' : 'bg-surface2 text-textSecondary'}`}>
                  {letter.qualityMode}
                </span>
              </div>
              <p className="text-sm font-medium text-textSecondary mb-2">{letter.role}</p>
              
              <div className="flex items-center text-xs text-textMuted mb-4">
                <Calendar size={12} className="mr-1" />
                {formatDate(letter.createdAt)}
                <span className="mx-2">•</span>
                <span>{letter.providerUsed || 'Unknown Provider'}</span>
              </div>
              
              <div className="bg-primary/50 p-3 rounded-lg text-sm text-textSecondary italic line-clamp-3 mb-4 flex-1">
                "{letter.generatedTextPreview}"
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-border">
                <div className="flex space-x-2">
                    <button 
                    onClick={() => handleCopy(letter.id)}
                    className="p-1.5 text-textSecondary hover:text-textPrimary hover:bg-surface2 rounded transition-colors"
                    title="Copy Full Letter"
                    >
                    {copiedId === letter.id ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                    <button 
                    onClick={() => handleDuplicate(letter.id)}
                    className="p-1.5 text-textSecondary hover:text-textPrimary hover:bg-surface2 rounded transition-colors"
                    title="Duplicate Letter"
                    >
                    <CopyPlus size={16} />
                    </button>
                </div>
                <button 
                  onClick={() => handleDelete(letter.id)}
                  className="p-1.5 text-textSecondary hover:text-danger hover:bg-danger/10 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoverLetterHistory;
