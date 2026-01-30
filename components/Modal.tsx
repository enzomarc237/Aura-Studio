
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  image: string | null;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ image, onClose }) => {
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const handleCopyLink = () => {
    // In a real app, this would be a public URL to the image.
    // Here we'll just copy the base64 data URL as a placeholder.
    if (image) {
      navigator.clipboard.writeText(image).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <Icon name="x" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6">Share your Creation</h2>
        
        <div className="mb-6 bg-slate-900 p-4 rounded-lg">
          {image && <img src={image} alt="Shared design" className="max-h-96 w-full object-contain rounded" />}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              readOnly 
              value="https://aidesign.studio/share/xyz123" // Dummy link
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 pr-28"
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-1 top-1 bottom-1 flex items-center gap-2 px-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Icon name={linkCopied ? 'check' : 'copy'} className="w-4 h-4" />
              {linkCopied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
