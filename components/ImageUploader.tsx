import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageData } from '../types';
import { fileToBase64, validateFile } from '../utils';

interface ImageUploaderProps {
  label: string;
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
  multiple?: boolean;
  required?: boolean;
  error?: string;
  variant?: 'square' | 'wide';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  images,
  onChange,
  multiple = false,
  required = false,
  error,
  variant = 'square',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          base64,
        });
      } catch (err) {
        console.error('Error processing file:', err);
      }
    }

    if (multiple) {
      onChange([...images, ...newImages]);
    } else {
      // If single, replace
      onChange(newImages);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview); // Cleanup memory
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const containerClass = variant === 'wide' 
    ? 'aspect-video w-full' 
    : 'h-40 w-full';

  return (
    <div className="mb-8 group">
      <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
        {label} 
        {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Upload Area */}
      {images.length === 0 || multiple ? (
        <div 
          onClick={triggerUpload}
          className={`
            ${containerClass}
            border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${error 
              ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10' 
              : 'border-slate-300 dark:border-white/10 bg-white/40 dark:bg-black/20 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'}
          `}
        >
          <div className="bg-white/80 dark:bg-black/40 p-4 rounded-full mb-3 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-300">
             <Upload className={`w-6 h-6 ${error ? 'text-red-400' : 'text-indigo-500 dark:text-indigo-400'}`} />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
            {variant === 'wide' ? 'Upload Cover Image' : 'Click to upload'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {variant === 'wide' ? '16:9 Recommended • Max 10MB' : 'JPG, PNG, WEBP • Max 10MB'}
          </p>
        </div>
      ) : null}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
        accept="image/png, image/jpeg, image/webp, image/gif"
      />

      {error && <p className="text-sm text-red-500 mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{error}</p>}

      {/* Previews */}
      {images.length > 0 && (
        <div className={`mt-6 grid gap-6 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
          {images.map((img, idx) => (
            <div key={idx} className={`relative group/img rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/40 border border-white/20 dark:border-white/5 ${variant === 'wide' && !multiple ? 'aspect-video' : 'aspect-square'}`}>
              <img 
                src={img.preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-3 right-3 bg-red-500/90 text-white rounded-full p-2 opacity-0 group-hover/img:opacity-100 transition-all transform hover:scale-110 shadow-lg backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {/* Add More Button for Multiple */}
          {multiple && (
            <button
               type="button"
               onClick={triggerUpload}
               className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 dark:hover:text-indigo-400 dark:hover:border-indigo-400 transition-colors bg-white/5 dark:bg-white/5"
            >
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold uppercase">Add</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;