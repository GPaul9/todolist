import defaultIcon from 'assets/defaultAvatar-icon.svg';
import { BASE_URL } from 'shared/api';

import styles from './UserAvatar.module.scss';

type TProps = {
  src: string | null | undefined;
  size?: number;
};

export const UserAvatar = ({ src, size = 24 }: TProps) => {
  const avatar =
    src && src.trim() ? (src.startsWith('http') ? src : `${BASE_URL}${src}`) : defaultIcon;
  return (
    <img
      src={avatar}
      alt="User Avatar"
      width={size}
      height={size}
      className={styles.avatar}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.onerror = null;
        img.src = defaultIcon;
      }}
    />
  );
};
