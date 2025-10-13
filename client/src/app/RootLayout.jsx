import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_DURATION = 600;
const ANIMATION_DURATION = 0.4;

export function RootLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), LOADING_DURATION);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const loadingOverlay = isLoading && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION, ease: "easeInOut" }}
    >
      <motion.div className="relative">
        {/* Spinner chính */}
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-white/20 border-t-white"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "linear",
          }}
        />
        
        {/* Vòng tròn phụ tạo hiệu ứng đẹp hơn */}
        <motion.div
          className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-white/40"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "linear",
          }}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <Outlet />
      {createPortal(
        <AnimatePresence mode="wait">
          {loadingOverlay}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}