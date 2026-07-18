import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

export default function ApiKeySettings({ isOpen, onClose }: ApiKeySettingsProps) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [currentKeyMasked, setCurrentKeyMasked] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    if (isOpen && (electronAPI || isTauri)) {
      loadCurrentKey();
    }
  }, [isOpen]);

  const loadCurrentKey = async () => {
    try {
      if (isTauri) {
        const masked = await invoke<string>('get_api_key');
        const has = await invoke<boolean>('has_api_key');
        setCurrentKeyMasked(masked);
        setHasKey(has);
      } else if (electronAPI) {
        const masked = await electronAPI.getApiKey();
        const has = await electronAPI.hasApiKey();
        setCurrentKeyMasked(masked);
        setHasKey(has);
      }
    } catch (e) {
      console.warn('Failed to load API key status:', e);
    }
  };

  const handleSave = async () => {
    if (!apiKeyInput.trim()) return;
    setSaveStatus('saving');
    try {
      if (isTauri) {
        await invoke('set_api_key', { key: apiKeyInput.trim() });
      } else if (electronAPI) {
        await electronAPI.setApiKey(apiKeyInput.trim());
      }
      setSaveStatus('saved');
      setApiKeyInput('');
      await loadCurrentKey();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Failed to save API key:', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleClear = async () => {
    try {
      if (isTauri) {
        await invoke('clear_api_key');
      } else if (electronAPI) {
        await electronAPI.clearApiKey();
      }
      setCurrentKeyMasked('');
      setHasKey(false);
    } catch (e) {
      console.error('Failed to clear API key:', e);
    }
  };

  // If not running in desktop shell, don't render settings
  if (!electronAPI && !isTauri) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Key className="h-4.5 w-4.5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm">API Configuration</h2>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Gemini API Key Settings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Status */}
            <div className={`p-3.5 rounded-xl border ${hasKey ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-amber-950/20 border-amber-900/40'}`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                {hasKey ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">API Key Configured</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-400">No API Key Set</span>
                  </>
                )}
              </div>
              {hasKey && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">{currentKeyMasked}</span>
                  <button
                    onClick={handleClear}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Remove Key
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="space-y-2.5">
              <label className="text-xs text-slate-400 font-medium block">
                {hasKey ? 'Replace API Key' : 'Enter your Gemini API Key'}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showInput ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInput(!showInput)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showInput ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!apiKeyInput.trim() || saveStatus === 'saving'}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    saveStatus === 'saved'
                      ? 'bg-emerald-600 text-white'
                      : saveStatus === 'error'
                        ? 'bg-rose-600 text-white'
                        : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 hover:opacity-90'
                  }`}
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
              <p>
                The Gemini API Key enables AI-powered features: dynamic social media replies and the AI advisor.
              </p>
              <p>
                Your key is stored locally in standard Tauri local data directory settings and never transmitted to any third-party server.
              </p>
              <p className="text-cyan-500/70">
                Get a free API key at <span className="underline">aistudio.google.com</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
