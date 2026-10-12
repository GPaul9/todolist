import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import ArchiveIcon from 'assets/archive-icon.svg?react';
import LogoutIcon from 'assets/logout-icon.svg?react';
import MenuIcon from 'assets/menu-icon.svg?react';
import { User } from 'entities/user';
import { LogoutBtn } from 'features/auth';
import { dropdown, useDropdown } from 'shared/lib';
import { Overlay, UserAvatar } from 'shared/ui';

import styles from './MobileMenu.module.scss';

type TProps = {
  userData: User | undefined;
};

export const MobileMenu = ({ userData }: TProps) => {
  const { isOpen, setIsOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useDropdown({ offsetValue: 13, zIndex: 149 });

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return (
    <div className={styles.menu}>
      <button
        className={styles.menu__btn}
        ref={refs.setReference}
        onClick={() => setIsOpen((prev) => !prev)}
        {...getReferenceProps()}
      >
        <MenuIcon />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay zIndex={140} />

            {createPortal(
              <nav
                className={styles.menu__nav}
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
              >
                <motion.div
                  className={styles.menu__content}
                  variants={dropdown}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Link to={'/profile'} className={styles.menu__item}>
                    <UserAvatar src={userData?.avatar_path} size={24} />
                    <span>Профиль</span>
                  </Link>

                  <Link to={'/archive'} className={styles.menu__item}>
                    <ArchiveIcon />
                    <span>Архив</span>
                  </Link>

                  <LogoutBtn className={styles.menu__item}>
                    <LogoutIcon />
                    <span>Выйти из аккаунта</span>
                  </LogoutBtn>
                </motion.div>
              </nav>,
              modalRoot,
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
