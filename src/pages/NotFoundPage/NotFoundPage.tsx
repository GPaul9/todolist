import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import NotFound404 from 'assets/404-icon.svg?react';
import notFoundImg from 'assets/not-found.webp';
import { Button } from 'shared/ui';

import styles from './NotFoundPage.module.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  return (
    <div className={styles.page}>
      <div className={clsx('container', styles.page__container)}>
        {!isTablet && (
          <div className={styles['page__left-block']}>
            <img className={styles.page__img} src={notFoundImg} alt="Страница не найдена" />
          </div>
        )}
        <div className={styles['page__right-block']}>
          <NotFound404 className={styles.page__icon} />
          <div className={styles.page__content}>
            <h1 className={styles.page__title}>Страница не найдена</h1>
            <div className={styles.page__descr}>
              Этот проект уже завершен или его никогда не было...
              <br />
              Может, так даже лучше?
            </div>
          </div>
          <Button className={styles.page__btn} onClick={() => navigate('/project')}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
