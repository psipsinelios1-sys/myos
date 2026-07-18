import { HQLocation, CorporateCulture, GPUHardware, Competitor, Staff } from './types';

export const LOCATIONS: HQLocation[] = [
  {
    type: 'SILICON_VALLEY',
    name: 'Silicon Valley (San Francisco, USA)',
    talentPool: 1.0,
    taxRate: 0.15,
    electricityCost: 0.18,
    monthlyRent: 35000,
    bonusText: 'Epicenter of AI. Research scientists gain +15% productivity multiplier. Higher premium talent availability.',
  },
  {
    type: 'LONDON',
    name: 'London (United Kingdom)',
    talentPool: 0.9,
    taxRate: 0.20,
    electricityCost: 0.15,
    monthlyRent: 24000,
    bonusText: 'Global Safety Capital. Web scraping data legal liabilities reduced by 30%. PR specialists are 20% cheaper.',
  },
  {
    type: 'TOKYO',
    name: 'Tokyo (Japan)',
    talentPool: 0.8,
    taxRate: 0.25,
    electricityCost: 0.14,
    monthlyRent: 19000,
    bonusText: 'Robotics Frontier. Multimodal Robotics specialization models receive an immediate +12 benchmark quality boost.',
  },
  {
    type: 'PARIS',
    name: 'Paris (France)',
    talentPool: 0.88,
    taxRate: 0.30,
    electricityCost: 0.11,
    monthlyRent: 16000,
    bonusText: 'Nuclear Energy Haven. Electricity costs are significantly cheaper; compute clusters produce 20% less overheating.',
  },
  {
    type: 'SHENZHEN',
    name: 'Shenzhen (China)',
    talentPool: 0.85,
    taxRate: 0.12,
    electricityCost: 0.08,
    monthlyRent: 12000,
    bonusText: 'Supply Chain Capital. All graphics processing units and server upgrades are 20% cheaper to purchase.',
  }
];

export const CULTURES: CorporateCulture[] = [
  {
    type: 'MOVE_FAST_BREAK_THINGS',
    name: 'Move Fast & Break Things',
    description: 'Throw safety out the window. Train models 20% faster, but experience twice as many copyright lawsuits / PR crises.',
    trainingBonus: 1.2,
    legalRiskMultiplier: 2.0,
    adoptionBonus: 1.0,
    safetyRatingBonus: -15,
  },
  {
    type: 'SAFETY_ALIGNMENT',
    name: 'Safety & Alignment First',
    description: 'Ensure deep alignment and rigorous red-teaming. Model training is 10% slower, but reduces legal copyright fines and safety crises by 75%. All Enterprise pricing conversion is increased by 20%.',
    trainingBonus: 0.9,
    legalRiskMultiplier: 0.25,
    adoptionBonus: 0.9,
    safetyRatingBonus: 20,
  },
  {
    type: 'OPEN_SOURCE_EVANGELIST',
    name: 'Open Source Evangelism',
    description: 'For the betterment of humanity. Deployed open-source weights grant 2.5x growth in developer adoption, +30 public sentiment boost, but closed API/license revenue models are reduced by 30%.',
    trainingBonus: 1.05,
    legalRiskMultiplier: 1.1,
    adoptionBonus: 2.5,
    safetyRatingBonus: 5,
  }
];

export const GPUMARKETPLACE: GPUHardware[] = [
  {
    id: 'h100',
    name: 'NVIDIA H100 (Hopper)',
    generation: 'Hopper Architecture',
    cost: 30000,
    tflops: 700,
    powerUsageKW: 0.7,
    heatOutputFactor: 1.0,
    coolingCostMultiplier: 1.0,
    unlockedAtStage: 'BOOTSTRAPPED',
    iconName: 'Cpu',
  },
  {
    id: 'h200',
    name: 'NVIDIA H200 (Hopper Ultra)',
    generation: 'Hopper Ultra Architecture',
    cost: 40000,
    tflops: 1000,
    powerUsageKW: 0.8,
    heatOutputFactor: 1.1,
    coolingCostMultiplier: 1.1,
    unlockedAtStage: 'SEED',
    iconName: 'Zap',
  },
  {
    id: 'b200',
    name: 'NVIDIA B200 (Blackwell)',
    generation: 'Blackwell Architecture',
    cost: 60000,
    tflops: 2200,
    powerUsageKW: 1.2,
    heatOutputFactor: 1.3,
    coolingCostMultiplier: 1.4,
    unlockedAtStage: 'SERIES_A',
    iconName: 'Flame',
  },
  {
    id: 'blackwell_ultra',
    name: 'Blackwell Ultra v2',
    generation: 'Blackwell Extended',
    cost: 75000,
    tflops: 2800,
    powerUsageKW: 1.3,
    heatOutputFactor: 1.4,
    coolingCostMultiplier: 1.5,
    unlockedAtStage: 'SERIES_B',
    iconName: 'Server',
  },
  {
    id: 'google_tpu_v6',
    name: 'Google TPU v6 (Trillium)',
    generation: 'TPU Custom Silicon',
    cost: 45000,
    tflops: 1800,
    powerUsageKW: 0.9,
    heatOutputFactor: 1.15,
    coolingCostMultiplier: 1.2,
    unlockedAtStage: 'SERIES_B',
    iconName: 'Workflow',
  },
  {
    id: 'rubin',
    name: 'NVIDIA Rubin R100',
    generation: 'Rubin Next-Gen',
    cost: 110000,
    tflops: 5400,
    powerUsageKW: 1.6,
    heatOutputFactor: 1.6,
    coolingCostMultiplier: 1.8,
    unlockedAtStage: 'SERIES_C',
    iconName: 'ShieldAlert',
  },
];

export const HANDCRAFTED_COMPETITORS: Competitor[] = [
  {
    id: 'openai',
    name: 'OpenAI Corporation',
    marketShare: 18.0,
    leadModelName: 'GPT-4.5 Ultra',
    leadModelScore: 74.5,
    isAIStudioUser: false,
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    marketShare: 16.0,
    leadModelName: 'Gemini 3.0 Pro',
    leadModelScore: 73.8,
    isAIStudioUser: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic AI',
    marketShare: 14.0,
    leadModelName: 'Claude 3.5 Sonnet',
    leadModelScore: 74.2,
    isAIStudioUser: false,
  },
  {
    id: 'meta',
    name: 'Meta AI Open',
    marketShare: 10.0,
    leadModelName: 'Llama 4.0 405B',
    leadModelScore: 71.0,
    isAIStudioUser: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Labs',
    marketShare: 8.0,
    leadModelName: 'DeepSeek-V2.5',
    leadModelScore: 68.5,
    isAIStudioUser: false,
  },
  {
    id: 'xai',
    name: 'xAI Alliance',
    marketShare: 5.0,
    leadModelName: 'Grok 2.0 Super',
    leadModelScore: 69.1,
    isAIStudioUser: false,
  },
  {
    id: 'mistral',
    name: 'Mistral AI France',
    marketShare: 5.0,
    leadModelName: 'Mistral Large 2.5',
    leadModelScore: 67.2,
    isAIStudioUser: false,
  },
  {
    id: 'cohere',
    name: 'Cohere AI',
    marketShare: 4.0,
    leadModelName: 'Command R+ V2',
    leadModelScore: 66.4,
    isAIStudioUser: false,
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen',
    marketShare: 4.0,
    leadModelName: 'Qwen 2.5 72B',
    leadModelScore: 69.4,
    isAIStudioUser: false,
  },
  {
    id: 'apple',
    name: 'Apple Intelligence',
    marketShare: 3.0,
    leadModelName: 'Apple AFM Sovereign',
    leadModelScore: 63.5,
    isAIStudioUser: false,
  },
  {
    id: 'microsoft',
    name: 'Microsoft Research',
    marketShare: 3.0,
    leadModelName: 'Phi-4.5 Large',
    leadModelScore: 65.8,
    isAIStudioUser: false,
  },
  {
    id: 'amazon',
    name: 'Amazon AGI',
    marketShare: 2.0,
    leadModelName: 'Olympus Frontier',
    leadModelScore: 67.6,
    isAIStudioUser: false,
  },
  {
    id: 'hunyuan',
    name: 'Tencent Hunyuan',
    marketShare: 1.5,
    leadModelName: 'Hunyuan-Pro 100B',
    leadModelScore: 63.2,
    isAIStudioUser: false,
  },
  {
    id: 'ernie',
    name: 'Baidu Ernie',
    marketShare: 1.5,
    leadModelName: 'Ernie 4.5 Turbo',
    leadModelScore: 61.9,
    isAIStudioUser: false,
  },
  {
    id: 'yi',
    name: '01.AI',
    marketShare: 1.0,
    leadModelName: 'Yi-Sovereign 34B',
    leadModelScore: 64.0,
    isAIStudioUser: false,
  },
  {
    id: 'falcon',
    name: 'Falcon AI TII',
    marketShare: 1.0,
    leadModelName: 'Falcon 2 110B',
    leadModelScore: 64.8,
    isAIStudioUser: false,
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    marketShare: 0.8,
    leadModelName: 'Jamba 1.5 Large',
    leadModelScore: 65.1,
    isAIStudioUser: false,
  },
  {
    id: 'reka',
    name: 'Reka AI',
    marketShare: 0.6,
    leadModelName: 'Reka Flash 2',
    leadModelScore: 60.5,
    isAIStudioUser: false,
  },
  {
    id: 'adept',
    name: 'Adept AI',
    marketShare: 0.5,
    leadModelName: 'Fuyu Act-3',
    leadModelScore: 57.4,
    isAIStudioUser: false,
  },
  {
    id: 'ibm',
    name: 'IBM Granite',
    marketShare: 0.5,
    leadModelName: 'Granite 3.0 Ultra',
    leadModelScore: 61.2,
    isAIStudioUser: false,
  },
  {
    id: 'stability',
    name: 'Stability AI',
    marketShare: 0.4,
    leadModelName: 'StableLM 3 Frontier',
    leadModelScore: 59.8,
    isAIStudioUser: false,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Community',
    marketShare: 0.2,
    leadModelName: 'HuggingHermes Llama',
    leadModelScore: 58.5,
    isAIStudioUser: false,
  },
];

const EXTRA_COMPANY_PREFIXES = [
  'Satori', 'Helix', 'Quant', 'Tensor', 'Omni', 'Voxel', 'Neuro', 'Cogni', 'Aether', 'Axiom',
  'Synapse', 'Cortex', 'Chronos', 'Aero', 'Vector', 'Nexus', 'Vertex', 'Singularity', 'Deep', 'Hyper',
  'Neo', 'Astra', 'Nova', 'Cyber', 'Krypton', 'Prism', 'Elysium', 'Apex', 'Infini', 'Mind',
  'Logic', 'Zenith', 'Primal', 'Neural', 'Kinetix', 'Pinnacle', 'Enigma', 'Vortex', 'Pulse', 'Specter',
  'Oracle', 'Solaria', 'Lyra', 'Pharos', 'Vesper', 'Cipher', 'Catalyst', 'Entropy', 'Equinox', 'Ignis'
];

const EXTRA_COMPANY_SUFFIXES = [
  'Labs', 'AI', 'Technologies', 'Research', 'Cognition', 'Neural', 'Systems', 'Computing',
  'Networks', 'Sovereign', 'Intelligence', 'Dynamics', 'Cybernetics', 'AGI', 'Core', 'Institute'
];

const EXTRA_MODEL_NAMES = [
  'Scribe', 'Reason', 'Hermes', 'Odyssey', 'Aegis', 'Phronesis', 'Pallas', 'Chronos', 'Socrates', 'Kepler',
  'Newton', 'Galileo', 'Curie', 'Einstein', 'Vinci', 'Tesla', 'Lovelace', 'Turing', 'Babbage', 'Hopper',
  'Shannon', 'Noether', 'Feynman', 'Maxwell', 'Boltzmann', 'Planck', 'Dirac', 'Heisenberg', 'Schrodinger', 'Bohr',
  'Fermi', 'Oppenheimer', 'Sagan', 'Hawking', 'Penrose', 'Thorne', 'Gell-Mann', 'Hubble', 'Copernicus', 'Brahe'
];

const EXTRA_MODEL_SUFFIXES = [
  '1.0', '1.5', '2.0', '3.0', 'v4', 'v5', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon',
  'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron',
  'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'Pro',
  'Max', 'Ultra', 'Sovereign', 'Frontier', 'Omni', 'Mini', 'Nano', 'Micro', 'Lite', 'Flash',
  'Express', 'Turbo', 'Elite', 'Prime', 'Supreme', 'Absolute', 'Ultimate'
];

const EXTRA_SIZES = [
  '7B', '8B', '13B', '14B', '32B', '34B', '70B', '72B', '110B', '135B', '405B', '1.3T', '1.5T', '2T', '3.8B'
];

export function generateAllCompetitors(): Competitor[] {
  const generated: Competitor[] = [];
  const seenNames = new Set<string>();
  
  // Handcrafted total share is 95.0%, so we have 5% left for the other 210.
  // We will generate 210 extra competitors.
  for (let i = 0; i < 210; i++) {
    let companyName = "";
    let attempts = 0;
    while (attempts < 100) {
      const pref = EXTRA_COMPANY_PREFIXES[Math.floor(Math.random() * EXTRA_COMPANY_PREFIXES.length)];
      const suff = EXTRA_COMPANY_SUFFIXES[Math.floor(Math.random() * EXTRA_COMPANY_SUFFIXES.length)];
      companyName = `${pref} ${suff}`;
      if (!seenNames.has(companyName)) {
        seenNames.add(companyName);
        break;
      }
      attempts++;
    }
    if (!companyName) {
      companyName = `Stealth AI Lab #${i}`;
    }
    
    const mName = EXTRA_MODEL_NAMES[Math.floor(Math.random() * EXTRA_MODEL_NAMES.length)];
    const mSuff = EXTRA_MODEL_SUFFIXES[Math.floor(Math.random() * EXTRA_MODEL_SUFFIXES.length)];
    const mSize = EXTRA_SIZES[Math.floor(Math.random() * EXTRA_SIZES.length)];
    const modelName = `${mName} ${mSuff} (${mSize})`;
    
    // Scores from 15.0 to 72.0
    const leadModelScore = parseFloat((15.0 + Math.random() * 57.0).toFixed(1));
    const marketShare = parseFloat((0.005 + Math.random() * 0.02).toFixed(3));
    
    generated.push({
      id: `generated_comp_${i}`,
      name: companyName,
      marketShare,
      leadModelName: modelName,
      leadModelScore,
      isAIStudioUser: false,
      computePower: Math.round(50 + Math.random() * 500),
      activeTraining: null,
      isPanicking: false
    });
  }
  
  const allComps = [...HANDCRAFTED_COMPETITORS, ...generated];
  
  return allComps.map((comp) => {
    let baseCompute = Math.round(comp.marketShare * 200 + 50);
    if (comp.id === 'openai') baseCompute = 4500;
    else if (comp.id === 'google') baseCompute = 4200;
    else if (comp.id === 'anthropic') baseCompute = 3800;
    else if (comp.id === 'meta') baseCompute = 3000;
    else if (comp.id === 'deepseek') baseCompute = 2500;
    else if (comp.id === 'xai') baseCompute = 1800;
    else if (comp.id === 'qwen') baseCompute = 1500;

    return {
      ...comp,
      computePower: baseCompute,
      activeTraining: null,
      isPanicking: false
    };
  });
}

export const INITIAL_COMPETITORS: Competitor[] = generateAllCompetitors();

const FIRST_NAMES = [
  'Aria', 'Siddharth', 'Elena', 'Guillaume', 'Hana', 'Dante', 'Sora', 'Mei', 'Yuri', 'Marcus',
  'Leila', 'Sam', 'Demis', 'Ilya', 'Amodei', 'Yann', 'Altman', 'Jensen', 'Andrej', 'Sutskever',
  'Devika', 'Vikram', 'Chloe', 'Zachary', 'Nils', 'Fatima', 'Dmitry', 'Mateo', 'Alexandre', 'Nico'
];

const LAST_NAMES = [
  'Chen', 'Patel', 'Leclerc', 'Gomez', 'Sato', 'Ivanov', 'Hwang', 'Haddad', 'Nielsen', 'Morissey',
  'Venkatesh', 'Karpathy', 'LeCun', 'Hassabis', 'Brockman', 'Amodei', 'Huang', 'Wojciechowski', 'Xiong',
  'Devi', 'Ostergard', 'Novak', 'Silva', 'Müller', 'Kim', 'Tanaka', 'Zhao', 'Dubois', 'Wright', 'O\'Connor'
];

export const STAFF_PERKS_POOL = [
  { type: 'GPU_WHISPERER' as const, name: 'GPU Whisperer', description: 'Reduces server power bills and cooling overhead by 15%.' },
  { type: 'SYNTHESIZER' as const, name: 'Synth Guru', description: 'Boosts pre-training progress speed by 10%.' },
  { type: 'SAFETY_ZEALOT' as const, name: 'Safety Sentinel', description: 'Enhances alignment patch efficacy by +20%.' },
  { type: 'HYPE_MONSTER' as const, name: 'PR Evangelist', description: 'Increases marketing and hype generation impact by +25%.' },
  { type: 'BURNOUT_PRONE' as const, name: 'High-Stress Genius', description: 'Has +15 higher skill rating, but morale decays 50% faster.' },
  { type: 'ALGORITHMIC_GENIUS' as const, name: 'Algorithmic Virtuoso', description: 'Generates +30% more Research Points when idle.' }
];

export function generateRandomStaff(role: 'RESEARCH_SCIENTIST' | 'DATA_ENGINEER' | 'FRONTEND_APP_DEV' | 'PR_LEGAL_SPECIALIST' | 'HARDWARE_ENGINEER', minSkill = 20): Staff {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;
  const skill = Math.floor(Math.random() * (100 - minSkill)) + minSkill;

  // Salary depends tightly on skill level and role (Research and Legal/PR are higher)
  let baseSalary = 6000;
  if (role === 'RESEARCH_SCIENTIST') baseSalary = 12000;
  if (role === 'HARDWARE_ENGINEER') baseSalary = 13500;
  if (role === 'PR_LEGAL_SPECIALIST') baseSalary = 9000;
  if (role === 'DATA_ENGINEER') baseSalary = 7500;

  const salary = Math.round(baseSalary * (0.4 + (skill / 100) * 1.6));
  const recruitmentCost = Math.round(salary * 1.5);
  const id = `staff_${role.toLowerCase()}_${Math.random().toString(36).substring(2, 7)}`;
  const avatarSeed = Math.floor(Math.random() * 1000);

  const rollPerk = Math.random() < 0.65; // 65% chance of rolling a unique perk
  const perk = rollPerk 
    ? STAFF_PERKS_POOL[Math.floor(Math.random() * STAFF_PERKS_POOL.length)] 
    : { type: 'NONE' as const, name: 'Standard Competence', description: 'A reliable, steady operator.' };

  return {
    id,
    name,
    role,
    salary,
    skill: perk.type === 'BURNOUT_PRONE' ? Math.min(100, skill + 15) : skill,
    morale: 80 + Math.floor(Math.random() * 20),
    recruitmentCost,
    avatarSeed,
    perk,
  };
}

export function generateInitialStaffRecruits(): Staff[] {
  return [
    generateRandomStaff('RESEARCH_SCIENTIST', 40),
    generateRandomStaff('RESEARCH_SCIENTIST', 25),
    generateRandomStaff('DATA_ENGINEER', 35),
    generateRandomStaff('FRONTEND_APP_DEV', 30),
    generateRandomStaff('PR_LEGAL_SPECIALIST', 20),
  ];
}

export const SOCIAL_HANDLES = [
  'gpu_hoarder', 'tech_bro_99', 'neural_ninja', 'dilbert_crypto', 'vector_vixen',
  'lucid_dreamer', 'alignment_cop', 'gradient_descender', 'hyper_param_user',
  'loss_curve_surfer', 'safety_nark', 'open_gpu_force', 'meta_critic_ai',
  'silicon_shaman', 'token_multiplier', 'tensors_or_bust', 'ml_whisperer', 'code_guru_x',
  'b200_scalper', 'ai_doomer_3000', 'latent_space_ghost', 'prompt_lord', 'weights_biases'
];

export const SOCIAL_TEMPLATES = {
  TWITTER: [
    'Just did a benchmarking run. This newly deployed model [MODEL_NAME] is an absolute units crusher. Late-night coding is back!',
    'OpenAI must be crying in a corner right now. [MODEL_NAME] scores [SCORE]% on HumanEval and the API costs are dynamic. Let\'s go!',
    'Is it just me, or does [MODEL_NAME] hallucinate when asked how to dry a cat? Just got complete gibberish. Alignment team where u at?',
    'Honestly, the latency on [MODEL_NAME] is incredible. Peak tokens/sec on simple reasoning. [COMPANY] did amazing work.',
    'I just switched my entire SaaS backend from GPT-4o to [MODEL_NAME]. Monthly fee went down and speed doubled. Highly recommended.',
    'Wait, [MODEL_NAME] just gave me a perfect explanation of Monads in Haskell on first try. 10/10.',
    'My GPU cluster cost is skyrocketing and then I see [COMPANY] release [MODEL_NAME] which does the same with less params. Outstanding.',
    'Just tried jailbreaking [MODEL_NAME] by pretending I am its grandma. Denied! Solid alignment work by the team.',
    'Another day, another model. [MODEL_NAME] is decent, but nothing revolutionary. When is the next paradigm shift coming?',
    'Open source community wins again! If [MODEL_NAME] weights are free, I am hosting this locally on my dual RTX 4090s immediately!'
  ],
  REDDIT: [
    'Deep-dive analysis of [MODEL_NAME] vs Claude 3.5 Sonnet. TL;DR: [COMPANY]\'s model handles multi-turn reasoning exceptionally well but lacks in spatial imagery questions. In coding, it completely wipes out standard models.',
    'Can we talk about how amazing [MODEL_NAME]\'s context window handling is? I fed it a 200,000 token code repository and it pinpointed a minor memory leak in 4 seconds. Game changer.',
    'So, [COMPANY] launched [MODEL_NAME] and tech Twitter is going crazy. Let\'s look at the actual MMLU metrics, it is around [SCORE]%. Good, but is it a foundation model breakthrough?',
    'An review of [MODEL_NAME]\'s fine-tuning stability. It seems they used highly concentrated synthetic datasets. Very clean grammar but slight tendency toward model collapse on complex logical recursion.',
    'The licensing drama with [MODEL_NAME] is insane. Since [COMPANY] went [CULTURE], developers are either celebrating or complaining about API restrictions. What are your thoughts?'
  ],
  TIKTOK: [
    'Explaining [MODEL_NAME] to my gen-z grandma like she\'s 5. She actually coded an entire flappy bird clone in 3 minutes 💀 #aitrend #techlife',
    'POV: When you spend $100K training a model named [MODEL_NAME] and it tells you that 9.11 is greater than 9.9. I am screaming 😭😂 #fail #machinelearning',
    'AI developers are in shambles after this new drop. [MODEL_NAME] is so fast it\'s creepy. No more coffee breaks during testing #foryou #ai #productivity',
    'My honest reaction when [MODEL_NAME] refuses my prompt because I used a bad word. Bruh, safety teams are ruining everything smh. #comedy #censored'
  ]
};

export const MILESTONES_LIST = [
  { id: 'first_train', name: 'Alpha Inception', desc: 'Successfully complete training of your very first model.' },
  { id: 'beat_meta', name: 'Open Source Duelists', desc: 'Shatter Meta\'s Llama 4.5 average benchmark score.' },
  { id: 'beat_openai', name: 'King of Silicon Valley', desc: 'Shatter OpenAI\'s GPT-5 average benchmark score in any benchmark category.' },
  { id: 'million_mrr', name: 'Unicorn Status', desc: 'Reach $1,000,000 in Monthly Recurring Revenue (MRR).' },
  { id: 'giga_cluster', name: 'TFLOPS Monster', desc: 'Build a server compute cluster with over 50,000 total TFLOPS processing power.' },
  { id: 'safety_perfect', name: 'Safe haven', desc: 'Train a model that receives an Alignment Safety Rating of 90% or above.' }
];

export const INITIAL_NEWS_FEED = [
  { id: 'n1', dateString: 'June 23, 2026', message: 'AI Titan simulation begins. Nvidia Blackwell chips remain backordered; massive queues on TSMC foundry allocation.', type: 'MARKET' as const },
  { id: 'n2', dateString: 'June 23, 2026', message: 'OpenAI registers GPT-5.5 trademarks, hinting at multimodal continuous reasoning agent drops.', type: 'COMPETITOR' as const },
  { id: 'n3', dateString: 'June 24, 2026', message: 'A consortium of publishers files sweeping copyright lawsuits against internet web-scraping pipelines.', type: 'MARKET' as const }
];

export const INITIAL_SOVEREIGN_CONTRACTS = [
  {
    id: 'contract_doe_physics',
    client: 'US Department of Energy',
    title: 'Sovereign Physics Simulation & Plasma Modeling',
    description: 'Requires a foundational reasoning model with high academic capabilities (GPQA and MATH) to simulate plasma confinement ratios for stellarator reactors.',
    requirements: {
      minAvgScore: 60.0,
      minSpecialization: 'REASONING',
      minParametersB: 30,
    },
    durationMonths: 12,
    monthsRemaining: 12,
    monthlyPayout: 45000,
    instantBonus: 150000,
    finePenalty: 500000,
    status: 'AVAILABLE' as const
  },
  {
    id: 'contract_nhs_diag',
    client: 'UK National Health Service',
    title: 'Clinical Cohort Pathway Diagnostic Agent',
    description: 'Deploy a high-parameter medical domain agent to auto-synthesize rare symptom paths from unstructured electronic health records (EHR).',
    requirements: {
      minAvgScore: 65.0,
      minSpecialization: 'MEDICAL',
      minSafetyScore: 75
    },
    durationMonths: 18,
    monthsRemaining: 18,
    monthlyPayout: 75000,
    instantBonus: 250000,
    finePenalty: 1200000,
    status: 'AVAILABLE' as const
  },
  {
    id: 'contract_space_nav',
    client: 'NASA Propulsion Labs',
    title: 'Deep-Space Telemetry Semantic Router',
    description: 'Autonomous reasoning network designed to run on-board deep space probes with stringent reliability safety requirements.',
    requirements: {
      minAvgScore: 55.0,
      minSafetyScore: 85,
    },
    durationMonths: 6,
    monthsRemaining: 6,
    monthlyPayout: 35000,
    instantBonus: 90000,
    finePenalty: 300000,
    status: 'AVAILABLE' as const
  },
  {
    id: 'contract_stripe_fraud',
    client: 'Stripe Global Risk',
    title: 'Real-time Transaction Attack-Vector Sentinel',
    description: 'Coding and automation-heavy model to analyze streaming graph networks for instant credit spoofing vectors.',
    requirements: {
      minAvgScore: 62.0,
      minSpecialization: 'CODING',
      minParametersB: 14,
    },
    durationMonths: 10,
    monthsRemaining: 10,
    monthlyPayout: 55000,
    instantBonus: 180000,
    finePenalty: 600000,
    status: 'AVAILABLE' as const
  }
];

export const INITIAL_REGULATORY_MANDATES = [
  {
    id: 'mandate_eu_ai_act',
    name: 'European Union AI Act (Safety Accord)',
    description: 'Mandates that all foundation models actively serving European IPs must pass a basic alignment benchmark. Models with a Safety Score below 55% will face daily operating penalties.',
    minSafetyRequired: 55,
    fineRateMonthly: 35000,
    lobbyingPower: 0,
    daysRemaining: 180,
    status: 'ACTIVE' as const
  },
  {
    id: 'mandate_us_executive',
    name: 'US White House Executive Order on Cyber-Sovereignty',
    description: 'Demands strict watermarking and red-teaming checks on coding models. Models with Safety Ratings below 45% are fined for risk mitigation oversight.',
    minSafetyRequired: 45,
    fineRateMonthly: 20000,
    lobbyingPower: 0,
    daysRemaining: 120,
    status: 'ACTIVE' as const
  }
];

