import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { Outlet, useLocation } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import { useRouteNotice } from 'shared/lib';

import { AuthPromoCard } from '../AuthPromoCard/AuthPromoCard';

import styles from './AuthLayout.module.scss';

export const AuthLayout = () => {
  useRouteNotice();

  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: breakpoints.lg });

  const pageVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className={styles.layout}>
      <main className={styles.layout__container}>
        <motion.div
          className={styles['layout__auth-screen']}
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          layout
        >
          <Outlet />
        </motion.div>

        {!isMobile && <AuthPromoCard />}
      </main>
    </div>
  );
};
