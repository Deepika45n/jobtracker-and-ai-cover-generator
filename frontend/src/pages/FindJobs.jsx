import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase as BriefcaseIcon, Filter, ExternalLink, BookmarkPlus, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import useApiStore from '../store/apiStore';
import useJobStore from '../store/jobStore';
import { useNavigate } from 'react-router-dom';

const FindJobs = () => {
  const { user } = useAuthStore();
  const { keys, loadKeys } = useApiStore();
  const { addJob } = useJobStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [sourceTab, setSourceTab] = useState('All');
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) loadKeys(user.id);
  }, [user, loadKeys]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query && !isRemote && sourceTab !== 'RemoteOK') return;

    setIsLoading(true);
    setError('');
    setJobs([]);

    try {
      let results = [];
      
      // Fetch from RemoteOK if tab is All or RemoteOK
      if (sourceTab === 'All' || sourceTab === 'RemoteOK') {
        const tag = query ? query.split(' ')[0] : 'dev';
        try {
          const res = await axios.get(`https://remoteok.com/api?tag=${tag}`);
          // RemoteOK returns legal info in the first element, so we slice it
          const remoteJobs = res.data.slice(1).map(j => ({
            id: j.id || Math.random().toString(),
            title: j.position,
            company: j.company,
            logo: j.company_logo,
            location: j.location || 'Remote',
            isRemote: true,
            type: 'Full-time',
            salary: j.salary ? `$${j.salary}` : 'Not specified',
            postedAt: j.date,
            description: j.description?.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
            url: j.url,
            source: 'RemoteOK',
            sourceColor: 'text-blue-500 bg-blue-50 border-blue-200'
          }));
          results = [...results, ...remoteJobs];
        } catch (err) {
          console.error("RemoteOK fetch failed", err);
        }
      }

      // Fetch from JSearch if API key exists and tab is All or JSearch sources
      if (keys.rapidApiKey && sourceTab !== 'RemoteOK') {
        const jSearchOptions = {
          method: 'GET',
          url: 'https://jsearch.p.rapidapi.com/search',
          params: {
            query: `${query} ${location}`,
            num_pages: '1',
            job_requirements: isRemote ? 'work_from_home' : ''
          },
          headers: {
            'X-RapidAPI-Key': keys.rapidApiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        };

        try {
          const res = await axios.request(jSearchOptions);
          const jJobs = res.data.data.map(j => ({
            id: j.job_id,
            title: j.job_title,
            company: j.employer_name,
            logo: j.employer_logo,
            location: `${j.job_city || ''}, ${j.job_country || ''}`.replace(/^, | , $/g, '') || 'Remote',
            isRemote: j.job_is_remote,
            type: j.job_employment_type,
            salary: (j.job_min_salary && j.job_max_salary) 
              ? `${j.job_salary_currency} ${j.job_min_salary} - ${j.job_max_salary}` 
              : 'Not specified',
            postedAt: j.job_posted_at_datetime_utc,
            description: j.job_description?.substring(0, 200) + '...',
            url: j.job_apply_link,
            source: j.job_publisher,
            sourceColor: 'text-accent bg-accentLight border-accent/20'
          }));
          
          if (sourceTab === 'All') {
            results = [...results, ...jJobs];
          } else {
            results = [...results, ...jJobs.filter(j => j.source.toLowerCase().includes(sourceTab.toLowerCase()))];
          }
        } catch (err) {
          console.error("JSearch fetch failed", err);
          if (sourceTab !== 'All') {
            setError('Failed to fetch from JSearch. Check your API key limit.');
          }
        }
      } else if (!keys.rapidApiKey && sourceTab !== 'RemoteOK') {
        if (sourceTab === 'All') {
          // It's okay, just RemoteOK results
        } else {
          setError('Please add your RapidAPI key in Settings to search LinkedIn, Indeed, etc.');
        }
      }

      setJobs(results);
    } catch (err) {
      setError('An error occurred while fetching jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToTracker = (job) => {
    addJob(user.id, {
      title: job.title,
      company: job.company,
      location: job.location,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      salary: job.salary !== 'Not specified' ? job.salary : '',
      jobUrl: job.url,
      description: job.description,
      source: job.source,
      logo: job.logo,
      notes: ''
    });
    // Normally you'd show a toast here
    alert('Job saved to tracker!');
  };

  const goToCoverLetter = (job) => {
    navigate('/cover-letter', { state: { job } });
  };

  const tabs = ['All', 'LinkedIn', 'Indeed', 'Glassdoor', 'RemoteOK'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-textPrimary mb-2">Find Your Next Role</h1>
        <p className="text-textSecondary max-w-2xl">Search thousands of jobs across multiple platforms and save them directly to your tracker with one click.</p>
      </div>

      <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
            <input 
              type="text" 
              placeholder="Job title, skills, or company..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-primary border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
            <input 
              type="text" 
              placeholder="Location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-primary border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
            />
          </div>
          <div className="flex items-center px-4 py-3 bg-primary border border-border rounded-lg">
            <input 
              id="remote" 
              type="checkbox" 
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="w-4 h-4 text-accent rounded border-border focus:ring-accent" 
            />
            <label htmlFor="remote" className="ml-2 text-sm font-medium text-textPrimary cursor-pointer">Remote Only</label>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setSourceTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                sourceTab === tab 
                  ? 'bg-textPrimary text-surface border-textPrimary' 
                  : 'bg-primary text-textSecondary border-border hover:border-textSecondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {!keys.rapidApiKey && sourceTab !== 'RemoteOK' && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-warning mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-warning">Limited Search Capabilities</p>
            <p className="text-xs text-warning/80 mt-1">
              You are currently only searching RemoteOK. To search LinkedIn, Indeed, and Glassdoor, please add a RapidAPI JSearch key in Settings.
            </p>
            <button onClick={() => navigate('/settings')} className="text-xs font-medium text-warning underline mt-2">
              Go to Settings
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-4"
            >
              <div className="w-16 h-16 rounded-lg bg-surface2 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-xl font-bold text-textMuted">{job.company.charAt(0)}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-textPrimary group-hover:text-accent transition-colors truncate">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-textSecondary">
                      <span className="font-medium text-textPrimary">{job.company}</span>
                      <span className="flex items-center"><MapPin size={14} className="mr-1" /> {job.location}</span>
                      <span className="flex items-center"><BriefcaseIcon size={14} className="mr-1" /> {job.type || 'Full-time'}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${job.sourceColor}`}>
                    {job.source}
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-textSecondary line-clamp-2">{job.description}</p>
                
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => saveToTracker(job)}
                    className="flex items-center px-3 py-1.5 bg-surface2 hover:bg-border text-textPrimary text-sm font-medium rounded-lg transition-colors"
                  >
                    <BookmarkPlus size={16} className="mr-2" /> Save to Tracker
                  </button>
                  <button 
                    onClick={() => goToCoverLetter(job)}
                    className="flex items-center px-3 py-1.5 bg-accentLight hover:bg-accent/20 text-accent text-sm font-medium rounded-lg transition-colors"
                  >
                    <Sparkles size={16} className="mr-2" /> AI Cover Letter
                  </button>
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1.5 bg-textPrimary hover:bg-textPrimary/90 text-surface text-sm font-medium rounded-lg transition-colors ml-auto"
                  >
                    Apply <ExternalLink size={14} className="ml-2" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        ) : !isLoading && !error && query ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface2 mb-4">
              <Search size={32} className="text-textMuted" />
            </div>
            <h3 className="text-lg font-medium text-textPrimary">No jobs found</h3>
            <p className="text-textSecondary mt-1">Try adjusting your search terms or location.</p>
          </div>
        ) : !isLoading && !query && (
          <div className="text-center py-16 bg-surface border border-border rounded-xl border-dashed">
            <h3 className="text-lg font-heading font-medium text-textPrimary">Start searching for jobs</h3>
            <p className="text-textSecondary mt-2 max-w-md mx-auto">Enter a job title or skill to see live results from RemoteOK and other platforms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindJobs;
