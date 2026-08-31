import { motion, useMotionValue } from 'framer-motion';

import styles from './TaskModalSubtasksMobile.module.scss';

interface TProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const SubtaskSwipe = ({ children, onSwipeLeft, onSwipeRight }: TProps) => {
  const x = useMotionValue(0);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -40) {
      onSwipeLeft?.();
    }
    if (info.offset.x > 40) {
      onSwipeRight?.();
    }
  };

  return (
    <div className={styles.swipe}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 50 }}
        dragSnapToOrigin={true}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={styles.swipe__content}
      >
        {children}
      </motion.div>
    </div>
  );
};
