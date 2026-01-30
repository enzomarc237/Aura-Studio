
import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  onShare: () => void;
  isShareable: boolean;
  onSettingsClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onShare, 
  isShareable, 
  onSettingsClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 shadow-md z-30">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
          <Icon name="pen-tool" className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-slate-100 hidden sm:block">AI Design Studio</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center bg-slate-800 rounded-md p-1 border border-slate-700">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo"
          >
            <Icon name="rotate-ccw" className="w-5 h-5" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo"
          >
            <Icon name="rotate-cw" className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onShare}
          disabled={!isShareable}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="share-2" className="w-4 h-4" />
          <span className="hidden xs:inline">Share</span>
        </button>
        
        <button
          onClick={onSettingsClick}
          className="p-2 text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors"
          aria-label="AI Settings"
        >
          <Icon name="settings" className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
