import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const LOGO_URL = "https://res.cloudinary.com/dnrljxeuv/image/upload/v1779204775/logo-final-presidence_1_rxim43.png";

export default function SplashScreen({ onFinish }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(false), 2400);
    const t2 = setTimeout(() => onFinish(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
          }}
        >
          {/* Animated rings */}
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-28 h-28 rounded-full border-2 border-white/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute w-28 h-28 rounded-full border-2 border-white/20"
            />

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl z-10 overflow-hidden p-1.5"
            >
              <motion.img
                src={LOGO_URL}
                alt="App logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-full h-full object-contain rounded-2xl"
              />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-white text-2xl font-bold tracking-tight"
          >
            Visit Manager
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-blue-200 text-sm mt-1.5 font-medium"
          >
            Plan. Track. Complete.
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-1.5 mt-12"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-white rounded-full"
              />
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 flex items-center gap-1.5 text-blue-200/80 text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Powered by Base44</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}