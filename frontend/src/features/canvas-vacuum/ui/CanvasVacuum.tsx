import { useSearchParams } from "react-router-dom";
import { CanvasVacuumBtn } from "./CanvasVacuumBtn";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { vacuumGame, vacuumGameBtn } from "../model/gameMotionVariants";
import { CanvasVacuumGame } from "./CanvasVacuumGame";

type mode = 'game' | 'btn' | null;

export const CanvasVacuum = () => {
  const [ mode, setMode ] = useState<mode>(null)
  const [searchParams] = useSearchParams();
  const urlValue = searchParams.get('search') ?? '';

  const targetValue = ['todolist', 'тудулист'];

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  useEffect(() => {
    if (targetValue.includes(urlValue.toLowerCase())) {
      setMode('btn');
    }
  }, [urlValue]);

  return createPortal(
    <AnimatePresence>
      {mode === 'btn' && (
        <motion.div
          key="vacuum-btn"
          variants={vacuumGameBtn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CanvasVacuumBtn
            onClose={() => setMode(null)}
            onOpen={() => setMode('game')}
          />
        </motion.div>
      )}

      {mode === 'game' &&
        <motion.div
          key="vacuum-game"
          variants={vacuumGame}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <CanvasVacuumGame onClose={() => setMode('btn')}/>
        </motion.div>
      }
    </AnimatePresence>,
    modalRoot
  );
};
