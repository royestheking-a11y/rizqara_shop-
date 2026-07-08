import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [stage, setStage] = useState<'loading' | 'fadeout'>('loading');

  useEffect(() => {
    // Keep it showing for 2 seconds like the previous splash screen, then fade out
    const timer = setTimeout(() => {
      setStage('fadeout');
      setTimeout(() => {
        onComplete?.();
      }, 400); // 0.4 seconds to match the fade out transition duration
    }, 2000); 

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage === 'loading' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-white"
        >
          {/* Decorative Radial Background Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 bg-[#F48FB1]/15"
            />
            <div
              className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 bg-[#E91E8C]/10"
            />
          </div>
          {/* Subtle background color overlay */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#fff6f9] via-[#fffbfd] to-[#fff1f5]"
          />
          {/* Clover / Flower Spinner in Center */}
          <div className="relative z-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Spinning container */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "linear",
                }}
                className="w-20 h-20 flex items-center justify-center"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="petal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F48FB1" />
                      <stop offset="100%" stopColor="#E91E8C" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(50, 50)">
                    {/* 6 overlapping translucent petals */}
                    {[...Array(6)].map((_, i) => {
                      const angle = i * 60;
                      return (
                        <g key={i} transform={`rotate(${angle})`}>
                          <circle
                            cx="0"
                            cy="-18"
                            r="15"
                            fill="url(#petal-grad)"
                            opacity="0.65"
                            style={{
                              mixBlendMode: "multiply",
                            }}
                          />
                        </g>
                      );
                    })}
                    {/* Center core mask to form hollow ring effect */}
                    <circle cx="0" cy="0" r="7" className="fill-white" />
                  </g>
                </svg>
              </motion.div>
            </div>
            
            {/* Extremely minimal text */}
            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold mt-6 animate-pulse text-gray-400 pl-[0.3em] select-none">
              Loading
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
