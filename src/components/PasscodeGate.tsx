import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, Sparkles, CloudRain, ShieldCheck, Heart, AlertCircle, Compass } from "lucide-react";

interface PasscodeGateProps {
  onSuccess: () => void;
}

// Sparkly chime sound when passcode is correct
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const time = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.8);
    });
  } catch (err) {
    console.error("Success audio failed:", err);
  }
}

// Warm cute tap feedback sound
function playTapSound(isError = false) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isError) {
      // Dull low buzzer frequency
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
    } else {
      // Sweet bell-like sine tap
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5 high bell
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.error("Tap sound error:", err);
  }
}

export default function PasscodeGate({ onSuccess }: PasscodeGateProps) {
  const [phase, setPhase] = useState<"loading" | "passcode">("loading");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("กำลังเชื่อมต่อเครือข่ายความรักของก้าว...");
  const [pin, setPin] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // 1. Beautiful Loading Progress Sequence
  useEffect(() => {
    let currentProgress = 0;
    const textSequence = [
      { max: 25, text: "กำลังเตรียมความสดใสพาสเทลให้พี่ไอซ์... 💙" },
      { max: 55, text: "กำลังกางร่มตรวจจับความเร็วลมพายุฝน... 🌧️⚡" },
      { max: 80, text: "กำลังจูนกล่องเพลง 'จักรวาลไหน' ให้คลายเหงา... 🎵" },
      { max: 100, text: "ประตูมิติเตรียมปลดล็อกความน่ารัก 100% แล้ว! 🔒" }
    ];

    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 5) + 2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setPhase("passcode");
        }, 600);
      }
      
      setLoadingProgress(currentProgress);

      const matchingText = textSequence.find(seq => currentProgress <= seq.max);
      if (matchingText) {
        setLoadingText(matchingText.text);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 2. PIN Validation Logic
  const handleDigitPress = (digit: string) => {
    if (pin.length >= 4 || isError) return;
    playTapSound(false);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === "6107") {
        setTimeout(() => {
          playSuccessChime();
          onSuccess();
        }, 200);
      } else {
        // Shaking error feedback
        setTimeout(() => {
          setIsError(true);
          playTapSound(true);
          setAttempts(prev => prev + 1);
          setTimeout(() => {
            setPin("");
            setIsError(false);
          }, 850); // reset after shake animation finishes
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length === 0 || isError) return;
    playTapSound(false);
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (isError) return;
    playTapSound(false);
    setPin("");
  };

  // Keyboard support for convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "passcode") return;
      if (/[0-9]/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, phase, isError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4 font-sans select-none">
      
      {/* Interactive dreamy background elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-sky-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />

      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 relative z-10"
          >
            {/* Spinning & pulsing cozy rain cloud logo */}
            <div className="relative">
              <span className="absolute animate-ping inset-0 bg-sky-500/10 rounded-full inline-flex"></span>
              <div className="w-20 h-20 bg-gradient-to-tr from-sky-500/20 to-sky-400/10 border border-sky-400/30 rounded-2xl flex items-center justify-center text-sky-400 shadow-lg relative z-10">
                <CloudRain className="w-10 h-10 animate-bounce text-sky-300" />
              </div>
            </div>

            <div className="space-y-1.5 w-full">
              <h3 className="text-xl font-black bg-gradient-to-r from-sky-400 to-cyan-200 bg-clip-text text-transparent">
                Compatibility Analyzer
              </h3>
              <p className="text-xs text-slate-400 tracking-wider font-semibold uppercase">
                Kao 🪐 Ice Portal
              </p>
            </div>

            {/* Custom high-fidelity loading bar */}
            <div className="w-full space-y-2">
              <div className="w-full h-2.5 bg-slate-950/80 rounded-full p-0.5 border border-slate-800/80 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-300 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>SYSTEM ONLINE</span>
                <span className="text-sky-400 font-bold">{loadingProgress}%</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-sky-200/90 font-medium h-6 animate-pulse">
              {loadingText}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="passcode-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm bg-slate-900/40 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-6 sm:space-y-7 relative z-10"
          >
            {/* Beautiful Status Header */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <motion.div 
                animate={isError ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-lg transition-colors ${
                  isError 
                    ? "bg-rose-500/20 border-rose-500 text-rose-400" 
                    : pin.length === 4 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                    : "bg-sky-500/10 border-sky-400/30 text-sky-400"
                }`}
              >
                {pin.length === 4 && !isError ? (
                  <Unlock className="w-6 h-6 animate-pulse" />
                ) : isError ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </motion.div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบ 🔐
                </h3>
                <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                  ป้อนรหัสยืนยัน 4 หลัก เพื่อผ่านทางเข้าสู่แดนสวรรค์ของก้าวและพี่ไอซ์
                </p>
              </div>
            </div>

            {/* Glowing PIN Dots */}
            <div className="flex justify-center gap-4.5 py-2">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                      isError
                        ? "border-rose-500/80 bg-rose-950/40 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                        : filled
                        ? "border-sky-400 bg-sky-950/50 shadow-[0_0_15px_rgba(56,189,248,0.35)]"
                        : "border-slate-800 bg-slate-950/60"
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      {filled ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: "spring", stiffness: 350, damping: 15 }}
                          className="text-sky-400"
                        >
                          <Heart className="w-5 h-5 fill-current animate-pulse text-sky-400" />
                        </motion.div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Helper Text Hints */}
            <div className="h-5 text-center flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isError ? (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-xs text-rose-400 font-bold flex items-center gap-1"
                  >
                    รหัสผ่านไม่ถูกต้อง! ลองใหม่อีกครั้งนะจ๊ะ ❌
                  </motion.span>
                ) : attempts >= 2 ? (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-[11px] text-sky-400 font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>คำใบ้: วันสำคัญแสนพิเศษ หรือแอบถามก้าวดูสิ 🤫 (PIN: 6107)</span>
                  </motion.span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    className="text-[10px] text-slate-500 tracking-wider font-mono uppercase"
                  >
                    SECURE ENCRYPTED PORTAL
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Beautiful Tonal Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitPress(num)}
                  disabled={isError}
                  className="h-14 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 active:bg-sky-500/20 active:border-sky-500/30 text-white rounded-2xl text-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 duration-100 disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg hover:shadow-sky-500/5 focus:outline-none"
                >
                  {num}
                </button>
              ))}
              
              {/* Backspace Button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isError}
                className="h-14 bg-slate-950/40 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white rounded-2xl text-sm font-semibold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
              >
                ลบ
              </button>

              {/* Zero Button */}
              <button
                type="button"
                onClick={() => handleDigitPress("0")}
                disabled={isError}
                className="h-14 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 active:bg-sky-500/20 active:border-sky-500/30 text-white rounded-2xl text-xl font-bold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 duration-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
              >
                0
              </button>

              {/* Clear/Reset Button */}
              <button
                type="button"
                onClick={handleClear}
                disabled={isError}
                className="h-14 bg-slate-950/40 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white rounded-2xl text-sm font-semibold flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none"
              >
                ล้าง
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-600 tracking-wider flex items-center gap-1 justify-center">
                <Compass className="w-3 h-3 text-slate-600 animate-spin" />
                PROTECTED BY THE ROMANTIC GUARDIAN SHIELD
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
