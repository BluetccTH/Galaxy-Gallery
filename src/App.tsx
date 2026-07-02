import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Edit2,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Upload,
  Music,
  Maximize2,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { GalaxyConfig, GalleryPanel } from "./types";
import { DEFAULT_CONFIG } from "./defaultConfig";
import { getAssetUrl } from "./utils";
import { cosmicAudio } from "./audio";
import GalaxyViewer from "./components/GalaxyViewer";
import PasscodeGate from "./components/PasscodeGate";

export default function App() {
  // Try loading from localStorage, fallback to DEFAULT_CONFIG
  const [config, setConfig] = useState<GalaxyConfig>(() => {
    const saved = localStorage.getItem("galaxy-gallery-config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically migrate any old Unsplash URLs or relative paths to the correct newly uploaded public images
        if (parsed) {
          if (parsed.musicTrackName === "lolivac eternal-love") {
            parsed.musicTrackName = "I Really Want to Stay at Your House";
          }
          if (Array.isArray(parsed.panels)) {
            parsed.panels = parsed.panels.map((p: any) => {
              if (p.id === "panel-1" && (p.photoUrl.includes("unsplash.com") || p.photoUrl === "./IMG_5611.jpg")) {
                p.photoUrl = "/IMG_5611.jpg";
              } else if (p.id === "panel-2" && (p.photoUrl.includes("unsplash.com") || p.photoUrl === "./IMG_5472.jpg")) {
                p.photoUrl = "/IMG_5472.jpg";
              } else if (p.id === "panel-3" && (p.photoUrl.includes("unsplash.com") || p.photoUrl === "./IMG_5471.jpg")) {
                p.photoUrl = "/IMG_5471.jpg";
              } else if (p.id === "panel-4" && (p.photoUrl.includes("unsplash.com") || p.photoUrl === "./IMG_3239.jpg")) {
                p.photoUrl = "/IMG_3239.jpg";
              }
              return p;
            });
          }
        }
        return parsed;
      } catch (e) {
        console.error("Failed parsing saved config, using default", e);
      }
    }
    return DEFAULT_CONFIG;
  });

  // UI state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [warpProgress, setWarpProgress] = useState(0);
  const [warpText, setWarpText] = useState("");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [focusedPanel, setFocusedPanel] = useState<GalleryPanel | null>(null);
  const [activeTab, setActiveTab] = useState<"portal" | "music" | "phrases" | "panels">("panels");

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem("galaxy-gallery-config", JSON.stringify(config));
    
    // Update document title dynamically based on pageName
    if (config.pageName) {
      document.title = config.pageName;
    }
  }, [config]);

  // Sync music toggle with audio engine
  useEffect(() => {
    if (hasStarted) {
      if (config.includeMusic && isMusicPlaying) {
        cosmicAudio.start();
        cosmicAudio.setVolume(0.3);
      } else {
        cosmicAudio.stop();
      }
    }
    return () => {
      if (!hasStarted) cosmicAudio.stop();
    };
  }, [hasStarted, isMusicPlaying, config.includeMusic]);

  // Handle Enter Galaxy click with cinematic opening warp effect
  const handleEnterGalaxy = () => {
    setIsWarping(true);
    setWarpProgress(0);
    setWarpText("📡 ESTABLISHING CELESTIAL QUANTUM LINK...");

    if (config.includeMusic) {
      setIsMusicPlaying(true);
      cosmicAudio.start();
      cosmicAudio.setVolume(0.05); // Start quiet, fade in nicely
    }

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 1;
      setWarpProgress(currentProg);

      // Smoothly fade in audio volume as we warp through the wormhole
      if (config.includeMusic) {
        cosmicAudio.setVolume(0.05 + (currentProg / 100) * 0.25);
      }

      // Staggered cinematic messages
      if (currentProg === 15) {
        setWarpText("✨ ALIGNING EVENT HORIZON APERTURE / กำลังจัดแนวเส้นขอบฟ้าเหตุการณ์...");
      } else if (currentProg === 35) {
        setWarpText("💫 UNFOLDING CHRONOS MEMORIES / กำลังคลี่คลายกล่องความทรงจำแห่งกาลเวลา...");
      } else if (currentProg === 55) {
        setWarpText("🌀 ACCELERATING THROUGH COGNITIVE NEBULA / กำลังขับเคลื่อนผ่านเนบิวลาแห่งความคิดถึง...");
      } else if (currentProg === 75) {
        setWarpText("🔥 COLLAPSING DISTANCE TO ZERO / กำลังบิดระยะทางระหว่างใจสองดวงให้เป็นศูนย์...");
      } else if (currentProg === 92) {
        setWarpText("✦ PORTAL ENERGIZE! INITIALIZING FINAL DIMENSIONAL JUMP ✦");
      }

      if (currentProg >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setHasStarted(true);
          setIsWarping(false);
        }, 1200); // Hold at 100% for a brief moment for perfect dramatic timing
      }
    }, 32); // Beautiful 3.2 seconds transition
  };

  // Toggle audio directly
  const handleToggleMusic = () => {
    setIsMusicPlaying((prev) => !prev);
  };

  // Reset config to factory settings
  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to reset all customizations to the original romantic template?")) {
      setConfig(DEFAULT_CONFIG);
      localStorage.removeItem("galaxy-gallery-config");
    }
  };

  // State handlers for configuration edits
  const updateConfigField = <K extends keyof GalaxyConfig>(field: K, value: GalaxyConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Phrase handlers
  const handleAddPhrase = () => {
    if (config.phrases.length >= 10) return;
    setConfig((prev) => ({
      ...prev,
      phrases: [...prev.phrases, "NEW PHRASE ✦"],
    }));
  };

  const handleRemovePhrase = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      phrases: prev.phrases.filter((_, i) => i !== idx),
    }));
  };

  const handlePhraseChange = (idx: number, val: string) => {
    setConfig((prev) => {
      const updated = [...prev.phrases];
      updated[idx] = val.toUpperCase(); // Maintain beautiful display caps
      return { ...prev, phrases: updated };
    });
  };

  // Panel handlers
  const handlePanelChange = (panelId: string, updatedFields: Partial<GalleryPanel>) => {
    setConfig((prev) => ({
      ...prev,
      panels: prev.panels.map((p) => (p.id === panelId ? { ...p, ...updatedFields } : p)),
    }));
  };

  // File drag-and-drop & manual upload processor
  const handlePhotoUpload = (panelId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        handlePanelChange(panelId, { photoUrl: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-screen h-screen bg-[#020205] text-slate-100 overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="lock-gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50"
          >
            <PasscodeGate onSuccess={() => setIsUnlocked(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="portal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {/* 1. START SCREEN / WORMHOLE PORTAL */}
            <AnimatePresence>
        {!hasStarted && (
          <motion.div
            id="start-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#020205] galaxy-bg"
          >
            {/* Elegant Dark Nebula Backdrops */}
            <div className="absolute w-[600px] h-[600px] nebula-purple top-[-100px] left-[-100px] rounded-full pointer-events-none opacity-60" />
            <div className="absolute w-[600px] h-[600px] nebula-orange bottom-[-100px] right-[-100px] rounded-full pointer-events-none opacity-60" />

            {/* Floating Ambient Phrases */}
            {config.phrases.slice(0, 4).map((phrase, idx) => {
              const positions = [
                "top-[15%] left-[10%]",
                "top-[20%] right-[15%]",
                "bottom-[25%] left-[20%]",
                "bottom-[40%] right-[10%]",
              ];
              return (
                <div
                  key={idx}
                  className={`absolute font-serif italic uppercase tracking-[0.3em] text-[12px] text-white/30 select-none pointer-events-none ${positions[idx]}`}
                >
                  {phrase}
                </div>
              );
            })}

            {/* Drifting stellar mesh backdrop */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,99,71,0.1),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
            
            {/* Ambient Star Cluster */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=1920')] bg-cover opacity-10 mix-blend-color-dodge pointer-events-none" />

            {/* Glowing Center Core */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-72 h-72 rounded-full bg-orange-500/10 blur-3xl"
            />

            {/* Content Card */}
            <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
              {/* Subtle Icon Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[#ffceb5] shadow-lg shadow-[#ffceb5]/5"
              >
                <Heart className="w-8 h-8 fill-[#ffceb5]/10 text-[#ffceb5] animate-pulse" />
              </motion.div>

              {/* Start Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-4xl md:text-6xl font-serif font-light italic text-[#ffceb5] mb-4 leading-tight tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              >
                {config.startTitle}
              </motion.h1>

              {/* Start Subtitle */}
              {config.startSubtitle && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-sm md:text-base text-slate-400 font-serif italic tracking-wide max-w-md mb-12 leading-relaxed"
                >
                  {config.startSubtitle}
                </motion.p>
              )}

              {/* Music Selection Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-8 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg"
              >
                <input
                  type="checkbox"
                  id="start-music-toggle"
                  checked={config.includeMusic}
                  onChange={(e) => updateConfigField("includeMusic", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 text-[#ffceb5] focus:ring-[#ffceb5]/30 focus:ring-offset-0 bg-slate-950 cursor-pointer"
                />
                <label htmlFor="start-music-toggle" className="text-xs text-slate-300 font-mono flex items-center gap-2 cursor-pointer select-none">
                  <Music className="w-3.5 h-3.5 text-[#ffceb5]" />
                  Soundtrack: <span className="text-[#ffceb5] font-semibold">{config.musicTrackName}</span>
                </label>
              </motion.div>

              {/* Enter Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnterGalaxy}
                className="px-8 py-3.5 bg-white/5 hover:bg-white border border-white/20 hover:border-white text-white hover:text-[#020205] rounded-full font-mono tracking-[0.2em] text-xs uppercase shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4 text-[#ffceb5]" />
                Enter Galaxy
              </motion.button>
            </div>

            {/* Creator Attribution */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-6 text-center text-[10px] tracking-widest font-mono text-slate-500 uppercase"
            >
              Orbiting Memorial 3D Frame Engine • Built for {config.pageName}
            </motion.div>

            {/* Cinematic Warp Wormhole Transition Overlay */}
            <AnimatePresence>
              {isWarping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={
                    warpProgress >= 85
                      ? { x: [0, -5, 5, -4, 4, -2, 2, 0], y: [0, 5, -5, 4, -4, 2, -2, 0] }
                      : warpProgress >= 60
                      ? { x: [0, -2, 2, -2, 2, 0], y: [0, 2, -2, 2, -2, 0] }
                      : { x: 0, y: 0 }
                  }
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: warpProgress >= 85 ? 0.07 : 0.12,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 z-50 bg-[#020205] flex flex-col items-center justify-center overflow-hidden"
                >
                  {/* Rotating Color Vortices (spin faster and scale up as progress increases) */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                    <div
                      className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-purple-900/40 via-transparent to-orange-600/30 opacity-70 mix-blend-screen transition-all duration-300 ease-out"
                      style={{
                        transform: `rotate(${warpProgress * 4.5}deg) scale(${1 + (warpProgress / 100) * 0.8})`,
                        filter: `blur(${40 - (warpProgress / 100) * 15}px)`,
                      }}
                    />
                    <div
                      className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-indigo-950/50 via-transparent to-red-500/20 opacity-60 mix-blend-screen transition-all duration-300 ease-out"
                      style={{
                        transform: `rotate(${-warpProgress * 6}deg) scale(${1.1 + (warpProgress / 100) * 0.5})`,
                        filter: `blur(${50 - (warpProgress / 100) * 20}px)`,
                      }}
                    />
                  </div>

                  {/* Expanding space warp tunnel rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
                        animate={{
                          scale: [0.1, 4.0],
                          opacity: [0, 0.7, 0.4, 0],
                          rotate: [0, 360 + i * 45],
                        }}
                        transition={{
                          duration: 1.8 - (warpProgress / 100) * 0.6, // Tunnel speeds up as warp speeds up
                          repeat: Infinity,
                          delay: i * 0.28,
                          ease: "easeOut",
                        }}
                        className="absolute w-72 h-72 rounded-full border border-dashed border-[#ffceb5]/25"
                        style={{
                          boxShadow: "0 0 50px rgba(255, 206, 181, 0.08), inset 0 0 50px rgba(255, 110, 60, 0.03)",
                        }}
                      />
                    ))}
                  </div>

                  {/* Pulsing Central Event Horizon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        "0 0 70px 15px rgba(255,206,181,0.15)",
                        "0 0 120px 40px rgba(255,110,60,0.4)",
                        "0 0 70px 15px rgba(255,206,181,0.15)",
                      ],
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-14 h-14 rounded-full bg-white flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ffceb5] to-[#ff7e40] animate-pulse" />
                  </motion.div>

                  {/* Group 1: Standard space dust zooming outwards */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 40 }).map((_, idx) => {
                      const angle = (idx / 40) * Math.PI * 2 + (idx * 0.15);
                      return (
                        <motion.div
                          key={`dust-${idx}`}
                          initial={{ x: 0, y: 0, scaleX: 0.1, opacity: 0 }}
                          animate={{
                            x: Math.cos(angle) * 700,
                            y: Math.sin(angle) * 700,
                            scaleX: [0.1, 2.5, 0.1],
                            opacity: [0, 0.8, 0.8, 0],
                          }}
                          transition={{
                            duration: 1.4 - (warpProgress / 100) * 0.6, // accelerate speed
                            repeat: Infinity,
                            delay: Math.random() * 1.5,
                            ease: "easeIn",
                          }}
                          className="absolute w-4 h-[1px] bg-gradient-to-r from-transparent via-[#ffceb5]/60 to-white"
                          style={{
                            rotate: `${(angle * 180) / Math.PI}deg`,
                            transformOrigin: "left center",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Group 2: Blazing hyper-speed lines (fades in and dominates as acceleration reaches peak) */}
                  {warpProgress > 30 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 50 }).map((_, idx) => {
                        const angle = (idx / 50) * Math.PI * 2 + Math.random() * 0.4;
                        const length = 120 + Math.random() * 180;
                        const duration = (0.5 + Math.random() * 0.4) * (1 - (warpProgress / 150));
                        return (
                          <motion.div
                            key={`hyper-${idx}`}
                            initial={{ x: 0, y: 0, scaleX: 0.1, opacity: 0 }}
                            animate={{
                              x: Math.cos(angle) * 900,
                              y: Math.sin(angle) * 900,
                              scaleX: [0.1, 4.5, 0.1],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: Math.max(0.15, duration),
                              repeat: Infinity,
                              delay: Math.random() * 0.8,
                              ease: "easeIn",
                            }}
                            className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-[#ff7e40] to-white"
                            style={{
                              width: `${length}px`,
                              rotate: `${(angle * 180) / Math.PI}deg`,
                              transformOrigin: "left center",
                              opacity: (warpProgress - 30) / 70, // increase density as warp builds up
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Center Content Indicator */}
                  <div className="relative z-10 text-center px-6">
                    {/* Pulsing Heart in Singularity */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 360],
                      }}
                      transition={{
                        scale: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 15, repeat: Infinity, ease: "linear" }
                      }}
                      className="inline-block mb-8 p-4 rounded-full bg-[#ffceb5]/5 border border-[#ffceb5]/20 backdrop-blur-md"
                    >
                      <Heart className="w-10 h-10 fill-[#ffceb5] text-[#ffceb5] drop-shadow-[0_0_15px_rgba(255,206,181,0.8)]" />
                    </motion.div>

                    {/* Progress percentage */}
                    <motion.div
                      key={warpProgress}
                      initial={{ scale: 0.85, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl md:text-8xl font-serif font-light text-[#ffceb5] tracking-widest mb-4 font-mono select-none drop-shadow-[0_0_20px_rgba(255,206,181,0.3)]"
                    >
                      {warpProgress}%
                    </motion.div>

                    {/* Glowing Progress bar */}
                    <div className="w-64 h-[3px] bg-white/10 rounded-full mx-auto mb-8 overflow-hidden relative shadow-[0_0_10px_rgba(255,110,60,0.2)]">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 via-[#ffceb5] to-white"
                        style={{ width: `${warpProgress}%` }}
                      />
                    </div>

                    {/* Beautiful transition status steps */}
                    <div className="h-16 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={warpText}
                          initial={{ y: 15, opacity: 0, filter: "blur(4px)" }}
                          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                          exit={{ y: -15, opacity: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="text-xs md:text-sm text-slate-300 font-mono tracking-[0.2em] uppercase max-w-lg leading-relaxed select-none text-center"
                        >
                          {warpText}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Dramatic white flash cover right before entry */}
                  {warpProgress >= 95 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-white z-50"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CORE INTERACTIVE 3D GALAXY WORLD */}
      {hasStarted && (
        <div className="absolute inset-0 w-full h-full flex">
          
          {/* ThreeJS Rendering Stage */}
          <div className="flex-1 h-full relative z-0">
            <GalaxyViewer
              config={config}
              onSelectPanel={(p) => setFocusedPanel(p)}
              focusedPanelId={focusedPanel?.id || null}
              onClearFocus={() => setFocusedPanel(null)}
            />



            {/* Core Controls Header Overlay */}
            <header className="absolute top-0 left-0 right-0 p-5 z-20 flex items-center justify-between pointer-events-none">
              {/* Left Brand Badge */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col gap-1.5 bg-[#020205]/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md pointer-events-auto shadow-xl"
              >
                <span className="uppercase tracking-[0.4em] text-[10px] text-white/50 block font-mono leading-none">
                  Page Name
                </span>
                <h1 className="font-serif text-3xl md:text-4xl italic leading-none font-light text-[#ffceb5]">
                  {config.pageName}
                </h1>
              </motion.div>

              {/* Right Global Option Controls */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 pointer-events-auto"
              >
                {/* Audio Toggler */}
                {config.includeMusic && (
                  <button
                    onClick={handleToggleMusic}
                    title={isMusicPlaying ? "Mute soundtrack" : "Unmute soundtrack"}
                    className="p-2.5 rounded-full bg-[#020205]/40 hover:bg-[#150e26]/50 border border-white/10 hover:border-[#ffceb5]/30 text-[#ffceb5] hover:text-white backdrop-blur-md shadow-lg transition-all duration-200"
                  >
                    {isMusicPlaying ? (
                      <div className="flex items-center gap-1">
                        <Volume2 className="w-5 h-5 text-[#ffceb5]" />
                        <span className="w-1.5 h-3 bg-[#ffceb5] animate-bounce inline-block rounded-full" />
                      </div>
                    ) : (
                      <VolumeX className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                )}

                {/* Reset Config */}
                <button
                  onClick={handleResetToDefault}
                  title="Reset to original template"
                  className="p-2.5 rounded-full bg-[#020205]/40 hover:bg-[#150e26]/50 border border-white/10 hover:border-[#ffceb5]/30 text-slate-400 hover:text-[#ffceb5] backdrop-blur-md shadow-lg transition-all duration-200"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>


              </motion.div>
            </header>
          </div>

          {/* 3. SIDEBAR CUSTOMIZER DRAWER */}
          <AnimatePresence>
            {isEditorOpen && (
              <motion.aside
                initial={{ x: "100%", opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="w-full md:w-[420px] h-full bg-[#020205]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col z-30 shadow-2xl relative"
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#ffceb5]" />
                    <h2 className="text-sm font-semibold tracking-wider uppercase font-sans text-white">
                      Galaxy Creator
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 text-slate-400 hover:text-white transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-white/5 bg-slate-950/20 text-xs">
                  <button
                    onClick={() => setActiveTab("portal")}
                    className={`flex-1 py-3 text-center border-b-2 font-mono uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "portal"
                        ? "border-[#ffceb5] text-[#ffceb5] bg-white/5 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                    }`}
                  >
                    Portal
                  </button>
                  <button
                    onClick={() => setActiveTab("music")}
                    className={`flex-1 py-3 text-center border-b-2 font-mono uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "music"
                        ? "border-[#ffceb5] text-[#ffceb5] bg-white/5 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                    }`}
                  >
                    Music
                  </button>
                  <button
                    onClick={() => setActiveTab("phrases")}
                    className={`flex-1 py-3 text-center border-b-2 font-mono uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "phrases"
                        ? "border-[#ffceb5] text-[#ffceb5] bg-white/5 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                    }`}
                  >
                    Phrases
                  </button>
                  <button
                    onClick={() => setActiveTab("panels")}
                    className={`flex-1 py-3 text-center border-b-2 font-mono uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "panels"
                        ? "border-[#ffceb5] text-[#ffceb5] bg-white/5 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
                    }`}
                  >
                    Panels ({config.panels.length})
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                  
                  {/* TAB: PORTAL */}
                  {activeTab === "portal" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Page/Web Name
                        </label>
                        <input
                          type="text"
                          value={config.pageName}
                          maxLength={35}
                          onChange={(e) => updateConfigField("pageName", e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <p className="text-[10px] text-slate-500 font-mono">
                          Appears in My Pages and browser tab: {config.pageName.length}/35
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Start Screen Title
                        </label>
                        <input
                          type="text"
                          value={config.startTitle}
                          maxLength={35}
                          onChange={(e) => updateConfigField("startTitle", e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <p className="text-[10px] text-slate-500 font-mono">
                          Large greeting title on the welcome screen: {config.startTitle.length}/35
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Start Screen Subtitle
                        </label>
                        <textarea
                          rows={3}
                          value={config.startSubtitle}
                          maxLength={60}
                          onChange={(e) => updateConfigField("startSubtitle", e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg p-3 text-sm text-white resize-none"
                        />
                        <p className="text-[10px] text-slate-500 font-mono">
                          Appears below the start title: {config.startSubtitle.length}/60
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: MUSIC */}
                  {activeTab === "music" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="include-music-check"
                          checked={config.includeMusic}
                          onChange={(e) => updateConfigField("includeMusic", e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-[#ffceb5] focus:ring-[#ffceb5]/30 focus:ring-offset-0 bg-slate-900 mt-1 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <label htmlFor="include-music-check" className="text-sm font-semibold text-white cursor-pointer select-none">
                            Include Background Music
                          </label>
                          <p className="text-xs text-slate-400">
                            Plays a beautiful, emotional space soundtrack ('I Really Want to Stay at Your House') when the gallery is active.
                          </p>
                        </div>
                      </div>

                      {config.includeMusic && (
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                            Song/Soundtrack Name
                          </label>
                          <input
                            type="text"
                            value={config.musicTrackName}
                            onChange={(e) => updateConfigField("musicTrackName", e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: PHRASES */}
                  {activeTab === "phrases" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Floating Phrases ({config.phrases.length}/10)
                        </span>
                        {config.phrases.length < 10 && (
                          <button
                            onClick={handleAddPhrase}
                            className="text-xs font-mono text-[#ffceb5] hover:text-[#ffceb5]/80 flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Phrase
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {config.phrases.map((phrase, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 w-5">
                              #{index + 1}
                            </span>
                            <input
                              type="text"
                              value={phrase}
                              maxLength={50}
                              onChange={(e) => handlePhraseChange(index, e.target.value)}
                              className="flex-1 bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono tracking-wider"
                              placeholder="E.G. ALWAYS WITH YOU ✦"
                            />
                            {config.phrases.length > 1 && (
                              <button
                                onClick={() => handleRemovePhrase(index)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-rose-400 transition-all duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono leading-relaxed mt-2">
                        Phrases automatically capitalize and render as floating glow textures orbiting in the outer regions of the galaxy.
                      </p>
                    </motion.div>
                  )}

                  {/* TAB: GALLERY PANELS */}
                  {activeTab === "panels" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Orbiting Memory Panels
                        </span>
                        <p className="text-xs text-[#ffceb5] font-mono">{config.panels.length} Orbiters active</p>
                      </div>

                      <div className="space-y-6">
                        {config.panels.map((panel, idx) => (
                          <div
                            key={panel.id}
                            className="p-4 bg-white/3 border border-white/15 rounded-xl space-y-4 hover:border-[#ffceb5]/30 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-semibold text-[#ffceb5]">
                                Panel {idx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-white/5">
                                Radius: {14 + idx * 4}
                              </span>
                            </div>

                            {/* Circular Photo Selection and Drag-Drop */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                                Photo *
                              </span>
                              <div className="flex items-center gap-4">
                                {/* Miniature Circle Preview */}
                                <div className="w-16 h-16 rounded-full border border-[#ffceb5]/30 overflow-hidden shrink-0 relative group bg-slate-950 flex items-center justify-center">
                                  {panel.photoUrl ? (
                                    <img
                                      src={getAssetUrl(panel.photoUrl)}
                                      alt="preview"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <Sparkles className="w-6 h-6 text-slate-600 animate-pulse" />
                                  )}
                                </div>

                                {/* Drag and drop dropzone with click to select */}
                                <div
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handlePhotoUpload(panel.id, file);
                                  }}
                                  className="flex-1 border border-dashed border-white/15 hover:border-[#ffceb5]/40 hover:bg-white/2 rounded-lg p-2.5 text-center cursor-pointer transition-all duration-200 relative"
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handlePhotoUpload(panel.id, file);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Upload className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    Click or Drag photo (1:1 recommended)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Panel Title */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                                Panel Title
                              </span>
                              <input
                                type="text"
                                value={panel.title}
                                maxLength={40}
                                onChange={(e) => handlePanelChange(panel.id, { title: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-white"
                                placeholder="E.g. Our First Kiss"
                              />
                            </div>

                            {/* Letter Message */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                                Letter Message
                              </span>
                              <textarea
                                rows={4}
                                value={panel.message}
                                maxLength={500}
                                onChange={(e) => handlePanelChange(panel.id, { message: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 focus:border-[#ffceb5] focus:ring-1 focus:ring-[#ffceb5]/30 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none leading-relaxed"
                                placeholder="Write a short letter..."
                              />
                              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                <span>Becomes orbiting core detail</span>
                                <span>{panel.message.length}/500</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer status */}
                <div className="p-4 bg-[#020205] border-t border-white/5 text-center text-[10px] font-mono text-slate-500 uppercase">
                  Data persists automatically to local storage
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* 4. IMMERSIVE ROMANTIC MEMORY MODAL (POPUP) */}
          <AnimatePresence>
            {focusedPanel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
              >
                {/* Clicking background exits detailed screen */}
                <div className="absolute inset-0 cursor-zoom-out" onClick={() => setFocusedPanel(null)} />

                {/* Card Container */}
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="relative w-full max-w-lg bg-[#020205]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50 flex flex-col p-6 md:p-8"
                >
                  {/* Subtle outer backdrop glow behind photo */}
                  <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#ff3e00]/10 blur-3xl" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#8b5cf6]/10 blur-3xl" />

                  {/* Close button */}
                  <button
                    onClick={() => setFocusedPanel(null)}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>

                  {/* Visual Portrait */}
                  <div className="flex flex-col items-center text-center">
                    
                    {/* Circle Frame with pulsing border */}
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-2 border-[#ffceb5] p-1.5 shadow-2xl mb-6 relative bg-slate-950">
                      <div className="absolute inset-0 rounded-full border border-[#ff3e00]/40 animate-pulse pointer-events-none" />
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        <img
                          src={getAssetUrl(focusedPanel.photoUrl)}
                          alt={focusedPanel.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="mb-2 px-3 py-1 bg-[#ff3e00]/10 border border-[#ff3e00]/20 rounded-full text-[10px] font-mono tracking-widest text-[#ffceb5] uppercase flex items-center gap-1.5">
                      <Heart className="w-2.5 h-2.5 fill-[#ff3e00] text-[#ff3e00]" />
                      Memory Orbit
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-serif font-light italic text-white mb-4 tracking-wide">
                      {focusedPanel.title}
                    </h3>

                    {/* Divider */}
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#ff3e00] to-transparent mb-6" />

                    {/* Letter Message Box */}
                    <p className="text-sm md:text-base text-slate-200/90 leading-relaxed font-serif font-light italic max-w-md bg-white/2 border border-white/5 p-6 rounded-2xl relative shadow-inner">
                      "{focusedPanel.message}"
                    </p>

                    {/* Orbit identifier footer */}
                    <span className="mt-6 text-[10px] font-mono text-slate-500 tracking-wider">
                      COSMIC LOG • PRESS ESC TO DISMISS
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Escape key to close modal or clear focus */}
          <EscapeListener onEscape={() => {
            if (focusedPanel) {
              setFocusedPanel(null);
            }
          }} />

        </div>
      )}
      </motion.div>
    )}
  </AnimatePresence>
</div>
  );
}

// Small functional helper to handle global key escape listeners safely
function EscapeListener({ onEscape }: { onEscape: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);

  return null;
}
