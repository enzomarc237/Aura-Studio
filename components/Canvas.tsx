
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader } from './Loader';
import { Icon } from './Icon';

interface CanvasProps {
  image: string | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
  onImageUpload: (file: File) => void;
}

type ExportFormat = 'png' | 'jpg' | 'gif';

export const Canvas: React.FC<CanvasProps> = ({ image, isLoading, error, onDownload, onImageUpload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const convertAndDownload = useCallback((format: ExportFormat) => {
    if (!image) return;
    setIsExportMenuOpen(false);

    // SVG special case
    if (image.startsWith('data:image/svg+xml')) {
      if (format === 'png' || format === 'jpg') {
          // Logic for SVG to Raster conversion would go here if needed
          // For now, let's allow it to fall back to the raw SVG data URL if that's the "original"
      }
    }

    if (format === 'png') {
        onDownload();
        return;
    }

    // Creating hidden canvas for format conversion
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // For JPG/GIF we usually want a solid background if there's transparency
      if (format === 'jpg') {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/gif';
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      
      const link = document.createElement('a');
      link.download = `ai-design-${Date.now()}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = image;
  }, [image, onDownload]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full h-full rounded-xl flex items-center justify-center relative p-4 shadow-2xl overflow-hidden transition-all duration-300 ${
        isDragging ? 'ring-4 ring-blue-500 bg-blue-500/10' : 'bg-slate-900'
      }`}
      style={{
        background: `
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(37, 99, 235, 0.12) 0%, transparent 40%),
          radial-gradient(circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)
        `
      } as React.CSSProperties}
    >
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {isDragging && (
        <div className="absolute inset-0 z-40 bg-blue-600/20 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-dashed border-blue-500 m-4 rounded-xl">
           <Icon name="upload-cloud" className="w-16 h-16 text-blue-400 mb-4 animate-bounce" />
           <p className="text-2xl font-bold text-white">Drop to Edit Design</p>
        </div>
      )}

      {isLoading && <Loader />}
      
      {!isLoading && error && (
        <div className="text-center text-red-400 z-10 animate-fade-in">
          <Icon name="alert-triangle" className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Generation Failed</h3>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {!isLoading && !error && !image && (
        <div className="text-center text-slate-500 z-10 animate-fade-in">
           <div className="relative inline-block mb-6">
             <Icon name="image" className="w-24 h-24 mx-auto opacity-30"/>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
             </div>
           </div>
          <h2 className="text-2xl font-bold text-slate-300">Your design will appear here</h2>
          <p className="mt-2 text-slate-500 max-w-xs mx-auto">Use controls on the left or drag an image here to start editing.</p>
        </div>
      )}

      {!isLoading && !error && image && (
        <div className="relative group w-full h-full flex items-center justify-center">
            <img 
                src={image} 
                alt="Generated design" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] z-10"
            />
            
            <div className="absolute top-4 left-4 z-20">
               <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md text-[10px] font-bold text-white rounded-full uppercase tracking-tighter shadow-lg">
                  Final Render
               </span>
            </div>

            <div className="absolute bottom-6 right-6 z-30 flex gap-2">
                <div className="relative">
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800/90 backdrop-blur-md text-white rounded-full hover:bg-slate-700 transition-all duration-300 shadow-xl border border-slate-700"
                    >
                        <Icon name="download" className="w-5 h-5"/>
                        <span className="font-semibold">Export</span>
                        <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isExportMenuOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden animate-fade-in">
                            {(['png', 'jpg', 'gif'] as ExportFormat[]).map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => convertAndDownload(fmt)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600 transition-colors uppercase font-bold"
                                >
                                    .{fmt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
