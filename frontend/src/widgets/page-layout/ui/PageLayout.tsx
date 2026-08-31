import clsx from 'clsx';
import { Children, isValidElement, ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import ArrowIcon from 'assets/arrow-right-icon.svg?react';
import { useMe } from 'entities/user';
import { useRouteNotice } from 'shared/lib';
import { Breadcrumbs, TBreadcrumb } from 'shared/ui';

import { Header } from '../../header/ui/Header';

import styles from './PageLayout.module.scss';
import { CanvasVacuum } from 'features/canvas-vacuum';

type LayoutProps = {
  title: string;
  backPath?: string | null;
  breadcrumbsItems?: TBreadcrumb[];
  headerActions?: ReactNode;
  noScroll?: boolean;
  children: ReactNode;
};

type SlotProps = {
  children: ReactNode;
};

export const PageLayout = ({
  title,
  backPath = '/project',
  breadcrumbsItems,
  headerActions,
  noScroll,
  children,
}: LayoutProps) => {
  useRouteNotice();

  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { data } = useMe();

  let leftBlock: ReactNode = null;
  let rightBlock: ReactNode = null;

  const mainContent: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      mainContent.push(child);
      return;
    }

    if (child.type === PageLayout.LeftContent) {
      leftBlock = child;
      return;
    }

    if (child.type === PageLayout.RightContent) {
      rightBlock = child;
      return;
    }

    mainContent.push(child);
  });

  return (
    <div className={clsx(styles.layout, noScroll && styles['layout_no-scroll'])}>
      <Header userData={data} actions={headerActions} />

      <main className={styles.main}>
        <div className={styles['layout__page-header']}>
          <div className="container">
            <div className={styles.layout__content}>
              <h1 className={styles.layout__title}>
                {!isTablet ? (
                  <span className={styles['layout__title-text']}>{title}</span>
                ) : (
                  <Link to={backPath ?? '#'} className={styles['layout__title-link']}>
                    {backPath && <ArrowIcon className={styles['layout__title-icon']} />}
                    <span className={styles['layout__title-text']}>{title}</span>
                  </Link>
                )}
              </h1>

              <div className={styles.layout__actions}>
                {leftBlock}
                {rightBlock}
              </div>
            </div>

            {!isTablet && breadcrumbsItems && (
              <>
                <Breadcrumbs className={styles.layout__breadcrumbs} items={breadcrumbsItems} />
                <div className={styles.layout__divider} />
              </>
            )}
          </div>
        </div>
        <div className={styles['layout__page-content']}>{mainContent}</div>
      </main>

      <CanvasVacuum />
    </div>
  );
};

PageLayout.LeftContent = ({ children }: SlotProps) => {
  return <div className={styles['layout__left-content']}>{children}</div>;
};

PageLayout.RightContent = ({ children }: SlotProps) => {
  return <div className={styles['layout__right-content']}>{children}</div>;
};
