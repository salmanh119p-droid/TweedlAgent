import React, { useState } from 'react';
import { 
  Trash2, 
  CalendarClock, 
  AlertTriangle, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  List,
  RefreshCw,
  ArrowDownToLine,
  Clock,
  CalendarDays,
  X
} from 'lucide-react';

interface CompetitionManagerProps {
  webhookUrl: string;
}

interface Product {
  id: string | number;
  title: string;
  status?: string;
  price?: string;
  start_date?: string;
  end_date?: string;
}

const CompetitionManager: React.FC<CompetitionManagerProps> = ({ webhookUrl }) => {
  const [identifier, setIdentifier] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  
  // List State
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [listError, setListError] = useState('');

  // Action State
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionType, setActionType] = useState<'update_start' | 'update_end' | 'delete' | null>(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchProducts = async () => {
    setIsFetchingList(true);
    setListError('');
    setProducts([]);

    if (!webhookUrl) {
      setListError('Webhook URL not configured');
      setIsFetchingList(false);
      return;
    }

    try {
      // Switched to JSON for better reliability than FormData without files
      const response = await fetch(webhookUrl, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'list_competitions' })
      });

      if (!response.ok) throw new Error(`Network error: ${response.statusText}`);

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      // Handle various response structures (direct array or wrapped in data/products)
      const list = Array.isArray(json) ? json : (json.data || json.products || []);
      
      if (Array.isArray(list)) {
        setProducts(list);
        if (list.length === 0) setListError('No competitions found.');
      } else {
        throw new Error('Could not parse product list from response.');
      }

    } catch (error) {
      console.error('Fetch error:', error);
      setListError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsFetchingList(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setIdentifier(product.title);
    window.scrollTo({ top: document.getElementById('identify-section')?.offsetTop ? document.getElementById('identify-section')!.offsetTop - 100 : 0, behavior: 'smooth' });
  };

  const handleAction = async (type: 'update_start' | 'update_end' | 'delete') => {
    setStatus(null);
    if (!identifier.trim()) {
      setStatus({ type: 'error', message: 'Please provide a Competition Title or ID.' });
      return;
    }

    if (!webhookUrl) {
       setStatus({ type: 'error', message: 'Webhook URL is not configured.' });
       return;
    }

    if (type === 'update_start' && !newStartDate) {
      setStatus({ type: 'error', message: 'Please select a new Start Date.' });
      return;
    }

    if (type === 'update_end' && !newEndDate) {
      setStatus({ type: 'error', message: 'Please select a new End Date.' });
      return;
    }

    if (type === 'delete') {
      setShowDeleteModal(true);
      return;
    }

    await performAction(type);
  };

  const performAction = async (type: 'update_start' | 'update_end' | 'delete') => {
    setActionType(type);
    setIsLoading(true);

    try {
      const payload: any = {
        action: type === 'delete' ? 'delete' : 'update',
        identifier: identifier
      };

      if (type === 'update_start') payload.new_start_date = newStartDate;
      if (type === 'update_end') payload.new_end_date = newEndDate;

      const response = await fetch(webhookUrl, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Webhook error: ${response.statusText}`);

      const textResponse = await response.text();
      try {
        const json = JSON.parse(textResponse);
        if (json.success === false) throw new Error(json.message || 'Operation failed');
      } catch(e) { /* ignore parse errors if successful HTTP code */ }

      setStatus({
        type: 'success',
        message: type === 'delete' 
          ? 'Competition removal request sent successfully.' 
          : 'Schedule update request sent successfully.'
      });
      
      // Clear fields on success
      if (type === 'delete') setIdentifier('');
      if (type === 'update_start') setNewStartDate('');
      if (type === 'update_end') setNewEndDate('');

      // Refresh list if it was open
      if (products.length > 0) fetchProducts();

    } catch (error) {
      console.error('Operation error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to the webhook.',
      });
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await performAction('delete');
  };

  const inputClass = `
    block w-full rounded-xl border-slate-200 dark:border-white/10 shadow-sm 
    focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 
    p-4 border 
    bg-white/60 dark:bg-black/20 
    text-slate-900 dark:text-white 
    caret-slate-900 dark:caret-white
    placeholder:text-slate-400 dark:placeholder:text-slate-600
    transition-all duration-200
    backdrop-blur-sm
    text-lg
  `;

  return (
    <div className="max-w-6xl mx-auto pb-40 animate-fade-in space-y-10 relative">
      
      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200 dark:border-red-900/50 scale-100 animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center">
              <h3 className="font-bold text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Deletion
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Are you sure you want to permanently delete:
              </p>
              <div className="bg-slate-100 dark:bg-black/40 p-3 rounded-lg border border-slate-200 dark:border-white/10 font-mono text-sm mb-6 break-words">
                {identifier}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                This action cannot be undone. All associated data will be removed.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. PRODUCT INVENTORY SECTION */}
      <section className="bg-white/30 dark:bg-white/5 rounded-3xl p-6 md:p-8 border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <List className="w-6 h-6 text-indigo-500" />
            Product Inventory
          </h2>
          <button
            onClick={fetchProducts}
            disabled={isFetchingList}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-semibold text-sm"
          >
            {isFetchingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {products.length > 0 ? 'Refresh List' : 'Load Published Products'}
          </button>
        </div>

        {listError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4">
            {listError}
          </div>
        )}

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-xs uppercase bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">ID</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.status === 'publish' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {p.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleSelectProduct(p)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium text-xs flex items-center gap-1 justify-end ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Select <ArrowDownToLine className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !isFetchingList && !listError && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              Click "Load Published Products" to view existing competitions.
            </div>
          )
        )}
      </section>

      {/* STATUS MESSAGE */}
      {status && (
        <div className={`p-6 rounded-2xl shadow-xl border backdrop-blur-xl ${status.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50' : 'bg-red-50/90 border-red-200 dark:bg-red-900/30 dark:border-red-800/50'}`}>
          <div className="flex gap-4 items-center">
            {status.type === 'success' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <div>
              <h3 className={`font-bold text-xl ${status.type === 'success' ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>
                {status.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className={`text-base mt-1 ${status.type === 'success' ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                {status.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. IDENTIFICATION SECTION */}
      <section id="identify-section" className="bg-white/40 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-md">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
           <Search className="w-6 h-6 text-indigo-500" />
           Identify Competition
         </h2>
         <div>
           <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
             Competition Title or ID <span className="text-red-500">*</span>
           </label>
           <input
             type="text"
             value={identifier}
             onChange={(e) => setIdentifier(e.target.value)}
             placeholder="Select from list above or enter Title / ID"
             className={`${inputClass} font-mono text-xl`}
           />
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
             The Title (or ID) is required to apply changes to the correct competition.
           </p>
         </div>
      </section>

      {/* 3. ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* START DATE CARD */}
        <div className="bg-white/40 dark:bg-white/5 rounded-3xl p-6 border border-white/20 dark:border-white/5 shadow-lg flex flex-col h-full">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <CalendarDays className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-slate-800 dark:text-white">Update Start Date</h3>
           </div>
           
           <div className="flex-grow space-y-4">
             <p className="text-sm text-slate-600 dark:text-slate-400">
               Change when this competition begins.
             </p>
             <input
                type="datetime-local"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className={`${inputClass} text-sm py-3`}
              />
           </div>

           <button
             onClick={() => handleAction('update_start')}
             disabled={isLoading}
             className={`mt-6 w-full py-3 rounded-xl font-bold uppercase tracking-wide text-xs flex items-center justify-center transition-all shadow-lg
               ${isLoading && actionType === 'update_start'
                 ? 'bg-slate-400 text-slate-200 cursor-not-allowed' 
                 : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1'
               }
             `}
           >
             {isLoading && actionType === 'update_start' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
             Save Start Date
           </button>
        </div>

        {/* END DATE CARD */}
        <div className="bg-white/40 dark:bg-white/5 rounded-3xl p-6 border border-white/20 dark:border-white/5 shadow-lg flex flex-col h-full">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Clock className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-slate-800 dark:text-white">Update End Date</h3>
           </div>
           
           <div className="flex-grow space-y-4">
             <p className="text-sm text-slate-600 dark:text-slate-400">
               Change when this competition closes.
             </p>
             <input
                type="datetime-local"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className={`${inputClass} text-sm py-3`}
              />
           </div>

           <button
             onClick={() => handleAction('update_end')}
             disabled={isLoading}
             className={`mt-6 w-full py-3 rounded-xl font-bold uppercase tracking-wide text-xs flex items-center justify-center transition-all shadow-lg
               ${isLoading && actionType === 'update_end'
                 ? 'bg-slate-400 text-slate-200 cursor-not-allowed' 
                 : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1'
               }
             `}
           >
             {isLoading && actionType === 'update_end' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
             Save End Date
           </button>
        </div>

        {/* DELETE CARD */}
        <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/30 shadow-lg flex flex-col h-full">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
           </div>
           
           <div className="flex-grow">
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
               Permanently remove this competition.
             </p>
             <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400/80 space-y-1">
               <li>Irreversible action</li>
               <li>Removes product from store</li>
               <li>Archives ticket data</li>
             </ul>
           </div>

           <button
             onClick={() => handleAction('delete')}
             disabled={isLoading}
             className={`mt-6 w-full py-3 rounded-xl font-bold uppercase tracking-wide text-xs flex items-center justify-center transition-all shadow-lg
               ${isLoading && actionType === 'delete'
                 ? 'bg-slate-400 text-slate-200 cursor-not-allowed' 
                 : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1'
               }
             `}
           >
             {isLoading && actionType === 'delete' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
             Delete Competition
           </button>
        </div>

      </div>
    </div>
  );
};

export default CompetitionManager;