import { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import ArchiveIcon from 'assets/archive-icon.svg?react';
import logoSmall from 'assets/logo-sm.webp';
import logo from 'assets/logo.webp';
import LogoutIcon from 'assets/logout-icon.svg?react';
import { User } from 'entities/user';
import { LogoutBtn } from 'features/auth';
import { Tooltip, UserAvatar } from 'shared/ui';

import { DateTimeWidget } from '../../date-time/ui/DateTimeWidget';
import { MobileMenu } from '../../mobile-menu/ui/MobileMenu';

import styles from './Header.module.scss';

type TProps = {
  userData: User | undefined;
  actions?: ReactNode;
};

export const Header = ({ userData, actions }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.header__content}>
          <Link to={'/project'}>
            <img
              className={styles.header__logo}
              src={isTablet ? logoSmall : logo}
              alt="логотип TodoList"
            />
          </Link>

          <div className={styles.header__wrapper}>
            {!isTablet && (
              <>
                <DateTimeWidget />

                <div className={styles.header__divider} />

                <nav className={styles.header__btns}>
                  <Tooltip
                    zIndex={160}
                    content={
                      <>
                        <UserAvatar src={userData?.avatar_path} />
                        {`${userData?.first_name} ${userData?.last_name}`}
                      </>
                    }
                  >
                    <Link to={'/profile'} className={styles.header__icon}>
                      <UserAvatar src={userData?.avatar_path} size={32} />
                    </Link>
                  </Tooltip>

                  <Tooltip content={'Архив'} zIndex={160}>
                    <Link to={'/archive'} className={styles.header__icon}>
                      <ArchiveIcon />
                    </Link>
                  </Tooltip>

                  <Tooltip content={'Выйти'} zIndex={160}>
                    <LogoutBtn className={styles.header__icon}>
                      <LogoutIcon />
                    </LogoutBtn>
                  </Tooltip>
                </nav>
              </>
            )}
            {isTablet && (
              <>
                {actions}
                <MobileMenu userData={userData} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
