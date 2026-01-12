import React, { useState, useEffect } from 'react';
import CompetitionForm from './components/CompetitionForm';
import CompetitionManager from './components/CompetitionManager';
import SettingsModal from './components/SettingsModal';
import Login from './components/Login';
import { UserCircle, Settings, LogOut, Moon, Sun, Plus, Edit3 } from 'lucide-react';

const DEFAULT_WEBHOOK_URL = 'https://n8n.themilesconsultancy.com/webhook/6dde85d4-f702-4429-84a4-a0153bfde2c1';
const DEFAULT_MANAGE_WEBHOOK_URL = 'https://n8n.themilesconsultancy.com/webhook/40c515a6-3384-45c4-8ebb-7175c77f351a';
const DEFAULT_AI_WEBHOOK_URL = 'https://n8n.themilesconsultancy.com/webhook/46f228bd-7138-42ef-9851-d66ffb0aca0b';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'create' | 'manage'>('create');
  
  // Webhook States
  const [webhookUrl, setWebhookUrl] = useState('');
  const [manageWebhookUrl, setManageWebhookUrl] = useState('');
  const [aiWebhookUrl, setAiWebhookUrl] = useState('');
  
  // Default to dark mode to match the provided image aesthetic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tweedl_theme') as 'light' | 'dark' || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Check for auth token
    const token = localStorage.getItem('tweedl_auth_token');
    if (token) {
      setIsAuthenticated(true);
    }

    // Load Creation Webhook URL
    const savedUrl = localStorage.getItem('tweedl_webhook_url');
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    } else {
      setWebhookUrl(DEFAULT_WEBHOOK_URL);
      localStorage.setItem('tweedl_webhook_url', DEFAULT_WEBHOOK_URL);
    }

    // Load Management Webhook URL
    // Using v2 key to force update for users who have the old default cached
    const savedManageUrl = localStorage.getItem('tweedl_manage_webhook_url_v2');
    if (savedManageUrl) {
      setManageWebhookUrl(savedManageUrl);
    } else {
      setManageWebhookUrl(DEFAULT_MANAGE_WEBHOOK_URL);
      localStorage.setItem('tweedl_manage_webhook_url_v2', DEFAULT_MANAGE_WEBHOOK_URL);
    }

    // Load AI Webhook URL
    const savedAiUrl = localStorage.getItem('tweedl_ai_webhook_url');
    if (savedAiUrl) {
      setAiWebhookUrl(savedAiUrl);
    } else {
      setAiWebhookUrl(DEFAULT_AI_WEBHOOK_URL);
      localStorage.setItem('tweedl_ai_webhook_url', DEFAULT_AI_WEBHOOK_URL);
    }
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tweedl_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('tweedl_auth_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden transition-colors duration-200">
      
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 z-[-1]">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-100 to-white dark:from-indigo-950 dark:via-slate-950 dark:to-black"></div>
        
        {/* Glow Effects (Dark Mode Only) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-600/20"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-900/20"></div>
        </div>

        {/* Big "TWEEDL" Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <h1 className="text-[25vw] font-black text-slate-900/5 dark:text-white/5 tracking-tighter leading-none whitespace-nowrap blur-sm">
            TWEEDL
          </h1>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        manageWebhookUrl={manageWebhookUrl}
        setManageWebhookUrl={(url) => {
          setManageWebhookUrl(url);
          localStorage.setItem('tweedl_manage_webhook_url_v2', url);
        }}
        aiWebhookUrl={aiWebhookUrl}
        setAiWebhookUrl={setAiWebhookUrl}
      />

      {/* Glassmorphic Navbar */}
      <nav className="border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4">
              {/* Logo Mark */}
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <span className="text-white font-bold text-2xl tracking-tighter">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Tweedl</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase mt-0.5">Admin Portal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${webhookUrl && manageWebhookUrl ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-red-500 shadow-red-500/50'}`}></div>
                {webhookUrl && manageWebhookUrl ? 'System Online' : 'Config Required'}
              </div>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
              
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="relative group">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                  <LogOut className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-2">
              Competition Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg font-light">
              Create, configure, and manage competitions instantly.
            </p>
          </div>

          {/* View Switcher */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/20 dark:border-white/10 flex gap-1 shadow-sm">
            <button
              onClick={() => setViewMode('create')}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                ${viewMode === 'create' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}
              `}
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
            <button
              onClick={() => setViewMode('manage')}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                ${viewMode === 'manage' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}
              `}
            >
              <Edit3 className="w-4 h-4" />
              Manage Existing
            </button>
          </div>
        </div>
        
        {viewMode === 'create' ? (
          <CompetitionForm webhookUrl={webhookUrl} aiWebhookUrl={aiWebhookUrl} />
        ) : (
          <CompetitionManager webhookUrl={manageWebhookUrl} />
        )}
      </main>
      
      <footer className="border-t border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm mt-12 transition-colors">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Tweedl Internal Tools.
          </p>
          <div className="text-xs text-slate-400 dark:text-slate-600 font-mono">
            SECURE_CONNECTION_ESTABLISHED
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;