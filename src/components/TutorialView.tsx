import React from 'react';
import { Play, ExternalLink, ShieldCheck, Gamepad2, CheckSquare, Wallet, Sparkles, AlertCircle } from 'lucide-react';
import { TabType } from './Navbar';

interface TutorialViewProps {
  fbVideoUrl?: string;
  onSelectTab: (tab: TabType) => void;
}

// Helper to convert raw FB reel or video link into a playable iframe embed URL
function getFbVideoIframeSrc(rawUrl?: string): string {
  const defaultUrl = 'https://www.facebook.com/reel/1148805566373760';
  let url = (rawUrl || defaultUrl).trim();

  // If pasted an iframe tag, extract src="..."
  if (url.includes('<iframe') || url.includes('src=')) {
    const match = url.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      url = match[1];
    }
  }

  // If already an embed link (FB plugins, YouTube embed, Vimeo), return directly
  if (
    url.includes('facebook.com/plugins/video.php') ||
    url.includes('facebook.com/plugins/post.php') ||
    url.includes('youtube.com/embed/') ||
    url.includes('player.vimeo.com')
  ) {
    return url;
  }

  // If it is a standard YouTube watch link or short, convert to embed
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // Otherwise, treat as Facebook URL and wrap in video.php plugin
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&t=0`;
}

// Helper to extract clean raw watch URL for "Open directly in FB app"
function getRawFbUrl(rawUrl?: string): string {
  const defaultUrl = 'https://www.facebook.com/reel/1148805566373760';
  let url = (rawUrl || defaultUrl).trim();
  if (url.includes('<iframe') || url.includes('src=')) {
    const match = url.match(/src=["']([^"']+)["']/);
    if (match && match[1]) url = match[1];
  }
  if (url.includes('facebook.com/plugins/video.php') && url.includes('href=')) {
    try {
      const parsed = new URL(url);
      const href = parsed.searchParams.get('href');
      if (href) return decodeURIComponent(href);
    } catch {
      // ignore
    }
  }
  return url;
}

export const TutorialView: React.FC<TutorialViewProps> = ({
  fbVideoUrl = 'https://www.facebook.com/reel/1148805566373760',
  onSelectTab,
}) => {
  const iframeSrc = getFbVideoIframeSrc(fbVideoUrl);
  const rawUrl = getRawFbUrl(fbVideoUrl);

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center space-y-2 bg-gradient-to-b from-[#25150e] to-[#180d09] p-5 rounded-3xl border border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Official Guide & Video</span>
        </div>
        
        <h1 className="text-2xl font-black text-amber-100 tracking-tight">
          ভিডিও দেখুন! (Tutorial)
        </h1>
        <p className="text-xs text-amber-300/80 leading-relaxed font-sans font-medium">
          কিভাবে কাজ করবেন, কয়েন আয় করবেন এবং বিকাশ/নগদে টাকা উত্তোলন করবেন তার পূর্ণাঙ্গ ভিডিও টিউটোরিয়াল এখানে দেখুন!
        </p>
      </div>

      {/* Video Player Container (9:16 Vertical Reel Format / Responsive) */}
      <div className="bg-[#140b08] p-3 rounded-3xl border-2 border-amber-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-3">
        <div className="flex items-center justify-between px-2 py-1 border-b border-[#3e2316]">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Facebook Short / Reel Video</span>
          </span>
          <span className="text-[10px] font-mono text-amber-400/70 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
            HD Stream
          </span>
        </div>

        {/* Embedded Video Iframe */}
        <div className="relative w-full aspect-[9/16] max-h-[520px] rounded-2xl overflow-hidden bg-black border border-[#4a2818] shadow-inner flex items-center justify-center">
          <iframe
            src={iframeSrc}
            title="XN Reward Tutorial Video"
            width="100%"
            height="100%"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Fallback & Direct App Opener */}
        <div className="pt-1">
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1877f2] to-[#0d55b8] hover:from-[#1b84ff] hover:to-[#1877f2] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>ফেইসবুক অ্যাপে সরাসরি ভিডিও দেখুন (Open in FB App) ↗</span>
          </a>
          <p className="text-[11px] text-amber-400/70 text-center mt-1.5 font-sans">
            💡 বিঃদ্রঃ ভিডিও লোড হতে সময় লাগলে উপরের নীল বাটনে ক্লিক করে সরাসরি ফেইসবুকে দেখুন।
          </p>
        </div>
      </div>

      {/* Quick 3-Step Earning Summary Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-amber-200 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>৩টি সহজ নিয়মে প্রতিদিন আয় করুন</span>
        </h3>

        <div className="bg-[#21120b] p-3.5 rounded-2xl border border-[#4a2818] flex items-start gap-3 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black shrink-0">
            ১
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-100 flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5 text-orange-400" />
              <span>এয়ারড্রপ মাইনিং (AirDrop Mining)</span>
            </h4>
            <p className="text-[11px] text-amber-300/70 mt-0.5 leading-relaxed font-sans">
              মাঝখানের AirDrop বাটনে গিয়ে ট্যাপ করে $NXB কয়েন মাইন করুন এবং এনার্জি ও হিট লেভেল আপগ্রেড করে ইনকাম বাড়ান।
            </p>
          </div>
        </div>

        <div className="bg-[#21120b] p-3.5 rounded-2xl border border-[#4a2818] flex items-start gap-3 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black shrink-0">
            ২
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-100 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>টাস্ক পূরণ ও বোনাস (Daily Tasks)</span>
            </h4>
            <p className="text-[11px] text-amber-300/70 mt-0.5 leading-relaxed font-sans">
              Task অপশনে গিয়ে টেলিগ্রাম ও ইউটিউব চ্যানেলে জয়েন করে স্ক্রিনশট জমা দিন। ভেরিফাই হলেই বড় কয়েন বোনাস পাবেন।
            </p>
          </div>
        </div>

        <div className="bg-[#21120b] p-3.5 rounded-2xl border border-[#4a2818] flex items-start gap-3 shadow-md">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black shrink-0">
            ৩
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-100 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>বিকাশ/নগদে ক্যাশআউট (Withdraw Cash)</span>
            </h4>
            <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed font-sans">
              পর্যাপ্ত কয়েন বা রেফারেল টাকা জমা হলে Withdraw অপশন থেকে সরাসরি আপনার বিকাশ, নগদ বা রকেটে পেমেন্ট নিন।
            </p>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="pt-2 grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelectTab('airdrop')}
          className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>মাইনিং করুন</span>
        </button>

        <button
          onClick={() => onSelectTab('task')}
          className="py-3 px-4 rounded-2xl bg-[#25150e] border border-amber-500/50 hover:border-amber-400 text-amber-100 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckSquare className="w-4 h-4 text-amber-400" />
          <span>টাস্ক দেখুন</span>
        </button>
      </div>
    </div>
  );
};
