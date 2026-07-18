import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Copy, Settings } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface DesktopTitleBarProps {
  onOpenSettings?: () => void;
}

// Strictly verify we are running inside the Tauri native container
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

export default function DesktopTitleBar({ onOpenSettings }: DesktopTitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  // If not running in Tauri native container, do not render the title bar
  if (!isTauri) return null;

  useEffect(() => {
    // Set CSS variable for custom header drag region offset
    document.documentElement.style.setProperty('--titlebar-h', '36px');
    return () => {
      document.documentElement.style.setProperty('--titlebar-h', '0px');
    };
  }, []);

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        if (isTauri) {
          const max = await invoke<boolean>('is_window_maximized');
          setIsMaximized(max);
        }
      } catch (e) {
        // Quietly suppress browser/sandbox IPC check warnings
      }
    };
    checkMaximized();

    const interval = setInterval(checkMaximized, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = async () => {
    try {
      await invoke('minimize_window');
    } catch (e) {
      console.warn('Minimize command failed:', e);
    }
  };

  const handleMaximize = async () => {
    try {
      await invoke('maximize_window');
      const max = await invoke<boolean>('is_window_maximized');
      setIsMaximized(max);
    } catch (e) {
      console.warn('Maximize command failed:', e);
    }
  };

  const handleClose = async () => {
    try {
      await invoke('close_window');
    } catch (e) {
      console.warn('Close command failed:', e);
    }
  };

  return (
    <div
      className="h-9 bg-[#050608] flex items-center justify-between select-none border-b border-slate-900/80 shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left — App identity */}
      <div className="flex items-center gap-2.5 pl-3.5">
        <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 rounded-md flex items-center justify-center font-black text-[8px] text-slate-950 font-mono tracking-tighter">
          AT
        </div>
        <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase font-mono">
          AI Titan <span className="text-cyan-500/70">Silicon Empire</span>
        </span>
      </div>

      {/* Right — Window controls */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Settings button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="h-full px-3 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="h-full px-3.5 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Minimize"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          className="h-full px-3.5 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <Copy className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="h-full px-3.5 flex items-center justify-center text-slate-500 hover:text-slate-100 hover:bg-rose-600 transition-colors cursor-pointer rounded-none"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
