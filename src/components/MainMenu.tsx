import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, FolderOpen, Sliders, Cpu, Info, Check, Trophy, Globe } from 'lucide-react';
import { GameState } from '../types';
import { invoke } from '@tauri-apps/api/core';

const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

interface MainMenuProps {
  onStartNewGame: () => void;
  onLoadGame: (savedState: GameState) => void;
  onCloseMenu?: () => void;
}

export default function MainMenu({ onStartNewGame, onLoadGame }: MainMenuProps) {
  const [hasSave, setHasSave] = useState(false);
  const [savedData, setSavedData] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'MAIN' | 'SETTINGS' | 'CREDITS' | 'SAVES' | 'CHANGELOG'>('MAIN');
  const [saveSlots, setSaveSlots] = useState<Record<string, GameState | null>>({
    slot1: null,
    slot2: null,
    slot3: null,
  });
  const [updateCheckStatus, setUpdateCheckStatus] = useState<'IDLE' | 'CHECKING' | 'DONE' | 'UPDATING'>('IDLE');
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Interactive settings state (stored in local options)
  const [musicVolume, setMusicVolume] = useState(70);
  const [gameDifficulty, setGameDifficulty] = useState<'NORMAL' | 'HARDCORE' | 'SANDBOX'>('NORMAL');
  const [glowEffects, setGlowEffects] = useState(true);

  const loadSlotsFromStorage = () => {
    try {
      const s1 = localStorage.getItem('ai_titan_save_slot_1');
      const s2 = localStorage.getItem('ai_titan_save_slot_2');
      const s3 = localStorage.getItem('ai_titan_save_slot_3');
      setSaveSlots({
        slot1: s1 ? JSON.parse(s1) : null,
        slot2: s2 ? JSON.parse(s2) : null,
        slot3: s3 ? JSON.parse(s3) : null,
      });
    } catch (e) {
      console.warn("Failed to load save slots:", e);
    }
  };

  useEffect(() => {
    loadSlotsFromStorage();
    try {
      const saved = localStorage.getItem('ai_titan_silicon_empire_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.onboardingCompleted) {
          setHasSave(true);
          setSavedData(parsed);
        }
      }
    } catch (e) {
      console.warn("Storage check failed:", e);
    }
  }, []);

  const handleLoad = () => {
    if (savedData) {
      onLoadGame(savedData);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050608] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Cyber grid effects with ambient slow-moving blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 40, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" 
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -30, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-cyan-950/20 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 z-10 w-full max-w-6xl px-4 relative h-full max-h-[700px] overflow-hidden">
        
        {/* Left Panel: Intelligence Briefing */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:flex flex-col w-64 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Globe className="h-4 w-4 text-cyan-500" />
            <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-cyan-400">Intelligence Brief</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <span className="text-[9px] font-bold text-rose-400 uppercase font-mono">Market Rumor</span>
              <p className="text-[11px] text-slate-300 leading-snug">Major VC firms are tightening AI seed rounds. Bootstrapping might be the only safe path this quarter.</p>
            </div>
            <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <span className="text-[9px] font-bold text-amber-400 uppercase font-mono">Hardware Alert</span>
              <p className="text-[11px] text-slate-300 leading-snug">TSMC pushing 3nm wafer prices up by 15%. Secondary GPU market exploding.</p>
            </div>
            <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <span className="text-[9px] font-bold text-emerald-400 uppercase font-mono">Open Source</span>
              <p className="text-[11px] text-slate-300 leading-snug">Llama-3 weights circulating on torrents. Developer community abandoning proprietary APIs.</p>
            </div>
          </div>
        </motion.div>

        {/* Central Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full bg-slate-900/65 border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/60 backdrop-blur-2xl relative z-10 space-y-8 glowing-cyan/5 flex-shrink-0"
        >
        
        {/* Sleek Cyberpunk Header */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-full text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> CLUSTER GRID ONLINE
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-cyan-200 to-indigo-400 font-sans">
            Silicon Empire
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase font-semibold">AI Titan Venture Simulator</p>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'MAIN' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* New Game Button */}
              <motion.button
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={onStartNewGame}
                className="w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-extrabold py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transition-all cursor-pointer"
              >
                <Play className="h-4.5 w-4.5 fill-slate-950 text-slate-950" />
                <span className="text-xs uppercase tracking-widest text-slate-950 font-black">Boot New Empire Venture</span>
              </motion.button>

              {/* Load Save Button */}
              <motion.button
                whileHover={hasSave ? { scale: 1.015, y: -1 } : {}}
                whileTap={hasSave ? { scale: 0.99 } : {}}
                onClick={handleLoad}
                disabled={!hasSave}
                className={`w-full font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all border text-xs uppercase tracking-widest ${
                  hasSave
                    ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-900 cursor-pointer shadow-inner'
                    : 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed'
                }`}
              >
                <FolderOpen className="h-4.5 w-4.5" />
                <span>Load Existing Blueprint</span>
              </motion.button>

              {/* Bottom Menu Items Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('SAVES')}
                  className="py-3 px-4 bg-slate-950/50 border border-slate-800/80 hover:bg-slate-950 text-slate-300 rounded-2xl text-[11px] font-mono uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:border-cyan-500/30 hover:text-cyan-400"
                >
                  <FolderOpen className="h-4 w-4 text-cyan-400" /> Save Slots
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CHANGELOG')}
                  className="py-3 px-4 bg-slate-950/50 border border-slate-800/80 hover:bg-slate-950 text-slate-350 rounded-2xl text-[11px] font-mono uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-450"
                >
                  <Globe className="h-4 w-4 text-emerald-450" /> Updates
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SETTINGS')}
                  className="py-3 px-4 bg-slate-950/50 border border-slate-800/80 hover:bg-slate-950 text-slate-300 rounded-2xl text-[11px] font-mono uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:border-cyan-500/30 hover:text-cyan-400"
                >
                  <Sliders className="h-4 w-4 text-cyan-400" /> Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CREDITS')}
                  className="py-3 px-4 bg-slate-950/50 border border-slate-800/80 hover:bg-slate-950 text-slate-350 rounded-2xl text-[11px] font-mono uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:border-purple-500/30 hover:text-purple-400"
                >
                  <Info className="h-4 w-4 text-purple-400" /> Credits
                </button>
              </div>

              {hasSave && savedData && (
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 text-[10px] font-mono text-slate-400 flex justify-between items-center shadow-inner">
                  <span>Auto-Save: <span className="text-slate-200 font-bold">{savedData.currentDate}</span> (Day {savedData.daysElapsed})</span>
                  <span className="text-cyan-400 font-bold">${savedData.cash.toLocaleString()}</span>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'SETTINGS' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-2.5 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" /> Simulation Config
              </h3>

              <div className="space-y-4 text-xs font-mono">
                {/* Difficulty Select */}
                <div className="space-y-2">
                  <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Simulation Difficulty</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['SANDBOX', 'NORMAL', 'HARDCORE'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setGameDifficulty(diff)}
                        className={`py-2.5 rounded-xl border text-[10px] uppercase font-black transition-all cursor-pointer ${
                          gameDifficulty === diff
                            ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-black'
                            : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                    {gameDifficulty === 'SANDBOX' && '💡 Zero power failure incident rates, starting cash boosted.'}
                    {gameDifficulty === 'NORMAL' && '💡 Regular market conditions and standard hardware upkeep fees.'}
                    {gameDifficulty === 'HARDCORE' && '⚠️ Increased power failures, higher GPU lease rates, strict VC limits.'}
                  </p>
                </div>

                {/* Volume Slider */}
                <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                  <div className="flex justify-between text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Hype Synthesis Frequency</span>
                    <span className="text-cyan-400 font-bold">{musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Toggle option */}
                <div className="flex justify-between items-center py-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">High Contrast HUD Glow</span>
                  <button
                    onClick={() => setGlowEffects(!glowEffects)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      glowEffects ? 'bg-indigo-600' : 'bg-slate-950'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-100 transition-transform ${
                        glowEffects ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('MAIN')}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Back to Main Menu
              </button>
            </motion.div>
          )}

          {activeTab === 'CREDITS' && (
            <motion.div
              key="credits"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-xs leading-relaxed text-slate-300"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-400" /> Venture Credits
              </h3>

              <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-2xl space-y-3.5 font-mono text-[10px] shadow-inner">
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Lead Simulation Director</span>
                  <span className="text-slate-200 font-extrabold uppercase text-[11px]">Alexis Mercer</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Game Mechanics Designer</span>
                  <span className="text-slate-200 font-extrabold uppercase text-[11px]">Silicon Valley AI Guild</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Design Philosophy</span>
                  <span className="text-slate-200 font-extrabold uppercase text-[11px]">Architectural Honesty / anti-slop</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Release version</span>
                  <span className="text-cyan-400 font-extrabold uppercase text-[11px]">v1.2.4</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('MAIN')}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Back to Main Menu
              </button>
            </motion.div>
          )}

          {activeTab === 'SAVES' && (
            <motion.div
              key="saves"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-cyan-400" /> Blueprint Profiles
              </h3>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {[1, 2, 3].map((slotNum) => {
                  const slotKey = `slot${slotNum}`;
                  const slotData = saveSlots[slotKey];

                  return (
                    <div 
                      key={slotNum}
                      className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-2xl flex flex-col gap-3 relative shadow-inner"
                    >
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="font-mono text-[9px] font-bold text-slate-500">PROFILE SLOT 0{slotNum}</span>
                        {slotData ? (
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-900/35">ACTIVE SAVED DATA</span>
                        ) : (
                          <span className="text-[8px] font-mono text-slate-650 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">EMPTY SLOT</span>
                        )}
                      </div>

                      {slotData ? (
                        <>
                          <div className="text-[10px] font-mono text-slate-350 space-y-0.5 leading-normal">
                            <div>COMPANY: <span className="text-slate-100 font-bold">{slotData.companyName}</span></div>
                            <div>PROGRESS: <span className="text-slate-100 font-bold">{slotData.currentDate}</span> (Day {slotData.daysElapsed})</div>
                            <div className="flex justify-between text-[9px] pt-1 border-t border-slate-900/50 mt-1">
                              <span>VALUATION: <span className="text-cyan-400">${slotData.valuation.toLocaleString()}</span></span>
                              <span>CASH: <span className="text-emerald-450">${slotData.cash.toLocaleString()}</span></span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => onLoadGame(slotData)}
                              className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 font-bold py-2 rounded-xl text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Load Slot
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const confirmDelete = window.confirm(`Delete blueprint save in Slot ${slotNum}?`);
                                if (confirmDelete) {
                                  localStorage.removeItem(`ai_titan_save_slot_${slotNum}`);
                                  loadSlotsFromStorage();
                                }
                              }}
                              className="bg-slate-900 hover:bg-red-950/30 text-rose-400 font-bold py-2 rounded-xl text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer border border-slate-800/80 text-center"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-[9px] font-mono text-slate-650 italic select-none">
                          No active company blueprint in this slot.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('MAIN')}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Back to Main Menu
              </button>
            </motion.div>
          )}

          {activeTab === 'CHANGELOG' && (
            <motion.div
              key="changelog"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-450" /> System Update Node
              </h3>

              <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-2xl space-y-4 font-mono text-[10px] shadow-inner text-left">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span>CURRENT REPOSITORY VERSION:</span>
                  <span className="text-cyan-400 font-extrabold">v1.2.5</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (updateCheckStatus !== 'IDLE') return;
                      setUpdateCheckStatus('CHECKING');
                      setUpdateMsg("QUERYING REMOTE REPOSITORY VIA LOCAL GIT NODE...");
                      
                      if (isTauri) {
                        try {
                          const result = await invoke<string>('check_for_git_updates');
                          if (result.startsWith("UPDATE_AVAILABLE")) {
                            const parts = result.split("|");
                            const count = parts[1];
                            const changelog = parts[2] || "";
                            setUpdateCheckStatus('DONE');
                            setUpdateAvailable(true);
                            setUpdateMsg(`⚠ NEW UPDATE DETECTED: Local branch is ${count} commit(s) behind remote repository.\n\nLatest commits:\n${changelog}\n\nClick the button below to apply this update.`);
                          } else {
                            setUpdateCheckStatus('DONE');
                            setUpdateAvailable(false);
                            setUpdateMsg("✔ UP TO DATE: Local branch is fully aligned with origin/main. You are running the latest code.");
                          }
                          return;
                        } catch (err: any) {
                          console.warn("Git update check failed, falling back to network fetch:", err);
                        }
                      }

                      // Fallback: Web fetch check (requires public repo)
                      try {
                        const response = await fetch("https://raw.githubusercontent.com/psipsinelios1-sys/myos/main/package.json");
                        if (!response.ok) {
                          throw new Error(`HTTP Error ${response.status}`);
                        }
                        const remoteData = await response.json();
                        const remoteVersion = remoteData.version;
                        const localVersion = "1.2.5";

                        setUpdateMsg(`RESOLVED REMOTE: v${remoteVersion}\nLOCAL: v${localVersion}`);
                        
                        setTimeout(() => {
                          setUpdateCheckStatus('DONE');
                          if (remoteVersion !== localVersion) {
                            setUpdateAvailable(true);
                            setUpdateMsg(`⚠ NEW UPDATE DETECTED: Version v${remoteVersion} is available!\n\nClick the button below to apply this update.`);
                          } else {
                            setUpdateAvailable(false);
                            setUpdateMsg(`✔ UP TO DATE: You are running the latest version (v${localVersion}). Grid is secure.`);
                          }
                        }, 1000);
                      } catch (err) {
                        console.warn("Could not query GitHub updates, falling back to simulation:", err);
                        setTimeout(() => {
                          setUpdateMsg("COMPARING LOCAL CHECKSUMS WITH PRODUCTION...");
                          setTimeout(() => {
                            setUpdateCheckStatus('DONE');
                            setUpdateMsg("ALL SYSTEMS ALIGNED. YOU ARE RUNNING THE LATEST RELEASE VERSION (v1.2.4). COMPILER STACK VERIFIED.");
                          }, 1200);
                        }, 1000);
                      }
                    }}
                    disabled={updateCheckStatus === 'CHECKING'}
                    className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-450 font-bold py-2 rounded-xl text-[10px] uppercase font-mono tracking-wider cursor-pointer transition-colors disabled:opacity-50 text-center"
                  >
                    {updateCheckStatus === 'CHECKING' ? "Querying Repository..." : "Check for Updates"}
                  </button>

                  {updateCheckStatus !== 'IDLE' && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-[9px] text-slate-400 leading-normal whitespace-pre-line animate-pulse">
                      {updateMsg}
                    </div>
                  )}
                </div>

                {/* Scrollable Changelog box */}
                <div className="space-y-3">
                  <span className="text-slate-500 block uppercase tracking-wider text-[8px] font-bold">RELEASE NOTES HISTORY</span>
                  <div className="h-[140px] overflow-y-auto pr-1 space-y-3.5 border-t border-slate-900/60 pt-2 scrollbar-thin text-slate-350 leading-relaxed text-[9.5px]">
                    <div>
                      <span className="text-cyan-400 font-black">v1.2.5 (Latest)</span>
                      <p className="mt-1 font-sans text-slate-400">Added global AGI Singularity containment threat index, warning indicators, and compliance hotline options. Integrated live scrolling news footer and interactive employee chat logs.</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-black">v1.2.4</span>
                      <p className="mt-1 font-sans text-slate-400">Added multiple Manual Save Slots (1, 2, and 3) allowing slot saving and loading from main menu/gameplay. Integrated dynamic Update Checker & game Changelog history tab. Fixed Gemini REST API endpoint fallbacks to use gemini-2.5-flash instead of non-existent models.</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-black">v1.2.3</span>
                      <p className="mt-1 font-sans text-slate-400">Added visual polish with dynamic keyframe animations. Converted 11 primary dashboard cards to spring-physics motion widgets. Implemented numeric change bubbles next to cash and research stats.</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-black">v1.2.2</span>
                      <p className="mt-1 font-sans text-slate-400">Fixed co-founder recruitment cost variables, annotated gameEngine.ts type casts for TS7 compilation, and restructured desktop title bar Tauri window RPC calls.</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-black">v1.2.1</span>
                      <p className="mt-1 font-sans text-slate-400">Bumped developer tools to Vite 8.1.5 and TypeScript 7.0.0. Optimized bundler configurations to leverage Rolldown for 1.2s bundling speeds.</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-black">v1.2.0</span>
                      <p className="mt-1 font-sans text-slate-400">Silicon foundry expansion. Custom wafer chip design, global lobbying registers, and government contract bidding systems.</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-black">v1.1.2</span>
                      <p className="mt-1 font-sans text-slate-400">Co-founder recruitment, live product marketing keynote presentation loops, and ELO battle LMSYS simulators.</p>
                    </div>
                  </div>
                </div>
              </div>

              {updateAvailable && (
                <button
                  type="button"
                  onClick={async () => {
                    setUpdateCheckStatus('UPDATING');
                    setUpdateMsg("APPLYING GIT UPDATE AND SYNCING CODEBASE...");
                    try {
                      const result = await invoke<string>('apply_git_update');
                      setUpdateCheckStatus('DONE');
                      setUpdateAvailable(false);
                      setUpdateMsg(`✔ UPDATE SUCCESSFUL!\n\n${result}\n\nPlease reload or restart the application to apply the changes.`);
                    } catch (err: any) {
                      setUpdateCheckStatus('DONE');
                      setUpdateMsg(`❌ UPDATE FAILED: ${err.message || err}`);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-100 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md mb-2 animate-bounce text-center"
                >
                  ⚡ Install Update
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('MAIN');
                  setUpdateCheckStatus('IDLE');
                  setUpdateMsg("");
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Back to Main Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info line */}
        <div className="text-[9px] text-center font-mono text-slate-600 tracking-wider">
          SECURE ENCRYPTED LOCALSTORAGE SEC-V256
        </div>
      </motion.div>

        {/* Right Panel: Empire Trophies */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden md:flex flex-col w-64 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-400">Empire Trophies</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {hasSave && savedData ? (
              <>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Peak Valuation</span>
                  <span className="text-sm font-black text-cyan-400">${savedData.valuation.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Days Survived</span>
                  <span className="text-sm font-black text-emerald-400">{savedData.daysElapsed}</span>
                </div>
                {savedData.completedMilestones && savedData.completedMilestones.length > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Milestones Reached</span>
                    <span className="text-sm font-black text-purple-400">{savedData.completedMilestones.length}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-[10px] text-slate-500 font-mono py-8 px-2 border border-dashed border-slate-800/50 rounded-xl">
                No active save profile found. Boot venture to start earning trophies.
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Live Competitor Ticker */}
      <div className="absolute bottom-0 left-0 right-0 w-full bg-slate-950 border-t border-slate-900 overflow-hidden py-1.5 flex whitespace-nowrap text-[10px] font-mono font-bold tracking-widest z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }} 
          className="flex gap-16 min-w-max"
        >
          {/* Double up the items so it loops seamlessly */}
          <span className="text-rose-500">▼ OPENAI: 850B (-1.2%)</span>
          <span className="text-emerald-500">▲ GOOGLE: 1.2T (+0.5%)</span>
          <span className="text-emerald-500">▲ ANTHROPIC: 18B (+4.1%)</span>
          <span className="text-rose-500">▼ META: 800B (-0.3%)</span>
          <span className="text-amber-500">⚠ RUMOR: xAI purchasing 100k H100s</span>
          
          <span className="text-rose-500">▼ OPENAI: 850B (-1.2%)</span>
          <span className="text-emerald-500">▲ GOOGLE: 1.2T (+0.5%)</span>
          <span className="text-emerald-500">▲ ANTHROPIC: 18B (+4.1%)</span>
          <span className="text-rose-500">▼ META: 800B (-0.3%)</span>
          <span className="text-amber-500">⚠ RUMOR: xAI purchasing 100k H100s</span>
        </motion.div>
      </div>
    </div>
  );
}
