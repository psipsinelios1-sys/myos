import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Landmark, Zap, Shield, Globe, Award, Database, Cpu, Lightbulb, User, ChevronRight, HelpCircle, Palette, Crosshair, Users, Target, Rocket } from 'lucide-react';
import { Founder, HQLocation, CorporateCulture, GameState, FounderBackground, HQLocationType, CorporateCultureType, FundingStage, StartingOrigin, BrandThemeColor, BusinessStrategy, CeoAvatar, CoreTechFocus } from '../types';
import { LOCATIONS, CULTURES } from '../data';

interface OnboardingProps {
  activeOrigin?: StartingOrigin;
  onComplete: (setup: Partial<GameState>) => void;
}

export default function GameOnboarding({ activeOrigin, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [founderName, setFounderName] = useState('Alexis Mercer');
  const [founderAge, setFounderAge] = useState<number | ''>(25);
  const [nationality, setNationality] = useState('United States');
  const [background, setBackground] = useState<FounderBackground>('STANFORD_DROPOUT');

  const [companyName, setCompanyName] = useState('Apex Technologies');
  const [themeColor, setThemeColor] = useState<BrandThemeColor>('CYAN');
  const [ceoAvatar, setCeoAvatar] = useState<CeoAvatar>('VISIONARY');

  const [locationType, setLocationType] = useState<HQLocationType>('SILICON_VALLEY');
  const [cultureType, setCultureType] = useState<CorporateCultureType>('MOVE_FAST_BREAK_THINGS');

  const [fundingOption, setFundingOption] = useState<'BOOTSTRAPPED' | 'ANGEL' | 'VC'>('BOOTSTRAPPED');
  
  const [businessStrategy, setBusinessStrategy] = useState<BusinessStrategy>('ENTERPRISE');
  const [nemesisId, setNemesisId] = useState('openai');

  const [coFounder, setCoFounder] = useState<'RESEARCHER' | 'PR_ROCKSTAR' | 'HARDWARE_GURU'>('RESEARCHER');
  const [coreTechFocus, setCoreTechFocus] = useState<CoreTechFocus>('MOE');
  const [difficulty, setDifficulty] = useState<'NORMAL' | 'HARD' | 'EXPERT'>('NORMAL');

  const getStatsForBackground = (bg: FounderBackground) => {
    switch (bg) {
      case 'STANFORD_DROPOUT':
        return { technical: 90, charisma: 75, strategy: 65, agility: 85, desc: 'Perks: +10% Model Training Speed, -15% Employee Salary demands.' };
      case 'EX_DEEPMIND_FELLOW':
        return { technical: 95, charisma: 50, strategy: 80, agility: 60, desc: 'Perks: Starts with 30 R&D Research Points. +12% foundation Model Quality.' };
      case 'WALL_STREET_ROGUE':
        return { technical: 30, charisma: 90, strategy: 85, agility: 80, desc: 'Perks: Starts with +$1.5M funding. +15% VC Pitch success.' };
      case 'SELF_TAUGHT_PRODIGY':
        return { technical: 85, charisma: 60, strategy: 70, agility: 95, desc: 'Perks: +20% Synthetic data accuracy. -20% server cooling outage risk.' };
    }
  };

  const isNormalStartup = activeOrigin === 'NORMAL_STARTUP';
  const totalSteps = 5;

  const handleNext = () => {
    if (step === 1) {
      if (!founderName.trim() || !companyName.trim()) {
        alert("Names cannot be empty.");
        return;
      }
      const ageNum = Number(founderAge);
      if (founderAge === '' || isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
        alert("Founder age must be between 18 and 70.");
        return;
      }
    }
    
    if (step === 2 && !isNormalStartup) {
      setStep(4);
    } else if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const stats = getStatsForBackground(background);
      const selectedLocation = LOCATIONS.find((l) => l.type === locationType) || LOCATIONS[0];
      const selectedCulture = CULTURES.find((c) => c.type === cultureType) || CULTURES[0];

      let setup: Partial<GameState> = {
        onboardingCompleted: true,
        companyName,
        brandThemeColor: themeColor,
        ceoAvatar,
        founder: {
          name: founderName,
          age: Number(founderAge) || 25,
          nationality,
          background,
          ...stats,
        },
        hqLocation: selectedLocation,
        culture: selectedCulture,
        businessStrategy,
        nemesisId,
        coreTechFocus,
        difficultyLevel: difficulty,
      };

      if (isNormalStartup) {
        let initialCash = 200000;
        let initialEquity = 100;
        let stage: FundingStage = 'BOOTSTRAPPED';
        let valuation = 1000000;

        if (fundingOption === 'ANGEL') {
          initialCash = 750000;
          initialEquity = 85;
          stage = 'SEED';
          valuation = 5000000;
        } else if (fundingOption === 'VC') {
          initialCash = 2500000;
          initialEquity = 65;
          stage = 'SERIES_A';
          valuation = 9000000;
        }

        if (background === 'WALL_STREET_ROGUE') {
          initialCash += 1500000;
          valuation += 2000000;
        }
        if (difficulty === 'HARD') initialCash = Math.round(initialCash * 0.8);
        if (difficulty === 'EXPERT') initialCash = Math.round(initialCash * 0.6);

        setup.cash = initialCash;
        setup.equityPercent = initialEquity;
        setup.valuation = valuation;
        setup.fundingStage = stage;
      }

      let startRP = background === 'EX_DEEPMIND_FELLOW' ? 40 : 15;
      if (difficulty === 'HARD') startRP = Math.round(startRP * 0.8);
      if (difficulty === 'EXPERT') startRP = Math.round(startRP * 0.6);
      
      setup.researchPoints = startRP;
      setup.globalPublicSentiment = difficulty === 'EXPERT' ? 45 : difficulty === 'HARD' ? 52 : 60;
      setup.hypeLevel = difficulty === 'EXPERT' ? 15 : difficulty === 'HARD' ? 20 : 25;
      
      onComplete({
        ...setup,
        ...({ initialCoFounder: coFounder } as any)
      });
    }
  };

  const handleBack = () => {
    if (step === 4 && !isNormalStartup) {
      setStep(2);
    } else {
      setStep(step - 1);
    }
  };

  const currentThemeHex = themeColor === 'CYAN' ? 'text-cyan-400' : themeColor === 'EMERALD' ? 'text-emerald-400' : themeColor === 'ROSE' ? 'text-rose-400' : 'text-purple-400';
  const currentThemeBorder = themeColor === 'CYAN' ? 'border-cyan-500' : themeColor === 'EMERALD' ? 'border-emerald-500' : themeColor === 'ROSE' ? 'border-rose-500' : 'border-purple-500';

  return (
    <div id="onboarding_viewport" className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 md:p-8 font-sans selection:bg-${themeColor.toLowerCase()}-500 selection:text-slate-900`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-xl p-5 md:py-6 md:px-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-tr from-${themeColor.toLowerCase()}-600 to-slate-800 rounded-xl shadow-lg`}>
              <Cpu className="h-5.5 w-5.5 text-slate-100 stroke-[2.5]" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight bg-gradient-to-r ${currentThemeHex} to-slate-300 text-transparent bg-clip-text`}>
                Venture Initialization Protocol
              </h1>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Architecting The Future</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const s = i + 1;
              if (s === 3 && !isNormalStartup) return null; // hide step 3 dot if skipping
              return (
                <div
                  key={s}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    s === step ? `w-8 bg-${themeColor.toLowerCase()}-500` : s < step ? 'w-2.5 bg-slate-600' : 'w-2.5 bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: BRANDING & AESTHETICS */}
          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Palette className={`h-5 w-5 ${currentThemeHex}`} /> Step 1: Branding & Identity
                </h2>
                <p className="text-slate-400 text-sm">Define your corporation and your personal executive persona.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Company Name</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </div>
                  <div>
                    <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Founder Name</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none" value={founderName} onChange={e => setFounderName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Age</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none" value={founderAge} onChange={e => setFounderAge(e.target.value ? parseInt(e.target.value) : '')} />
                    </div>
                    <div>
                      <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Nationality</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none" value={nationality} onChange={e => setNationality(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Brand Color Theme</label>
                    <div className="flex gap-3">
                      {(['CYAN', 'EMERALD', 'ROSE', 'PURPLE'] as BrandThemeColor[]).map(c => (
                        <button key={c} onClick={() => setThemeColor(c)} className={`w-10 h-10 rounded-full border-2 transition-all ${themeColor === c ? 'border-slate-100 scale-110 shadow-lg' : 'border-slate-800'} ${c === 'CYAN' ? 'bg-cyan-500' : c === 'EMERALD' ? 'bg-emerald-500' : c === 'ROSE' ? 'bg-rose-500' : 'bg-purple-500'}`} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Executive Avatar</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['HACKER', 'SUIT', 'VISIONARY', 'CYBORG'] as CeoAvatar[]).map(a => (
                        <button key={a} onClick={() => setCeoAvatar(a)} className={`p-3 flex items-center justify-center rounded-xl border ${ceoAvatar === a ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                          {a === 'HACKER' && <Zap className="h-5 w-5" />}
                          {a === 'SUIT' && <User className="h-5 w-5" />}
                          {a === 'VISIONARY' && <Lightbulb className="h-5 w-5" />}
                          {a === 'CYBORG' && <Cpu className="h-5 w-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                     <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Founder Background</label>
                     <select value={background} onChange={e => setBackground(e.target.value as FounderBackground)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-100 text-sm font-semibold">
                       <option value="STANFORD_DROPOUT">Stanford Dropout (Tech + Agility)</option>
                       <option value="EX_DEEPMIND_FELLOW">Ex-DeepMind Fellow (Max Tech + R&D)</option>
                       <option value="WALL_STREET_ROGUE">Wall Street Rogue (Charisma + Strategy)</option>
                       <option value="SELF_TAUGHT_PRODIGY">Self-Taught Prodigy (Agility + Data)</option>
                     </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CULTURE & HQ */}
          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Globe className={`h-5 w-5 ${currentThemeHex}`} /> Step 2: Global HQ & Culture
                </h2>
                <p className="text-slate-400 text-sm">Where you incorporate and how you run the team dictates talent and hardware costs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-xs font-mono uppercase tracking-wider mb-3 ${currentThemeHex}`}>HQ Location</h3>
                  <div className="space-y-2">
                    {LOCATIONS.map(loc => (
                      <button key={loc.type} onClick={() => setLocationType(loc.type as HQLocationType)} className={`w-full text-left p-3 rounded-xl border transition-all ${locationType === loc.type ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                        <span className="font-bold block text-slate-200">{loc.name}</span>
                        <span className="text-slate-400 text-xs">{loc.bonusText}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-xs font-mono uppercase tracking-wider mb-3 ${currentThemeHex}`}>Corporate Culture</h3>
                  <div className="space-y-2">
                    {CULTURES.map(cult => (
                      <button key={cult.type} onClick={() => setCultureType(cult.type as CorporateCultureType)} className={`w-full text-left p-3 rounded-xl border transition-all ${cultureType === cult.type ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                        <span className="font-bold block text-slate-200">{cult.name}</span>
                        <span className="text-slate-400 text-xs">{cult.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SEED FUNDING (ONLY NORMAL STARTUP) */}
          {step === 3 && isNormalStartup && (
            <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Landmark className={`h-5 w-5 ${currentThemeHex}`} /> Step 3: Seed Capital
                </h2>
                <p className="text-slate-400 text-sm">Since you chose the Normal Startup origin, you must raise your initial capital.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setFundingOption('BOOTSTRAPPED')} className={`p-4 rounded-xl border flex flex-col items-center text-center ${fundingOption === 'BOOTSTRAPPED' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                  <span className="font-bold mb-2">100% Bootstrap</span>
                  <span className="text-2xl font-black text-cyan-400 mb-2">$200K</span>
                  <span className="text-xs text-slate-400">100% Equity, absolute control.</span>
                </button>
                <button onClick={() => setFundingOption('ANGEL')} className={`p-4 rounded-xl border flex flex-col items-center text-center ${fundingOption === 'ANGEL' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                  <span className="font-bold mb-2">Angel Syndicate</span>
                  <span className="text-2xl font-black text-emerald-400 mb-2">$750K</span>
                  <span className="text-xs text-slate-400">85% Equity, good connections.</span>
                </button>
                <button onClick={() => setFundingOption('VC')} className={`p-4 rounded-xl border flex flex-col items-center text-center ${fundingOption === 'VC' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                  <span className="font-bold mb-2">VC Mega Round</span>
                  <span className="text-2xl font-black text-rose-400 mb-2">$2.5M</span>
                  <span className="text-xs text-slate-400">65% Equity, massive resources.</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: STRATEGY & NEMESIS */}
          {step === 4 && (
            <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Target className={`h-5 w-5 ${currentThemeHex}`} /> Step 4: Strategy & Rivalry
                </h2>
                <p className="text-slate-400 text-sm">Define your market attack vector and declare your sworn nemesis.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-xs font-mono uppercase tracking-wider mb-3 ${currentThemeHex}`}>Business Strategy</h3>
                  <div className="space-y-3">
                    <button onClick={() => setBusinessStrategy('ENTERPRISE')} className={`w-full text-left p-3 rounded-xl border ${businessStrategy === 'ENTERPRISE' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                      <span className="font-bold block">🏢 Enterprise SaaS</span>
                      <span className="text-xs text-slate-400">+20% B2B contract success. Low hype.</span>
                    </button>
                    <button onClick={() => setBusinessStrategy('CONSUMER')} className={`w-full text-left p-3 rounded-xl border ${businessStrategy === 'CONSUMER' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                      <span className="font-bold block">📱 Consumer Hype App</span>
                      <span className="text-xs text-slate-400">Massive follower growth. Lower API revenue.</span>
                    </button>
                    <button onClick={() => setBusinessStrategy('OPEN_SOURCE')} className={`w-full text-left p-3 rounded-xl border ${businessStrategy === 'OPEN_SOURCE' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                      <span className="font-bold block">🌍 Open Source Foundation</span>
                      <span className="text-xs text-slate-400">Max sentiment. Cheap talent. Free models.</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`text-xs font-mono uppercase tracking-wider mb-3 ${currentThemeHex}`}>Declare Nemesis</h3>
                  <p className="text-[10px] text-slate-500 mb-3">Your chosen rival starts with a major compute advantage and will relentlessly cyber-attack your servers.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['openai', 'anthropic', 'google', 'meta']).map(rival => (
                      <button key={rival} onClick={() => setNemesisId(rival)} className={`p-3 text-center rounded-xl border font-bold uppercase tracking-wider text-xs ${nemesisId === rival ? 'bg-rose-950/40 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                        {rival}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: TEAM & TECH */}
          {step === 5 && (
            <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Rocket className={`h-5 w-5 ${currentThemeHex}`} /> Step 5: Core Team & Tech
                </h2>
                <p className="text-slate-400 text-sm">Finalize your starting advantages and simulation intensity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-xs font-mono uppercase tracking-wider mb-3 ${currentThemeHex}`}>Recruit First Co-Founder</h3>
                  <div className="space-y-2">
                    <button onClick={() => setCoFounder('RESEARCHER')} className={`w-full text-left p-3 rounded-xl border ${coFounder === 'RESEARCHER' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                      <span className="font-bold text-sm block">Lead AI Researcher</span>
                      <span className="text-xs text-slate-400">Starts with 95 Intelligence. Speeds up R&D drastically.</span>
                    </button>
                    <button onClick={() => setCoFounder('PR_ROCKSTAR')} className={`w-full text-left p-3 rounded-xl border ${coFounder === 'PR_ROCKSTAR' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                      <span className="font-bold text-sm block">PR / Legal Rockstar</span>
                      <span className="text-xs text-slate-400">Mitigates crises and boosts product launch hype.</span>
                    </button>
                    <button onClick={() => setCoFounder('HARDWARE_GURU')} className={`w-full text-left p-3 rounded-xl border ${coFounder === 'HARDWARE_GURU' ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800'}`}>
                      <span className="font-bold text-sm block">Hardware Operations Guru</span>
                      <span className="text-xs text-slate-400">Reduces GPU degradation and power costs globally.</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className={`text-xs font-mono uppercase tracking-wider mb-3 ${currentThemeHex}`}>Core Tech Focus</h3>
                    <select value={coreTechFocus} onChange={e => setCoreTechFocus(e.target.value as CoreTechFocus)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-3 text-sm font-bold text-slate-200">
                      <option value="MOE">Mixture of Experts (Training Efficiency)</option>
                      <option value="FP8">FP8 Precision (Hardware Efficiency)</option>
                      <option value="LIQUID_COOLING">Liquid Cooling Rigs (Thermal Control)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-2">This tech branch is instantly unlocked at day 1.</p>
                  </div>

                  <div>
                    <h3 className={`text-xs font-mono uppercase tracking-wider mb-2 ${currentThemeHex}`}>Difficulty</h3>
                    <div className="flex gap-2">
                      {(['NORMAL', 'HARD', 'EXPERT'] as const).map(d => (
                        <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${difficulty === d ? `bg-slate-800 ${currentThemeBorder}` : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
          <div>
            {step > 1 && (
              <button onClick={handleBack} className="px-5 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
                Back
              </button>
            )}
          </div>
          <button onClick={handleNext} className={`px-6 py-2.5 bg-gradient-to-r from-${themeColor.toLowerCase()}-500 to-slate-700 hover:opacity-90 rounded-lg text-slate-50 font-bold text-sm flex items-center gap-2 shadow-lg transition-all`}>
            {step === totalSteps ? 'Deploy Silicon Empire' : 'Continue'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
