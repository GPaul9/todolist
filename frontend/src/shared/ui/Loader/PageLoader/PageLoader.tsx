import { Spinner } from '../Spinner/Spinner';

import styles from './PageLoader.module.scss';

export const PageLoader = () => {
  return (
    <div className={styles.overlay}>
      <Spinner size={90} />
    </div>
  );
};
