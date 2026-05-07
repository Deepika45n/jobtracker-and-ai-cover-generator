import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Download, RefreshCw, FileText, ChevronDown, Check, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useJobStore from '../store/jobStore';

const AICoverLetter = () => {
  const { user } = useAuthStore();
  const { jobs, updateJob } = useJobStore();
  const location = useLocation();
  const navigate = useNavigate();

  const passedJob = location.state?.job;

  const [selectedJobId, setSelectedJobId] = useState(passedJob ? passedJob.id : '');
  const [tone, setTone] = useState('Professional');
  const [background, setBackground] = useState('');
  
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || passedJob || null;

  const handleGenerate = async () => {
    if (!selectedJob && (!passedJob || !passedJob.title)) {
      setError('Please select a job or provide job details.');
      return;
    }
    if (!background) {
      setError('Please provide your skills and background.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedLetter('');

    try {
      const response = await fetch('http://localhost:8080/api/ai/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: user.name,
          background: background,
          jobTitle: selectedJob?.title || passedJob?.title,
          company: selectedJob?.company || passedJob?.company,
          location: selectedJob?.location || passedJob?.location,
          jobDescription: selectedJob?.description || passedJob?.description,
          tone: tone
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      const text = data.coverLetter;
      setGeneratedLetter(text);

      // Save back to job if it's in tracker
      if (selectedJob && selectedJob.id) {
        updateJob(user.id, selectedJob.id, { 
          notes: selectedJob.notes ? selectedJob.notes + '\n\nCover Letter:\n' + text : 'Cover Letter:\n' + text 
        });
      }

    } catch (err) {
      console.error(err);
      setError('Failed to generate cover letter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${selectedJob?.company || 'Company'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div>
        <h1 className="text-2xl font-heading font-bold text-textPrimary flex items-center">
          <Sparkles className="text-accent mr-3" size={28} />
          AI Cover Letter Generator
        </h1>
        <p className="text-textSecondary mt-1">Generate personalized, high-converting cover letters in seconds.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-4 overflow-y-auto pr-2">
          <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
            <h3 className="font-medium text-textPrimary mb-4">Letter Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Target Job</label>
                <div className="relative">
                  <select 
                    value={selectedJobId} 
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 appearance-none bg-primary border border-border rounded-lg outline-none focus:border-accent text-sm"
                  >
                    <option value="">-- Select a job from Tracker --</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title} at {j.company}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                </div>
                {passedJob && !selectedJobId && (
                  <p className="text-xs text-info mt-1">Using passed job details from search.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={user?.name || ''} 
                  disabled
                  className="w-full px-3 py-2 bg-surface2/50 border border-border rounded-lg text-textMuted cursor-not-allowed text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Background & Skills *</label>
                <textarea 
                  rows="4" 
                  value={background}
                  onChange={e => setBackground(e.target.value)}
                  placeholder="E.g., 5 years experience in React, led a team of 3, passionate about UX..."
                  className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent resize-none text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Professional', 'Enthusiastic', 'Direct', 'Creative'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-1.5 px-3 rounded-lg text-sm transition-colors border ${tone === t ? 'bg-accent/10 border-accent/30 text-accent font-medium' : 'bg-primary border-border text-textSecondary hover:bg-surface2'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isGenerating ? (
                  <><Loader2 size={18} className="animate-spin mr-2" /> Generating...</>
                ) : (
                  <><Sparkles size={18} className="mr-2" /> Generate Letter</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Output */}
        <div className="w-full lg:w-2/3 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-surface2/30">
            <h3 className="font-medium text-textPrimary flex items-center">
              <FileText size={18} className="mr-2 text-textSecondary" />
              Generated Cover Letter
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !generatedLetter}
                className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surface2 rounded-lg transition-colors disabled:opacity-50"
                title="Regenerate"
              >
                <RefreshCw size={18} />
              </button>
              <button 
                onClick={handleCopy}
                disabled={!generatedLetter}
                className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surface2 rounded-lg transition-colors disabled:opacity-50"
                title="Copy to clipboard"
              >
                {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
              </button>
              <button 
                onClick={handleDownload}
                disabled={!generatedLetter}
                className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surface2 rounded-lg transition-colors disabled:opacity-50"
                title="Download .txt"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-primary/30">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-textMuted space-y-4">
                <Loader2 size={40} className="animate-spin text-accent" />
                <p>Crafting the perfect letter for you...</p>
              </div>
            ) : generatedLetter ? (
              <textarea 
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="w-full h-full min-h-[400px] bg-transparent resize-none outline-none text-textPrimary leading-relaxed whitespace-pre-wrap font-body"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-textMuted max-w-md mx-auto text-center space-y-4">
                <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-2">
                  <Sparkles size={32} className="text-textSecondary" />
                </div>
                <h3 className="text-lg font-medium text-textPrimary">Ready to generate</h3>
                <p className="text-sm">Fill in your background details, select a job, and click generate to create a tailored cover letter powered by Claude AI.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoverLetter;
