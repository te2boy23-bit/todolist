"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface CelebrationContextType {
  triggerCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(
  undefined,
);

export function CelebrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const { width, height } = useWindowSize();

  const triggerCelebration = useCallback(() => {
    setIsCelebrating(true);
    setTimeout(() => {
      setIsCelebrating(false);
    }, 4000); // 4秒後に紙吹雪を止める
  }, []);

  return (
    <CelebrationContext.Provider value={{ triggerCelebration }}>
      {children}
      {isCelebrating && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
          />
        </div>
      )}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
}
