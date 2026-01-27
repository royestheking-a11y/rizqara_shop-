import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'loading' | 'fadeout'>('loading');

  useEffect(() => {
    // Shorter simpler timing
    const timer = setTimeout(() => {
      setStage('fadeout');
      setTimeout(onComplete, 800); // Allow fadeout animation to finish
    }, 2000); // 2 seconds total display time

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'fadeout' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
        >
          <div className="relative flex flex-col items-center">
            {/* Centered Icon with Premium Pulse Effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.1, 1],
                opacity: 1
              }}
              transition={{
                duration: 1.2,
                times: [0, 0.6, 1],
                ease: "easeOut"
              }}
              className="relative w-32 h-32 md:w-40 md:h-40"
            >
              {/* Pulsing Background Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#D91976] rounded-3xl blur-3xl opacity-20"
              />

              {/* Main Icon */}
              <div className="relative w-full h-full bg-gradient-to-br from-[#D91976] to-[#A8145A] rounded-3xl p-4 shadow-2xl flex items-center justify-center">
                <ShoppingBag size={64} className="text-white drop-shadow-md" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
