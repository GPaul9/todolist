import styles from './AuthSocial.module.scss';

type TProps = {
  title: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export const AuthSocialBtn = ({ title, icon, onClick }: TProps) => {
  return (
    <button className={styles['social-btn']} onClick={onClick}>
      <span className={styles['social-btn__icon-wrapper']}>{icon}</span>
      {title}
    </button>
  );
};
