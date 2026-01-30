
import React, { ChangeEvent, useState } from 'react';
import { DesignType, Platform, Template, DesignState, PaletteItem } from '../types';
import { TEMPLATES } from '../constants';
import { Icon } from './Icon';

interface SidebarProps {
  designType: DesignType;
  setDesignType: (type: DesignType) => void;
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onEdit: () => void;
  onTemplateSelect: (template: Template) => void;
  onImageUpload: (file: File) => void;
  onNewDesign: () => void;
  isEditing: boolean;
  isLoading: boolean;
  history: DesignState[];
  historyIndex: number;
  onHistorySelect: (index: number) => void;
  colorPalette: PaletteItem[] | null;
}

const designOptions: { id: DesignType; label: string; icon: React.ReactNode }[] = [
  { id: 'ui', label: 'UI Design', icon: <Icon name="layout" /> },
  { id: 'wireframe', label: 'Wireframe', icon: <Icon name="figma" /> },
  { id: 'logo', label: 'Logo', icon: <Icon name="hexagon" /> },
  { id: 'svg', label: 'SVG', icon: <Icon name="code" /> },
];

const platformOptions: { id: Platform; label: string }[] = [
  { id: 'web', label: 'Web' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'tablet', label: 'Tablet' },
];

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      props.onImageUpload(e.target.files[0]);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 1500);
    });
  };
  
  return (
    <aside className="w-full md:w-96 bg-slate-800 p-6 flex flex-col gap-6 overflow-y-auto border-r border-slate-700/50">
      <button
        onClick={props.onNewDesign}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all group"
      >
        <Icon name="plus" className="w-4 h-4 group-hover:scale-110 transition-transform" />
        New Design
      </button>

      <div className="h-px bg-slate-700/50"></div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Design Type</h2>
        <div className="grid grid-cols-2 gap-2">
          {designOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => props.setDesignType(opt.id)}
              className={`flex items-center justify-center gap-2 p-3 text-sm rounded-md transition-colors ${
                props.designType === opt.id
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'bg-slate-700 hover:bg-slate-600/50'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {props.designType === 'wireframe' && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Platform</h2>
          <div className="flex bg-slate-700 rounded-md p-1">
            {platformOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => props.setPlatform(opt.id)}
                className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                  props.platform === opt.id ? 'bg-blue-600 text-white font-medium shadow' : 'hover:bg-slate-600/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Prompt</h2>
        <textarea
          value={props.prompt}
          onChange={(e) => props.setPrompt(e.target.value)}
          placeholder={props.isEditing ? 'Describe your design...' : `e.g., A minimalist logo for a coffee shop...`}
          rows={4}
          className="w-full p-3 bg-slate-700/80 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-white placeholder-slate-500"
          disabled={props.isEditing}
        />
      </div>

      {props.colorPalette && props.colorPalette.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Color Palette</h2>
          <div className="flex gap-2 p-1">
            {props.colorPalette.map((color, idx) => (
              <button
                key={`${color.hex}-${idx}`}
                onClick={() => copyToClipboard(color.hex)}
                className="group relative flex-1 h-12 rounded-lg border border-slate-700 shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: color.hex }}
                title={`${color.name}: ${color.hex}`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                   <Icon name={copiedColor === color.hex ? 'check' : 'copy'} className="w-4 h-4 text-white shadow-sm" />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between px-1">
             <span>Click to copy hex code</span>
          </div>
        </div>
      )}

      {!props.isEditing && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Templates</h2>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.filter(t => t.type === props.designType).map((template) => (
              <button key={template.name} onClick={() => props.onTemplateSelect(template)} className="p-3 bg-slate-700 rounded-md text-left hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">{template.icon}</span>
                  <h3 className="text-sm font-medium text-slate-200">{template.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-slate-700 my-2"></div>

      {props.isEditing ? (
        <div className="animate-fade-in">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Edit Instructions</h2>
          <textarea
            value={props.editPrompt}
            onChange={(e) => props.setEditPrompt(e.target.value)}
            placeholder="e.g., Change the background to dark blue..."
            rows={3}
            className="w-full p-3 bg-slate-700/80 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-white placeholder-slate-500"
          />
        </div>
      ) : (
        <div>
           <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Or Upload To Edit</h2>
           <label htmlFor="file-upload" className="w-full flex justify-center px-3 py-4 border-2 border-dashed border-slate-600 rounded-md cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition-colors">
              <div className="text-center">
                <Icon name="upload-cloud" className="mx-auto h-8 w-8 text-slate-400"/>
                <p className="mt-1 text-sm text-slate-400">Click to upload an image</p>
              </div>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
           </label>
        </div>
      )}

      {props.history.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">History</h2>
            <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
              {props.history.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {props.history.map((item, idx) => (
              <button
                key={item.timestamp}
                onClick={() => props.onHistorySelect(idx)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                  props.historyIndex === idx 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105' 
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                {item.image ? (
                  <img src={item.image} alt={`History ${idx}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Icon name="image" className="w-6 h-6 text-slate-700" />
                  </div>
                )}
                {props.historyIndex === idx && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="bg-blue-600 rounded-full p-1 shadow-lg">
                      <Icon name="check" className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] py-0.5 text-center truncate px-1">
                  {item.designType.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-4">
        <button
          onClick={props.isEditing ? props.onEdit : props.onGenerate}
          disabled={props.isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:bg-slate-500 transition-all transform active:scale-95"
        >
          {props.isLoading ? (
            <>
              <Icon name="loader" className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
             <>
              <Icon name={props.isEditing ? 'edit-3' : 'zap'} className="w-5 h-5" />
              {props.isEditing ? 'Apply Edit' : 'Generate'}
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
