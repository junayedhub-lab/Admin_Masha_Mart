import React, { useState } from 'react';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  placeholder?: string;
  aspectRatio?: string;
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'banners',
  folder = '',
  label = 'Image',
  placeholder = 'Click to upload',
  aspectRatio = 'aspect-[3/1]'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const pathPrefix = folder ? `${folder}/` : '';
      const filePath = `${pathPrefix}${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="form-label">{label}</label>
      <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-pink-300 transition-colors group relative overflow-hidden bg-slate-50/50`}>
        {value ? (
          <div className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border border-slate-200`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange('');
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-pink-50 text-pink-500 mb-3 group-hover:scale-110 transition-transform">
              {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
            </div>
            <p className="text-sm font-semibold text-slate-700">{placeholder}</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
      {value && (
        <div className="mt-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
          <input 
            type="text" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="form-input text-xs" 
            placeholder="https://..." 
          />
        </div>
      )}
    </div>
  );
}
