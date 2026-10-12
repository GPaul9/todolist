import clsx from 'clsx';
import { Fragment } from 'react/jsx-runtime';
import { Link } from 'react-router-dom';

import ArrowIcon from 'assets/arrow-right-icon.svg?react';

import styles from './Breadcrumbs.module.scss';

export type TBreadcrumb = {
  label: string;
  href: string;
};

type Tprops = {
  items: TBreadcrumb[];
  className?: string;
};

export const Breadcrumbs = ({ items, className }: Tprops) => {
  return (
    <nav className={clsx(styles.breadcrumbs, className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        if (index === items.length - 1)
          return (
            <span key={index} className={styles.breadcrumbs__current}>
              {item.label}
            </span>
          );

        return (
          <Fragment key={index}>
            <Link to={item.href} className={styles.breadcrumbs__link}>
              {item.label}
            </Link>
            <ArrowIcon className={styles.breadcrumbs__separator} />
          </Fragment>
        );
      })}
    </nav>
  );
};
