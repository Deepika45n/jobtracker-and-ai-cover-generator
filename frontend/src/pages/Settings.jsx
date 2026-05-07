import { useState, useEffect } from 'react';
import { Key, User, Palette, Download, Upload, Trash2, Save, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useApiStore from '../store/apiStore';
import useJobStore from '../store/jobStore';

const Settings = () => {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();
  const { keys, loadKeys, saveKeys } = useApiStore();
  const { jobs } = useJobStore();

  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [apiData, setApiData] = useState({ rapidApiKey: '', anthropicKey: '' });
  const [showRapidKey, setShowRapidKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  useEffect(() => {
    if (user?.id) {
      loadKeys(user.id);
      setApiData(useApiStore.getState().keys);
    }
  }, [user, loadKeys]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileData);
    showToast('Profile updated successfully');
  };

  const handleApiSave = (e) => {
    e.preventDefault();
    saveKeys(user.id, apiData);
    showToast('API keys saved successfully');
  };

  const colors = [
    { name: 'Purple', value: '#6c47ff' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Teal', value: '#0d9488' },
  ];

  const handleColorChange = (color) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent', color);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-textPrimary">Settings</h1>
        <p className="text-textSecondary mt-1">Manage your account, preferences, and API keys.</p>
      </div>

      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center z-50 ${toast.type === 'success' ? 'bg-success/90 text-white' : 'bg-danger/90 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} className="mr-2" /> : <AlertCircle size={18} className="mr-2" />}
          {toast.msg}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface2/30 flex items-center">
          <User className="text-textSecondary mr-2" size={20} />
          <h2 className="font-medium text-textPrimary">Profile Information</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-primary border border-border rounded-lg outline-none focus:border-accent" 
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button type="submit" className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                <Save size={16} className="mr-2" /> Save Profile
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* API Keys Section */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface2/30 flex items-center">
          <Key className="text-textSecondary mr-2" size={20} />
          <h2 className="font-medium text-textPrimary">API Configuration</h2>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleApiSave} className="space-y-6">
            
            <div className="bg-primary/50 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-textPrimary">RapidAPI Key (JSearch)</label>
                <span className={`text-xs px-2 py-0.5 rounded-full ${apiData.rapidApiKey ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {apiData.rapidApiKey ? 'Active' : 'Not set'}
                </span>
              </div>
              <p className="text-xs text-textSecondary mb-3">Required for searching LinkedIn, Indeed, and Glassdoor jobs.</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input 
                    type={showRapidKey ? "text" : "password"} 
                    value={apiData.rapidApiKey}
                    onChange={e => setApiData({...apiData, rapidApiKey: e.target.value})}
                    placeholder="Enter RapidAPI Key"
                    className="w-full pl-3 pr-10 py-2.5 bg-surface border border-border rounded-lg outline-none focus:border-accent font-mono text-sm" 
                  />
                  <button type="button" onClick={() => setShowRapidKey(!showRapidKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary">
                    {showRapidKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-textMuted mt-2 mt-2">Get a free key: <a href="https://rapidapi.com/letscrape-6bRBa3QG1q/api/jsearch" target="_blank" rel="noreferrer" className="text-accent hover:underline">rapidapi.com → JSearch</a></p>
            </div>

            <div className="bg-primary/50 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-textPrimary">Anthropic API Key</label>
                <span className={`text-xs px-2 py-0.5 rounded-full ${apiData.anthropicKey ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {apiData.anthropicKey ? 'Active' : 'Not set'}
                </span>
              </div>
              <p className="text-xs text-textSecondary mb-3">Required for generating AI cover letters.</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input 
                    type={showAnthropicKey ? "text" : "password"} 
                    value={apiData.anthropicKey}
                    onChange={e => setApiData({...apiData, anthropicKey: e.target.value})}
                    placeholder="sk-ant-..."
                    className="w-full pl-3 pr-10 py-2.5 bg-surface border border-border rounded-lg outline-none focus:border-accent font-mono text-sm" 
                  />
                  <button type="button" onClick={() => setShowAnthropicKey(!showAnthropicKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary">
                    {showAnthropicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-textMuted mt-2">Get a key: <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-accent hover:underline">console.anthropic.com</a></p>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                <Save size={16} className="mr-2" /> Save API Keys
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface2/30 flex items-center">
          <Palette className="text-textSecondary mr-2" size={20} />
          <h2 className="font-medium text-textPrimary">Appearance</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-3">Theme</label>
            <div className="flex space-x-3">
              {['light', 'dark', 'system'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${theme === t ? 'border-accent text-accent bg-accent/5' : 'border-border text-textSecondary hover:bg-surface2'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-3">Accent Color</label>
            <div className="flex space-x-3">
              {colors.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleColorChange(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${accentColor === c.value ? 'border-textPrimary scale-110' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface2/30 flex items-center">
          <Download className="text-textSecondary mr-2" size={20} />
          <h2 className="font-medium text-textPrimary">Data Management</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-textSecondary mb-4">Export your job tracker data or clear your local storage.</p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href",     dataStr);
                downloadAnchorNode.setAttribute("download", "jobtrack_export.json");
                document.body.appendChild(downloadAnchorNode); // required for firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                showToast('Data exported successfully');
              }}
              className="flex items-center px-4 py-2 bg-surface2 text-textPrimary border border-border rounded-lg hover:bg-border transition-colors text-sm font-medium"
            >
              <Download size={16} className="mr-2" /> Export JSON
            </button>
            <button 
              onClick={() => {
                if (confirm('This will delete ALL your job applications. This cannot be undone. Are you sure?')) {
                  localStorage.removeItem(`jt_jobs_${user.id}`);
                  window.location.reload();
                }
              }}
              className="flex items-center px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} className="mr-2" /> Clear All Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
