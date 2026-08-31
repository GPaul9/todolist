import GreenIcon from 'assets/green-square.svg?react';
import RedIcon from 'assets/red-triangle.svg?react';
import YellowIcon from 'assets/yellow-triangle.svg?react';

import styles from './PasswordStrength.module.scss';

interface PasswordStrengthProps {
  score: number;
  onlyBar?: boolean;
  onlyText?: boolean;
}

export const PasswordStrength = ({ score, onlyBar, onlyText }: PasswordStrengthProps) => {
  const getStatus = () => {
    if (score <= 2)
      return {
        text: 'Надежность: Низкая',
        color: styles.red,
        active: styles.activeRed,
        Icon: RedIcon,
        fillCount: 2,
      };
    if (score <= 5)
      return {
        text: 'Надежность: Средняя',
        color: styles.yellow,
        active: styles.activeYellow,
        Icon: YellowIcon,
        fillCount: 4,
      };
    return {
      text: 'Надежность: Высокая',
      color: styles.green,
      active: styles.activeGreen,
      Icon: GreenIcon,
      fillCount: 6,
    };
  };

  const { text, color, active, Icon, fillCount } = getStatus();

  if (onlyBar) {
    return (
      <div className={styles.strength__bar}>
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div
            key={step}
            className={`${styles.strength__segment} ${step <= fillCount ? active : ''}`}
          />
        ))}
      </div>
    );
  }

  if (onlyText) {
    return (
      <div className={`${styles.strength__label} ${color}`}>
        <Icon className={styles.strength__icon} />
        <span>{text}</span>
      </div>
    );
  }

  return null;
};
