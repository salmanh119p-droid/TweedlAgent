import React, { useState } from 'react';
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import { CompetitionFormData, ImageData, FormErrors, WebhookResponse } from '../types';

interface CompetitionFormProps {
  webhookUrl: string;
  aiWebhookUrl?: string;
}

const CompetitionForm: React.FC<CompetitionFormProps> = ({ webhookUrl, aiWebhookUrl }) => {
  // Form State
  const [formData, setFormData] = useState<CompetitionFormData>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    ticketPrice: '',
    maxTickets: '',
    startDate: '',
    endDate: '',
    upsellProducts: '',
    publishImmediately: false,
  });

  const [mainImage, setMainImage] = useState<ImageData[]>([]);
  const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; link?: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleAIPolish = async (field: 'title' | 'shortDescription' | 'fullDescription') => {
    if (!aiWebhookUrl) {
      alert("Please configure the AI Webhook URL in Settings first.");
      return;
    }

    const currentText = formData[field];
    if (!currentText || currentText.trim() === "") {
      alert("Please enter some text first for the AI to enhance.");
      return;
    }

    setAiLoadingField(field);

    try {
      const response = await fetch(aiWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentText, 
          field: field 
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI response");

      const data = await response.json();
      
      if (data.result) {
        setFormData(prev => ({ ...prev, [field]: data.result }));
      } else {
        alert("AI response format invalid. Check n8n workflow.");
      }

    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to enhance text. Check console for details.");
    } finally {
      setAiLoadingField(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!webhookUrl) {
      alert("Please configure the Webhook URL in the settings (gear icon) before proceeding.");
      return false;
    }

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Full description is required';
    if (!formData.ticketPrice || Number(formData.ticketPrice) < 0) newErrors.ticketPrice = 'Valid price is required';
    if (!formData.maxTickets || Number(formData.maxTickets) < 1) newErrors.maxTickets = 'Max tickets must be at least 1';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (mainImage.length === 0) newErrors.mainImage = 'Main image is required';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('short_description', formData.shortDescription);
      data.append('full_description', formData.fullDescription);
      data.append('price', String(formData.ticketPrice));
      data.append('max_tickets', String(formData.maxTickets));
      data.append('start_date', formData.startDate);
      data.append('end_date', formData.endDate);
      data.append('upsells', formData.upsellProducts);
      data.append('status', formData.publishImmediately ? 'publish' : 'draft');

      if (mainImage.length > 0) data.append('main_image', mainImage[0].file);
      galleryImages.forEach((img) => data.append('gallery_images', img.file));

      const response = await fetch(webhookUrl, { method: 'POST', body: data });

      if (!response.ok) throw new Error(`Webhook error: ${response.statusText}`);

      const textResponse = await response.text();
      let jsonResponse: WebhookResponse = { success: true };
      try { jsonResponse = JSON.parse(textResponse); } catch (e) { /* ignore */ }

      setStatus({
        type: 'success',
        message: 'Competition successfully created!',
        link: jsonResponse.productUrl || (jsonResponse as any).url,
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to the webhook.',
      });
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- STYLING CONSTANTS ---
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
  
  const labelClass = `block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between`;
  
  const sectionHeaderClass = `text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 mb-8 mt-2`;

  const AiButton = ({ field }: { field: 'title' | 'shortDescription' | 'fullDescription' }) => (
    <button
      type="button"
      onClick={() => handleAIPolish(field)}
      disabled={!!aiLoadingField}
      className="group relative inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 overflow-hidden"
    >
      <span className="relative z-10 flex items-center gap-1.5">
        {aiLoadingField === field ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        <span>{aiLoadingField === field ? 'Enhancing...' : 'AI Polish'}</span>
      </span>
      <div className="absolute inset-0 bg-indigo-400/10 dark:bg-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in relative pb-48">
      
      {/* STATUS OVERLAY */}
      {status && (
        <div className={`mb-12 p-6 rounded-2xl shadow-xl border backdrop-blur-xl ${status.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50' : 'bg-red-50/90 border-red-200 dark:bg-red-900/30 dark:border-red-800/50'}`}>
          <div className="flex gap-4 items-center">
            {status.type === 'success' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <div>
              <h3 className={`font-bold text-xl ${status.type === 'success' ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>
                {status.type === 'success' ? 'Competition Created Successfully' : 'Submission Failed'}
              </h3>
              <p className={`text-base mt-1 ${status.type === 'success' ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                {status.message}
              </p>
              {status.link && (
                <a href={status.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors">
                  View Competition <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* LEFT COLUMN: THE PITCH */}
        <div className="space-y-12">
          <section>
            <h2 className={sectionHeaderClass}>The Pitch</h2>
            <div className="space-y-8">
              <div className="group">
                <label className={labelClass}>
                  <span>Title <span className="text-red-500">*</span></span>
                  <AiButton field="title" />
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${inputClass} text-2xl font-bold tracking-tight ${errors.title ? 'border-red-500 focus:border-red-500 ring-red-500/20' : ''}`}
                  placeholder="e.g. Win a 2024 Land Rover Defender"
                />
                {errors.title && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  <span>Short Description <span className="text-red-500">*</span></span>
                  <AiButton field="shortDescription" />
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className={`${inputClass} ${errors.shortDescription ? 'border-red-500' : ''}`}
                  placeholder="A punchy one-liner for the card view..."
                />
                {errors.shortDescription && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.shortDescription}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  <span>Full Description <span className="text-red-500">*</span></span>
                  <AiButton field="fullDescription" />
                </label>
                <textarea
                  name="fullDescription"
                  rows={20}
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  className={`${inputClass} font-normal leading-relaxed ${errors.fullDescription ? 'border-red-500' : ''}`}
                  placeholder="Tell the full story here..."
                />
                {errors.fullDescription && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.fullDescription}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: VISUALS, LOGISTICS, UPSELLS */}
        <div className="space-y-16">
          
          {/* VISUALS */}
          <section>
             <h2 className={sectionHeaderClass}>Visuals</h2>
             <div className="space-y-8">
               <div>
                  <ImageUploader 
                    label="Cover Image" 
                    images={mainImage} 
                    onChange={setMainImage} 
                    required 
                    error={errors.mainImage}
                    variant="wide"
                  />
               </div>
               
               <div className="pt-4">
                  <ImageUploader 
                    label="Gallery Images" 
                    images={galleryImages} 
                    onChange={setGalleryImages} 
                    multiple
                  />
               </div>
             </div>
          </section>

          {/* LOGISTICS */}
          <section>
            <h2 className={sectionHeaderClass}>Logistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className={labelClass}>Ticket Price (£) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 font-bold">£</span>
                    <input
                      type="number"
                      name="ticketPrice"
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10 font-mono ${errors.ticketPrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.ticketPrice && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.ticketPrice}</p>}
                </div>

                <div>
                  <label className={labelClass}>Total Tickets <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <span className="absolute left-4 top-4 text-slate-400 font-bold">#</span>
                    <input
                      type="number"
                      name="maxTickets"
                      min="1"
                      step="1"
                      value={formData.maxTickets}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10 font-mono ${errors.maxTickets ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.maxTickets && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.maxTickets}</p>}
                </div>

                 <div className="md:col-span-2">
                  <label className={labelClass}>Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                   {errors.startDate && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.startDate}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>End Date <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`${inputClass} ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                   {errors.endDate && <p className="text-sm font-medium text-red-500 mt-2 ml-1">{errors.endDate}</p>}
                </div>
            </div>
          </section>

          {/* UPSELLS */}
          <section>
             <h2 className={sectionHeaderClass}>Upsells</h2>
             <div>
                <label className={labelClass}>Related Product IDs</label>
                <input
                  type="text"
                  name="upsellProducts"
                  value={formData.upsellProducts}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder="e.g. 101, 202, 303"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <span>Comma separated. Leave empty for random assignment.</span>
                </p>
             </div>
          </section>

        </div>
      </div>

      {/* FLOATING COMMAND BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <label className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="publishImmediately"
                    checked={formData.publishImmediately}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-600 transition bg-transparent"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="font-bold text-slate-900 dark:text-white block">Publish Live</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Uncheck for Draft</span>
                </div>
              </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full sm:w-auto sm:min-w-[300px] flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold uppercase tracking-widest rounded-xl shadow-2xl text-white 
              ${isLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1'}
              transition-all duration-300
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                {formData.publishImmediately ? 'Launch Competition' : 'Save as Draft'}
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
};

export default CompetitionForm;