export type GameSpeed = 'PAUSED' | 'NORMAL' | 'FAST' | 'HYPER';

export type ModelDomain = 'TEXT_LLM' | 'IMAGE_DIFFUSION' | 'VIDEO_GENERATION';

export type EventVenueType = 'BLOG_POST' | 'VIRTUAL_STREAM' | 'CONFERENCE_HALL' | 'GLOBAL_STADIUM';
export type EventFocusType = 'AGI_VISION' | 'ENTERPRISE_SAFETY' | 'CONSUMER_FUN' | 'DEVELOPER_API';

export type StartingOrigin = 'GARAGE_HACKER' | 'NEPO_BABY' | 'DESPERATE_PIVOT' | 'NORMAL_STARTUP';

export type BrandThemeColor = 'CYAN' | 'EMERALD' | 'ROSE' | 'PURPLE';
export type BusinessStrategy = 'ENTERPRISE' | 'CONSUMER' | 'OPEN_SOURCE';
export type CeoAvatar = 'HACKER' | 'SUIT' | 'VISIONARY' | 'CYBORG';
export type CoreTechFocus = 'MOE' | 'FP8' | 'LIQUID_COOLING';
export interface WarfareDefenseState {
  cybersecurityLevel: number;
  prRetainerActive: boolean;
  prRetainerDaysLeft: number;
  offenseBudget: number;
  defenseState: { firewallIntegrity: number; isHacked: boolean; };
  activeOperations: any[];
}

export interface ScheduledEvent {
  id: string;
  targetDate: string; // YYYY-MM-DD
  daysRemaining: number;
  venueType: EventVenueType;
  focus: EventFocusType;
  modelId: string; // The model being showcased
  productionValueLevel: number; // 0, 1, 2, 3 (extra costs)
  guestSpeaker?: string; // Optional celebrity/influencer guest
  venueCost: number;
  productionCost: number;
  speakerCost: number;
  oneMoreThingTease?: string; // Optional R&D project teased
  isClashingWithCompetitor?: boolean; // Set dynamically if competitor launches same day
}

export interface ActiveLiveEventState {
  eventId: string;
  venueType: EventVenueType;
  focus: EventFocusType;
  modelId: string;
  modelName: string;
  modelMmlu: number;
  modelSafety: number;
  guestSpeaker?: string;
  productionValueLevel: number;
  oneMoreThingTease?: string;
  
  // Progress of the event
  phase: 'INTRO' | 'DEMO' | 'GUEST' | 'ONE_MORE_THING' | 'QA' | 'FINISHED';
  ticksInPhase: number;
  maxTicksInPhase: number;
  
  // Real-time tracking
  currentHype: number;
  audienceSentiment: number;
  demoRiskLevel: number;
  demoSuccessRate: number; // calculated at start
  demoResult?: 'CRASH' | 'HALLUCINATION' | 'SUCCESS' | 'FLAWLESS';
  qaResult?: 'BOMBED' | 'SURVIVED' | 'ACED';
  oneMoreThingResult?: 'DISAPPOINTMENT' | 'MIND_BLOWN';
  
  // Financials during event
  ticketsSold: number;
  merchRevenue: number;
  investorConfidenceBump: number;
  isPaused: boolean;
}

export interface PastMarketingEvent {
  id: string;
  dateString: string;
  venueType: EventVenueType;
  focus: EventFocusType;
  modelName: string;
  totalCost: number;
  revenueGenerated: number;
  hypeGenerated: number;
  usersGained: number;
  valuationMultiplier?: number;
  finalSentiment: number;
  demoResult: string;
  qaResult: string;
}


export type FounderBackground = 'STANFORD_DROPOUT' | 'EX_DEEPMIND_FELLOW' | 'WALL_STREET_ROGUE' | 'SELF_TAUGHT_PRODIGY';

export type HQLocationType = 'SILICON_VALLEY' | 'LONDON' | 'TOKYO' | 'PARIS' | 'SHENZHEN';

export type CorporateCultureType = 'MOVE_FAST_BREAK_THINGS' | 'SAFETY_ALIGNMENT' | 'OPEN_SOURCE_EVANGELIST';

export type FundingStage = 'BOOTSTRAPPED' | 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'SERIES_B' | 'SERIES_C' | 'PUBLIC_IPO';

export interface Founder {
  name: string;
  age: number;
  nationality: string;
  background: FounderBackground;
  technical: number; // 0 to 100
  charisma: number;
  strategy: number;
  agility: number;
}

export interface HQLocation {
  type: HQLocationType;
  name: string;
  talentPool: number; // multiplier or base level
  taxRate: number; // percentage
  electricityCost: number; // $ per kWh
  monthlyRent: number;
  bonusText: string;
}

export interface CorporateCulture {
  type: CorporateCultureType;
  name: string;
  description: string;
  trainingBonus: number; // multiplier
  legalRiskMultiplier: number;
  adoptionBonus: number;
  safetyRatingBonus: number;
}

export interface GPUHardware {
  id: string;
  name: string;
  generation: string;
  cost: number;
  tflops: number;
  powerUsageKW: number; // kW per unit
  heatOutputFactor: number; // multiplier
  coolingCostMultiplier: number;
  unlockedAtStage: FundingStage;
  iconName: string;
}

export interface InstalledGPUType {
  gpuId: string;
  quantity: number;
}

export interface ServerInstance {
  id: string;
  gpuId: string;
  gpuName: string;
  purchaseDate: string;
  ageDays: number;
  condition: number; // 0 to 100
  status: 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'CRITICAL' | 'SHUTDOWN';
  thermalShutdown?: boolean;
  underMaintenance?: boolean;
  maintenanceDaysRemaining?: number;
  isPoweredOff?: boolean;
}

export type StaffRole = 'RESEARCH_SCIENTIST' | 'DATA_ENGINEER' | 'FRONTEND_APP_DEV' | 'PR_LEGAL_SPECIALIST' | 'HARDWARE_ENGINEER';

export interface ChipProject {
  id: string;
  name: string;
  nodeSizeNM: number;
  designFocus: 'TFLOPS' | 'EFFICIENCY' | 'HEAT_REDUCTION';
  dieSizeSqMM: number; // e.g. 200 to 800 sqmm
  stage: 'DESIGN' | 'VERIFICATION' | 'TAPEOUT' | 'VALIDATION';
  progress: number; // 0 to 100
  status: 'ACTIVE' | 'BUG_BLOCKED' | 'COMPLETED';
  estimatedTflops: number;
  estimatedPowerKW: number;
  estimatedHeatFactor: number;
  unitCost: number;
  totalDaysElapsed: number;
  tapeoutFeePaid: boolean;
  bugResolved: boolean;
  validationBugs?: 'NONE' | 'MINOR' | 'CRITICAL';
}

export type StaffPerkType = 
  | 'GPU_WHISPERER' 
  | 'SYNTHESIZER' 
  | 'SAFETY_ZEALOT' 
  | 'HYPE_MONSTER' 
  | 'BURNOUT_PRONE'
  | 'ALGORITHMIC_GENIUS'
  | 'NONE';

export interface StaffPerk {
  type: StaffPerkType;
  name: string;
  description: string;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  salary: number; // monthly
  skill: number; // 1 to 100
  morale: number; // 0 to 100
  recruitmentCost: number;
  avatarSeed: number;
  perk?: StaffPerk;
}

export type ArchitectureStyle = 'TRANSFORMER' | 'SSM_MAMBA' | 'HYBRID_MOE';

export interface DatasetMix {
  webScraping: number; // percentage (0 - 100)
  synthetic: number;
  licensed: number;
}

export interface ModelDraft {
  name: string;
  architecture: ArchitectureStyle;
  parametersCountB: number; // in Billions (e.g. 7B to 2000B)
  contextWindowTokens: number; // e.g. 32768, 1048576 (1M)
  datasetSizeTrillionTokens: number; // e.g. 1 to 15
  datasetMix: DatasetMix;
  specialization: 'GENERAL' | 'CODING' | 'REASONING' | 'MULTIMODAL_ROBOTICS' | 'MEDICAL';
  epochs?: number;
  domain: ModelDomain;
}

export interface ModelFlaw {
  id: string;
  name: string;
  description: string;
  metricImpacted: 'mmlu' | 'humanEval' | 'gsm8k' | 'math' | 'gpqa' | 'sweBench' | 'ifeval' | 'arenaElo';
  penaltyPct: number; // e.g. 20 means -20%
  remedyCostPoints: number;
  remedyCostCash: number;
  isFixed: boolean;
}

export interface TrainedModel {
  id: string;
  name: string;
  architecture: ArchitectureStyle;
  parametersCountB: number;
  contextWindowTokens: number;
  specialization: string;
  totalTokensProcessed: number;
  qualityScore: number; // Calc based on training parameters, datasets, and staff skills (0-100)
  safetyScore: number; // 0-100
  domain: ModelDomain;
  isAligned: boolean;
  alignmentProgress: number; // 0 to 100
  alignmentBudget: number; // daily cash spend on alignment human feedback
  isDeployed: boolean;
  deploymentType?: 'CLOSED_API' | 'ENTERPRISE' | 'APP_COPILOT' | 'CONSUMER_CHATBOT' | 'OPEN_SOURCE' | 'NONE';
  activeDeployments?: ('CLOSED_API' | 'ENTERPRISE' | 'APP_COPILOT' | 'CONSUMER_CHATBOT' | 'OPEN_SOURCE')[];
  pricePerMillionTokens: number; // for CLOSED_API
  monthlySubscriptionPrice: number; // for ENTERPRISE, COPILOT, CHATBOT
  creationDateString: string;
  benchmarks: {
    mmlu: number;
    humanEval: number;
    gsm8k: number;
    math: number;
    gpqa: number;
    sweBench: number;
    ifeval: number;
    arenaElo: number;
  };
  benchmarkStatus?: {
    mmlu: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    humanEval: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    gsm8k: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    math: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    gpqa: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    sweBench: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    ifeval: 'UNTESTED' | 'TESTING' | 'VERIFIED';
    arenaElo: 'UNTESTED' | 'TESTING' | 'VERIFIED';
  };
  flaws?: ModelFlaw[];
  usersCount: number;
  monthlyRevenue: number;
  scoreHistory?: { date: string; modelScore: number; marketAverage: number }[];
}

export interface OngoingTraining {
  modelDraft: ModelDraft;
  startedOnDate: string;
  progressPercentage: number; // 0 to 100
  currentLoss: number;
  lossHistory: number[];
  tokensProcessedTrillion: number;
  tflopsRate: number;
  learningRate: number;
  alignmentRating: number;
  isPaused: boolean;
  expectedDaysLeft: number;
  explodingGradientRisk: number;
  accumulatedCost: number;
  explodingGradientDaysRemaining?: number;
  explodingGradientChoiceEffect?: 'REDUCED_SPEED' | 'NONE';
}

export interface Competitor {
  id: string;
  name: string;
  marketShare: number; // percentage (0 - 100)
  leadModelName: string;
  leadModelScore: number; // average benchmark score
  isAIStudioUser: boolean;
  computePower?: number; // Virtual Gigaflops
  activeTraining?: {
    modelName: string;
    targetScore: number;
    progress: number;
    estDaysRemaining: number;
    domain: ModelDomain;
  } | null;
  isPanicking?: boolean;
  internalVersion?: number; // Tracks actual version (e.g. 4.0, 1.5) independently of raw score
}

export interface FeedReply {
  id: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  isUser?: boolean;
}

export interface SocialFeedItem {
  id: string;
  handle: string;
  platform: 'TWITTER' | 'TIKTOK' | 'REDDIT';
  daysAgoText: string;
  timestamp: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  likes: number;
  shares: number;
  replies?: FeedReply[];
  isGeneratingReplies?: boolean;
}

export interface GameNewsLog {
  id: string;
  dateString: string;
  message: string;
  type: 'MARKET' | 'COMPETITOR' | 'SYSTEM' | 'EVENT' | 'MILESTONE';
}

export interface SoftwareApp {
  id: string;
  name: string;
  type: 'CHATBOT' | 'COPILOT_CODING' | 'AGENT_WORKFLOW' | 'IMAGE_GENERATION' | 'VIDEO_GENERATION';
  modelId?: string; // Legacy for backwards compatibility
  modelIds: string[]; // Up to 3 models for tiered selections
  secondaryModelId?: string; // Optional reasoning/thinking model route
  creationDate: string;
  qualityScore: number;
  activeUsers: number;
  monthlyRevenue: number;
  marketingSpendDaily: number;
  unlockedFeatures: string[]; // e.g. 'THINKING_LEVELS', 'MULTIMODAL', 'WEB_SEARCH'
}

export interface ResearchState {
  maxParamsB: number; // starts at 8B (e.g., 8, 30, 70, 100, 400, 1000)
  maxContextTokens: number; // starts at 32768 (32k)
  maxDatasetTrillion: number; // starts at 2 (e.g. 2, 5, 15, 30, 50, 100)
  unlockedMoE: boolean;
  unlockedSSM: boolean;
  unlockedPrecisionFP8: boolean;
  unlockedEpochs: number; // starts at 1, max 3
  completedProjects: string[];
  unlockedLiquidCooling?: boolean;
  unlockedOverclockingRigs?: boolean;
  unlockedAdvancedInverters?: boolean;
  unlockedQualityFilters?: boolean;
}

export interface AIAgentEmployee {
  id: string;
  name: string;
  assignedRole: StaffRole;
  modelId: string; // The trained model acting as this agent
  computeCostMonthly: number; // compute server costs to run 24/7
  skillMultiplier: number; // e.g. 1.2
  morale: number; // Always 100% (or stable)
  efficiency: number; // 0 to 100
}

export interface SovereignContract {
  id: string;
  client: string; // e.g. "US Department of Energy", "AeroSpace Corp"
  title: string; // e.g. "Space Telescope Image Classification"
  description: string;
  requirements: {
    minAvgScore?: number;
    minSpecialization?: string;
    minParametersB?: number;
    minSafetyScore?: number;
  };
  durationMonths: number;
  monthsRemaining: number;
  monthlyPayout: number;
  instantBonus: number;
  finePenalty: number; // If contract fails/is breached
  assignedModelId?: string; // Currently fulfilling
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'BREACHED';
}

export interface RegulatoryMandate {
  id: string;
  name: string; // e.g. "EU AI Safety Act V2"
  description: string;
  minSafetyRequired: number; // models below this are penalized
  fineRateMonthly: number; // cash penalty per non-compliant deployed model
  lobbyingPower: number; // player can spend R&D points or cash to reduce the minSafetyRequired
  daysRemaining: number;
  status: 'ACTIVE' | 'PASSED' | 'DEFEATED';
}

export interface SlackChatOption {
  text: string;
  actionId: string;
}

export interface SlackChat {
  employeeName: string;
  role: string;
  message: string;
  options: SlackChatOption[];
}

export interface GameState {
  // Game Controls
  // Controls & Basics
  currentDate: string; // YYYY-MM-DD
  daysElapsed: number;
  gameSpeed: GameSpeed;
  isGameOver: boolean;
  agiDoomMeter?: number;
  isAgiTakeover?: boolean;
  activeSlackChat?: SlackChat | null;
  companyName?: string;
  brandThemeColor?: BrandThemeColor;
  businessStrategy?: BusinessStrategy;
  nemesisId?: string;
  ceoAvatar?: CeoAvatar;
  coreTechFocus?: CoreTechFocus;
  acceleratorPurchases?: number;

  // Onboarding Completed
  onboardingCompleted: boolean;
  difficultyLevel?: 'NORMAL' | 'HARD' | 'EXPERT';

  // Profiles
  founder: Founder;
  hqLocation: HQLocation;
  culture: CorporateCulture;

  // Financials & Core Metrics
  cash: number;
  equityPercent: number; // Starts at 100
  valuation: number; // USD
  fundingStage: FundingStage;
  boardApproval: number; // 0-100
  researchPoints: number; // Used for unlocking hardware, licenses, or optimizations
  corporateDebt?: number;
  activeOrigin?: StartingOrigin;

  // Operating Financial History (this month's projections/costs)
  monthlyExpenses: {
    infrastructureCost: number;
    powerBill: number;
    salaries: number;
    rent: number;
    interest: number;
    legalOverhead: number;
  };
  monthlyRevenue: number;

  // Social Media & PR
  socialFollowers: number;
  trendingHashtag: string | null;

  // Crisis Events
  activeCrisis?: 'MARKET_DOWNTURN' | 'POWER_OUTAGE' | 'REGULATORY_CRACKDOWN' | null;
  crisisDaysRemaining?: number;
  
  // AI Wars / Market Dynamics
  gpuShortageMultiplier?: number;
  gpuShortageDaysRemaining?: number;
  competitorRetaliationDays?: number; // Days until a competitor counters your model
  competitorRetaliationTarget?: number; // The score they are aiming for

  // Compute Operations
  gpusInstalled: { [gpuId: string]: number };
  coolingLevel: number; // level 1 - 10
  powerGridStability: number; // 0 - 100
  clusterOverheated: boolean;

  // Talent Force
  staff: Staff[];
  aiAgents?: AIAgentEmployee[];

  // R&D Lab & Model Development
  training: OngoingTraining | null;
  trainedModels: TrainedModel[];
  activeModelId: string | null; // Currently deployed or primary model

  // Competitor Ecosystem
  competitors: Competitor[];

  // Feedback, Social Engine & Public Sentiment
  globalPublicSentiment: number; // 0 - 100
  hypeLevel: number; // 0 - 100 multiplier for growth (starts at 20)
  socialFeed: SocialFeedItem[];
  llmFeedQueue?: SocialFeedItem[]; // Dynamically generated batches waiting to drop
  
  warfareState?: WarfareDefenseState;

  // Logs & History
  newsLogs: GameNewsLog[];
  completedMilestones: string[];

  // Marketing & Keynotes (Mega-Feature)
  scheduledEvent?: ScheduledEvent | null;
  activeLiveEvent?: ActiveLiveEventState | null;
  pastEvents?: PastMarketingEvent[];

  // Research & Created Apps Expansion
  research: ResearchState;
  apps: SoftwareApp[];
  serverInstances: ServerInstance[];

  // Sovereign & Regulatory Expansion
  contracts?: SovereignContract[];
  regulatoryMandates?: RegulatoryMandate[];
  lobbyingLevel?: number; // starts at 0

  // Custom Silicon R&D Extension
  activeChipProject?: ChipProject | null;
  customChips?: GPUHardware[];
}

export interface WarfareAction {
  id: string;
  name: string;
  description: string;
  cost: number;
  baseSuccessRate: number;
  type: 'OFFENSE' | 'DEFENSE';
}
