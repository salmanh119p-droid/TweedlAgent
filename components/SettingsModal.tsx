import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Sparkles, Database } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  manageWebhookUrl: string;
  setManageWebhookUrl: (url: string) => void;
  aiWebhookUrl: string;
  setAiWebhookUrl: (url: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  webhookUrl, 
  setWebhookUrl,
  manageWebhookUrl,
  setManageWebhookUrl,
  aiWebhookUrl,
  setAiWebhookUrl
}) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);
  const [localManageUrl, setLocalManageUrl] = useState(manageWebhookUrl);
  const [localAiUrl, setLocalAiUrl] = useState(aiWebhookUrl);

  // Sync internal state when prop changes or modal opens
  useEffect(() => {
    setLocalUrl(webhookUrl);
    setLocalManageUrl(manageWebhookUrl);
    setLocalAiUrl(aiWebhookUrl);
  }, [webhookUrl, manageWebhookUrl, aiWebhookUrl, isOpen]);

  const handleSave = () => {
    setWebhookUrl(localUrl);
    setManageWebhookUrl(localManageUrl);
    setAiWebhookUrl(localAiUrl);
    
    localStorage.setItem('tweedl_webhook_url', localUrl);
    localStorage.setItem('tweedl_manage_webhook_url', localManageUrl);
    localStorage.setItem('tweedl_ai_webhook_url', localAiUrl);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-800 transition-colors">
        <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex justify-between items-center text-white border-b border-slate-800">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Configuration
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Create Webhook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Create Competition Webhook
            </label>
            <input 
              type="url" 
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://n8n.../webhook/..."
              className="w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-sm p-2 border bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
              Endpoint for creating new competitions.
            </p>
          </div>

          {/* Manage Webhook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              Manage Inventory Webhook
            </label>
            <input 
              type="url" 
              value={localManageUrl}
              onChange={(e) => setLocalManageUrl(e.target.value)}
              placeholder="https://n8n.../webhook/..."
              className="w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
              Endpoint for listing, updating, and deleting competitions.
            </p>
          </div>

          {/* AI Webhook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Enhancement Webhook
            </label>
            <input 
              type="url" 
              value={localAiUrl}
              onChange={(e) => setLocalAiUrl(e.target.value)}
              placeholder="https://n8n.../webhook/ai-polish"
              className="w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm p-2 border bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
              Endpoint for Azure OpenAI polishing requests.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-950 px-6 py-4 flex justify-end border-t border-gray-100 dark:border-slate-800">
          <button 
            onClick={handleSave}
            className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;