import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Heart, RefreshCw, Send, AlertTriangle, Eye, ShieldAlert, 
  BadgeInfo, Share2, Award, Zap, Sparkles, Smile, MessageCircle, AlertOctagon, HelpCircle
} from 'lucide-react';
import { GameState, SocialFeedItem, FeedReply } from '../types';
import { apiFetch } from '../lib/api';

interface SocialMediaMatrixProps {
  state: GameState;
  updateState: (newState: Partial<GameState>) => void;
  addLogMessage: (msg: string, type: 'SYSTEM' | 'EVENT' | 'MILESTONE' | 'MARKET') => void;
}

export default function SocialMediaMatrix({ state, updateState, addLogMessage }: SocialMediaMatrixProps) {
  const [platformFilter, setPlatformFilter] = useState<'ALL' | 'TWITTER' | 'REDDIT' | 'TIKTOK'>('ALL');
  const [isLocked, setIsLocked] = useState(false); // scroll freeze
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [sharedPosts, setSharedPosts] = useState<Record<string, boolean>>({});

  // Composer States
  const [customPostContent, setCustomPostContent] = useState('');
  const [composerPlatform, setComposerPlatform] = useState<'TWITTER' | 'REDDIT' | 'TIKTOK'>('TWITTER');
  const [composerTone, setComposerTone] = useState<'STANDARD' | 'PR_BOOST' | 'SHITPOST'>('STANDARD');

  // Reply States (keyed by post ID)
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyTone, setReplyTone] = useState<'HELPFUL' | 'HYPE' | 'SNAK_BACK'>('HELPFUL');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);

  const filteredFeed = (state.socialFeed || []).filter((item) => {
    if (platformFilter === 'ALL') return true;
    return item.platform === platformFilter;
  });

  const handleLikeReact = (itemId: string) => {
    const isLiked = !!likedPosts[itemId];
    const diff = isLiked ? -1 : 1;

    setLikedPosts((prev) => ({ ...prev, [itemId]: !isLiked }));

    const updatedFeed = (state.socialFeed || []).map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          likes: Math.max(0, item.likes + diff),
        };
      }
      return item;
    });

    const nextHype = Math.max(0, Math.min(150, state.hypeLevel + (0.1 * diff)));

    updateState({
      socialFeed: updatedFeed,
      hypeLevel: nextHype,
    });
  };

  const handleShareReact = (itemId: string) => {
    const isShared = !!sharedPosts[itemId];
    const diff = isShared ? -1 : 1;

    setSharedPosts((prev) => ({ ...prev, [itemId]: !isShared }));

    const updatedFeed = (state.socialFeed || []).map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          shares: Math.max(0, item.shares + diff),
        };
      }
      return item;
    });

    const nextHype = Math.max(0, Math.min(150, state.hypeLevel + (0.2 * diff)));

    updateState({
      socialFeed: updatedFeed,
      hypeLevel: nextHype,
    });
  };

  const handleAIAssistBroadcast = async () => {
    if (!customPostContent.trim() || isGeneratingPost) return;
    setIsGeneratingPost(true);
    
    try {
      const response = await apiFetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftIntent: customPostContent,
          originalPost: "",
          tone: composerTone,
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response && !data.response.startsWith("ERROR")) {
          setCustomPostContent(data.response);
        } else {
          addLogMessage(`⚠️ AI ASSIST FAILED: ${data.response}`, 'SYSTEM');
        }
      }
    } catch (e) {
      console.warn("Failed to generate broadcast.", e);
      addLogMessage(`⚠️ AI ASSIST FAILED: Network error.`, 'SYSTEM');
    }
    setIsGeneratingPost(false);
  };

  // Broadcast a new user post
  const handleBroadcastPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPostContent.trim()) return;

    let cost = 0;
    let hypeBonus = 1.5;
    let sentimentDelta = 0;

    if (composerTone === 'PR_BOOST') {
      cost = 400;
      hypeBonus = 5.0;
      sentimentDelta = 3.0;
    } else if (composerTone === 'SHITPOST') {
      cost = 0;
      hypeBonus = 6.0;
      sentimentDelta = -2.0; // controversial!
    }

    let hashtagBonus = false;
    if (state.trendingHashtag && customPostContent.toLowerCase().includes(state.trendingHashtag.toLowerCase())) {
      hashtagBonus = true;
      hypeBonus += 15.0;
      sentimentDelta += 5.0;
    }

    if (state.cash < cost) {
      addLogMessage('❌ BROADCAST CANCELLED: Insufficient cash to fund targeted PR marketing campaigns.', 'SYSTEM');
      return;
    }

    const postId = `my_social_${Date.now()}`;
    const newItem: SocialFeedItem = {
      id: postId,
      handle: `@${state.founder.name.toLowerCase().replace(/\s+/g, '')}_ceo`,
      platform: composerPlatform,
      daysAgoText: 'Just now',
      timestamp: state.currentDate,
      content: customPostContent,
      sentiment: composerTone === 'SHITPOST' ? 'NEGATIVE' : 'POSITIVE',
      likes: (composerTone === 'PR_BOOST' ? 120 : 15) * (hashtagBonus ? 5 : 1) * (1 + (state.socialFollowers || 0) / 50000),
      shares: (composerTone === 'PR_BOOST' ? 45 : 3) * (hashtagBonus ? 5 : 1) * (1 + (state.socialFollowers || 0) / 50000),
      replies: [],
      isGeneratingReplies: true
    };

    updateState({
      cash: state.cash - cost,
      socialFeed: [newItem, ...(state.socialFeed || [])],
      hypeLevel: Math.min(150, state.hypeLevel + hypeBonus),
      globalPublicSentiment: Math.max(0, Math.min(100, state.globalPublicSentiment + sentimentDelta))
    });

    addLogMessage(`📢 BROADCAST DISPATCHED: Published corporate memo on ${composerPlatform}. ${hashtagBonus ? `📈 VIRAL HIT: Leveraged ${state.trendingHashtag} for massive reach! ` : ''}${cost > 0 ? `Cost: -$${cost.toLocaleString()} PR fee.` : ''}`, 'SYSTEM');
    const savedContent = customPostContent;
    setCustomPostContent('');

    // Fetch dynamic replies from Gemini
    try {
      // Get the last 10 posts made by the user
      const userHandle = `@${state.founder.name.toLowerCase().replace(/\s+/g, '')}_ceo`;
      const pastPosts = (state.socialFeed || [])
        .filter(item => item.handle === userHandle)
        .slice(0, 10)
        .map(item => item.content);

      const response = await apiFetch('/api/social-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postContent: savedContent,
          tone: composerTone,
          companyName: state.companyName,
          hypeLevel: state.hypeLevel,
          sentiment: state.globalPublicSentiment,
          pastPosts: pastPosts
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error:", errText);
        throw new Error(`Backend Error: ${response.status} from ${response.url}. ${errText.substring(0, 50)}`);
      }

      const data = await response.json();
      console.log("RAW LLM DATA RECEIVED:", data);
      
      // Defensively parse LLM reply structures
      let rawReplies = data.replies || [];
      if (!Array.isArray(rawReplies)) {
        if (typeof rawReplies === 'object' && rawReplies !== null) {
          // Check if it's an object of multiple replies: { "1": {...}, "2": {...} }
          const values = Object.values(rawReplies);
          if (values.length > 0 && typeof values[0] === 'object') {
            rawReplies = values;
          } else {
            // Or a single reply object: { handle: "@...", content: "..." }
            rawReplies = [rawReplies];
          }
        } else {
          rawReplies = [];
        }
      }

      const generatedReplies = rawReplies.map((r: any, idx: number) => ({
        id: `reply_gemini_${Date.now()}_${idx}`,
        handle: r.handle || '@anon_user',
        content: r.content || 'Interesting.',
        timestamp: state.currentDate,
        likes: r.likes || Math.floor(Math.random() * 50)
      }));

      // Update state to append replies
      updateState({
        socialFeed: [
          { ...newItem, replies: generatedReplies, isGeneratingReplies: false },
          ...(state.socialFeed || [])
        ]
      });
    } catch (err: any) {
      console.error("Gemini Reply Error", err);
      addLogMessage(`⚠️ AI REPLY FAILED: ${err.message}. Falling back to static replies.`, 'SYSTEM');
      // Fallback
      updateState({
        socialFeed: [
          { 
            ...newItem, 
            isGeneratingReplies: false,
            replies: [
              {
                id: `reply_auto_${Date.now()}`,
                handle: '@cyber_maven',
                content: composerTone === 'SHITPOST' 
                  ? 'Absolute legendary shitpost from the executive officer. Deploying immediately!' 
                  : 'Interesting product coordinates. Will evaluate MMLU curves shortly.',
                timestamp: state.currentDate,
                likes: 8
              }
            ]
          },
          ...(state.socialFeed || [])
        ]
      });
    }
  };

  // Reply to active comment
  const handleSendReply = async (postId: string) => {
    if (!replyContent.trim() || isGeneratingReply) return;
    
    setIsGeneratingReply(true);

    let hypeDelta = 0.5;
    let sentimentDelta = 0;
    let responseLog = '';

    if (replyTone === 'HELPFUL') {
      sentimentDelta = 2.0;
      responseLog = 'Handled developer feedback politely.';
    } else if (replyTone === 'HYPE') {
      hypeDelta = 2.5;
      sentimentDelta = 0.5;
      responseLog = 'Injected hyperbole marketing pitches into comments.';
    } else if (replyTone === 'SNAK_BACK') {
      hypeDelta = 4.0;
      sentimentDelta = -1.5; // risk reputation!
      responseLog = 'Clapped back with absolute sarcasm.';
    }

    const targetPost = state.socialFeed?.find(p => p.id === postId);
    const originalPostText = targetPost ? targetPost.content : '';

    let generatedText = replyContent;

    try {
      const response = await apiFetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftIntent: replyContent,
          originalPost: originalPostText,
          tone: replyTone,
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response && !data.response.startsWith("ERROR")) {
          generatedText = data.response;
        } else {
          console.warn("LLM expansion failed, using raw text.", data.response);
        }
      }
    } catch (e) {
      console.warn("Failed to generate expanded reply, using raw text.", e);
    }

    const newReply: FeedReply = {
      id: `reply_user_${Date.now()}`,
      handle: `@${state.founder.name.toLowerCase().replace(/\s+/g, '')}_ceo`,
      content: generatedText,
      timestamp: state.currentDate,
      likes: Math.floor(Math.random() * 12) + 2
    };

    const updatedFeed = (state.socialFeed || []).map((item) => {
      if (item.id === postId) {
        return {
          ...item,
          replies: [...(item.replies || []), newReply]
        };
      }
      return item;
    });

    updateState({
      socialFeed: updatedFeed,
      hypeLevel: Math.min(150, state.hypeLevel + hypeDelta),
      globalPublicSentiment: Math.max(0, Math.min(100, state.globalPublicSentiment + sentimentDelta))
    });

    addLogMessage(`💬 COMMENT INTERVENE: ${responseLog} Hype: +${hypeDelta}%, Public Sentiment: ${sentimentDelta >= 0 ? '+' : ''}${sentimentDelta}%`, 'SYSTEM');
    setReplyContent('');
    setActiveReplyPostId(null);
    setIsGeneratingReply(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'TWITTER':
        return <span className="text-[10px] font-mono bg-slate-950 font-black border border-slate-850 text-slate-200 rounded px-1.5 py-0.5 uppercase">X (Twitter)</span>;
      case 'REDDIT':
        return <span className="text-[10px] font-mono bg-orange-950/40 border border-orange-900/40 text-orange-400 rounded px-1.5 py-0.5 uppercase">Reddit r/AI</span>;
      case 'TIKTOK':
        return <span className="text-[10px] font-mono bg-sky-950/40 border border-sky-900/40 text-cyan-400 rounded px-1.5 py-0.5 uppercase">TikTok Byte</span>;
      default:
        return null;
    }
  };

  const currentActiveModel = state.trainedModels.find((m) => m.id === state.activeModelId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* Feed Column */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Top Broadcast Form */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 relative z-10">
            <Send className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            <h4 className="font-bold text-slate-150 text-xs uppercase font-mono tracking-wider">Broadcasting Center (PR & Memes)</h4>
          </div>

          <form onSubmit={handleBroadcastPost} className="space-y-4 relative z-10">
            <textarea
              className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-sans resize-none transition-all"
              rows={4}
              maxLength={10000}
              placeholder="What details would you like to publicize to our global social channels? Mention valuations, parameters, or leak code specs..."
              value={customPostContent}
              onChange={(e) => setCustomPostContent(e.target.value)}
            />

            <div className="flex flex-wrap items-center justify-between gap-3.5 text-xs">
              <div className="flex gap-2">
                {/* Platform select */}
                <select
                  value={composerPlatform}
                  onChange={(e) => setComposerPlatform(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-[11px] font-mono rounded-lg py-1.5 px-3 text-slate-350 focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
                >
                  <option value="TWITTER">X (Twitter)</option>
                  <option value="REDDIT">Reddit r/MachineLearning</option>
                  <option value="TIKTOK">TikTok Live Feed</option>
                </select>

                {/* Tone Select */}
                <select
                  value={composerTone}
                  onChange={(e) => setComposerTone(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-[11px] font-mono rounded-lg py-1.5 px-3 text-slate-350 focus:outline-none focus:border-cyan-500 cursor-pointer transition-colors"
                >
                  <option value="STANDARD">Standard Post (Free, +1.5% Hype)</option>
                  <option value="PR_BOOST">Sponsored PR Ad (-$400, +5% Hype, +3% Sent)</option>
                  <option value="SHITPOST">Sarcastic Shitpost (Free, +6% Hype, -2% Sent)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAIAssistBroadcast}
                  disabled={!customPostContent.trim() || isGeneratingPost}
                  className="bg-indigo-950/50 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/50 disabled:opacity-45 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center"
                  title="Expand draft with AI"
                >
                  {isGeneratingPost ? <RefreshCw className="h-4 w-4 animate-spin" /> : "✨"}
                </button>
                <button
                  type="submit"
                  disabled={!customPostContent.trim() || isGeneratingPost}
                  className="bg-gradient-to-r from-cyan-600 to-indigo-600 disabled:opacity-45 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all active:translate-y-px cta-glow uppercase tracking-wider font-mono"
                >
                  Broadcast memo
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Social scroll listing column */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-indigo-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="border-b border-slate-800/80 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
            <div>
              <h3 className="font-bold text-slate-150 flex items-center gap-2 text-xs uppercase font-mono tracking-wider">
                <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                Dynamic Public Sentiment Matrix Feed
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Read, react to, and reply to community posts about your company.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-1.5 rounded-lg text-[10px] px-3 font-mono border transition-all cursor-pointer font-bold ${
                  isLocked 
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-200 shadow-md shadow-indigo-950/40' 
                    : 'border-slate-850 bg-slate-950/60 text-slate-500 hover:border-slate-800'
                }`}
              >
                {isLocked ? '🔒 Freeze Feed' : '🔓 Scrolling Active'}
              </button>
            </div>
          </div>

          {/* Platform selection tabs */}
          <div className="flex gap-2 flex-wrap relative z-10">
            {['ALL', 'TWITTER', 'REDDIT', 'TIKTOK'].map((platform) => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform as any)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  platformFilter === platform
                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-550/45 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-950/60 text-slate-500 border border-transparent hover:border-slate-850'
                }`}
              >
                {platform === 'ALL' ? '🌍 Global Multi-Channel' : platform}
              </button>
            ))}
          </div>

          {/* Scroller list with Framer Motion transitions */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
                Gathering satellite social nodes. Increase game speeds to start scanning comments.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredFeed.slice(0, 20).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={isLocked ? {} : { opacity: 0, y: -15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`bg-slate-950/50 border rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-800 transition-colors ${
                      item.sentiment === 'POSITIVE' 
                        ? 'border-emerald-500/20 bg-emerald-950/5' 
                        : item.sentiment === 'NEGATIVE' 
                          ? 'border-rose-500/20 bg-rose-950/5' 
                          : 'border-slate-850'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{item.handle}</span>
                        <span className="text-slate-500 font-mono text-[9px]">{item.daysAgoText}</span>
                      </div>
                      {getPlatformIcon(item.platform)}
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">{item.content}</p>

                    {item.isGeneratingReplies && (
                      <div className="pl-3.5 border-l-2 border-slate-850 space-y-2 mt-2">
                        <div className="text-[10px] font-mono leading-normal text-slate-500 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900 flex items-center gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin text-cyan-500" />
                          The internet is reacting...
                        </div>
                      </div>
                    )}

                    {/* Replies Thread */}
                    {item.replies && item.replies.length > 0 && !item.isGeneratingReplies && (
                      <div className="pl-3.5 border-l-2 border-slate-800/80 space-y-2.5 mt-2.5">
                        {item.replies.map((rep) => (
                          <div key={rep.id} className="text-[10px] font-mono leading-normal text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900/60">
                            <div className="flex justify-between font-bold text-[9px] text-slate-500 mb-1">
                              <span className="text-slate-350">{rep.handle}</span>
                              <span className="text-slate-600">Reply</span>
                            </div>
                            <p className="text-slate-400">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[11px] font-mono pt-2.5 border-t border-slate-900/60">
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleLikeReact(item.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer text-[10px] ${
                            likedPosts[item.id] ? 'text-rose-500 font-bold' : 'text-slate-505 hover:text-rose-455'
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${likedPosts[item.id] ? 'fill-rose-500 text-rose-500' : 'fill-rose-955/60 hover:fill-rose-500 text-slate-550'}`} />
                          <span>{Math.round(item.likes).toLocaleString()}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareReact(item.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer text-[10px] ${
                            sharedPosts[item.id] ? 'text-[#00D1FF] font-bold' : 'text-slate-505 hover:text-cyan-405'
                          }`}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${sharedPosts[item.id] ? 'text-[#00D1FF] animate-pulse' : 'text-slate-550'}`} />
                          <span>{Math.round(item.shares).toLocaleString()}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (activeReplyPostId === item.id) {
                            setActiveReplyPostId(null);
                          } else {
                            setActiveReplyPostId(item.id);
                          }
                        }}
                        className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-305 font-bold cursor-pointer text-[10px]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>

                    {/* Interactive reply field */}
                    {activeReplyPostId === item.id && (
                      <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 space-y-2 mt-2">
                        <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-wider">Compose Executive Reply</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                            placeholder="Type constructive response, marketing hype, or snappy comeback..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                          <select
                            value={replyTone}
                            onChange={(e) => setReplyTone(e.target.value as any)}
                            className="bg-slate-950 border border-slate-850 text-[10px] font-mono rounded-lg px-2 text-slate-350 focus:outline-none cursor-pointer"
                          >
                            <option value="HELPFUL">Helpful Tone (+2% Sentiment)</option>
                            <option value="HYPE">Hype Model (+2.5% Hype)</option>
                            <option value="SNAK_BACK">Sarcastic clapping (+4% Hype, -1.5% Rep)</option>
                          </select>
                          <button
                            onClick={() => handleSendReply(item.id)}
                            disabled={isGeneratingReply}
                            className="bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-slate-100 font-bold px-3 py-1 rounded-lg text-xs cursor-pointer transition-colors"
                          >
                            {isGeneratingReply ? '...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment charts & viral factors sidebar column */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Sentiment analytics chart card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-indigo-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800/80 pb-3 flex items-center gap-2 relative z-10 font-mono uppercase tracking-wider">
            <BadgeInfo className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            Active Sentiment Index
          </h4>

          <div className="space-y-4 font-mono text-xs relative z-10">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Global Score:</span>
              <span id="social_sentiment_score" className="font-bold text-slate-205 text-sm">{state.globalPublicSentiment}%</span>
            </div>
            
            {/* Sentiment progress bar */}
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div 
                className={`h-full transition-all duration-500 ${state.globalPublicSentiment > 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : state.globalPublicSentiment > 45 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
                style={{ width: `${state.globalPublicSentiment}%` }}
              />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 font-sans">
              {state.globalPublicSentiment > 70 
                ? '🟢 Peak Reputation. Developers are publishing benchmark tutorials on YouTube. Product adoption is boosted by +30%.' 
                : state.globalPublicSentiment > 45 
                  ? '🟡 Balanced. Normal market perception. Standard pricing is recommended.' 
                  : '🔴 Public backlash! Critics accuse you of toxic scraping, poor alignment, or pricing gouging. Customer acquisition rates are severely choked.'}
            </div>
          </div>
        </div>

        {/* Social Influence & Viral Reach Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-fuchsia-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-fuchsia-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800/80 pb-3 flex items-center gap-2 relative z-10 font-mono uppercase tracking-wider">
            <Sparkles className="h-4.5 w-4.5 text-fuchsia-400 animate-pulse" />
            Social Influence
          </h4>

          <div className="space-y-4 font-mono text-xs relative z-10">
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400 font-bold">Total Followers:</span>
              <span className="font-bold text-fuchsia-300 text-sm">{(state.socialFollowers || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Trending Hashtag:</span>
              <span className="font-bold text-cyan-400 text-sm">{state.trendingHashtag || '#AGI'}</span>
            </div>
            
            <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 font-sans">
              Include the trending hashtag in your broadcasts for massive organic reach and viral hype bonuses.
            </div>
          </div>
        </div>

        {/* Live model specs parsing cards */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent pointer-events-none rounded-[inherit]" />
          
          <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800/80 pb-3 flex items-center gap-2 relative z-10 font-mono uppercase tracking-wider">
            <Zap className="h-4.5 w-4.5 text-cyan-405 animate-pulse" />
            Active Distribution Node
          </h4>

          {currentActiveModel ? (
            <div className="space-y-3 font-mono text-xs relative z-10">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Deployed Model</span>
                <span id="active_matrix_model" className="font-bold text-indigo-300 block text-wrap">{currentActiveModel.name}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Distribution:</span>
                  {currentActiveModel && currentActiveModel.isDeployed && currentActiveModel.activeDeployments && (
                    <span className="text-slate-205 font-bold text-right text-[10px] uppercase">{currentActiveModel.activeDeployments.map(d => d.replace(/_/g, ' ')).join(' + ')}</span>
                  )}
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500">Bench Average:</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round((currentActiveModel.benchmarks.mmlu + currentActiveModel.benchmarks.humanEval + currentActiveModel.benchmarks.gsm8k) / 3)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-950/60 border border-slate-850 text-slate-505 font-mono text-[10px] rounded-xl relative z-10">
              Telemetry Offline. No model currently active on servers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
