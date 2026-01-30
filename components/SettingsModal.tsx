
import React, { useState } from 'react';
import { AiSettings, AspectRatio } from '../types';
import { Icon } from './Icon';

interface SettingsModalProps {
  settings: AiSettings;
  onSave: (settings: AiSettings) => void;
  onClose: () => void;
}

const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: '16:9', label: '16:9 (Landscape)' },
    { value: '9:16', label: '9:16 (Portrait)' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '3:4', label: '3:4 (Tall)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AiSettings>(settings);

  const handleChange = (field: keyof AiSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <Icon name="x" className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <Icon name="settings" className="w-6 h-6 text-blue-400"/>
          <h2 className="text-2xl font-bold">AI Studio Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="textModel" className="block text-sm font-medium text-slate-300 mb-2">Text & Reasoning Model</label>
            <select
              id="textModel"
              value={localSettings.textModel}
              onChange={(e) => handleChange('textModel', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="gemini-3-flash-preview">gemini-3-flash-preview (Fast)</option>
              <option value="gemini-3-pro-preview">gemini-3-pro-preview (Advanced)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="imageModel" className="block text-sm font-medium text-slate-300 mb-2">Image Generation Model</label>
            <select
              id="imageModel"
              value={localSettings.imageModel}
              onChange={(e) => handleChange('imageModel', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (Efficient)</option>
              <option value="gemini-3-pro-image-preview">gemini-3-pro-image-preview (High-Quality)</option>
              <option value="imagen-4.0-generate-001">imagen-4.0-generate-001</option>
            </select>
          </div>

          <div>
            <label htmlFor="editModel" className="block text-sm font-medium text-slate-300 mb-2">Image Editing Model</label>
            <select
              id="editModel"
              value={localSettings.editModel}
              onChange={(e) => handleChange('editModel', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (Default)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300 mb-2">Default Aspect Ratio</label>
            <select
              id="aspectRatio"
              value={localSettings.aspectRatio}
              onChange={(e) => handleChange('aspectRatio', e.target.value as AspectRatio)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {aspectRatios.map(ratio => (
                <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-slate-300 mb-2">
              Temperature: <span className="font-bold text-blue-400">{localSettings.temperature.toFixed(1)}</span>
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mt-2">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
