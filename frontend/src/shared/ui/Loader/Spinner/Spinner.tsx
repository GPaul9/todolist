import styles from './Spinner.module.scss';

type TProps = {
  dots?: number;
  size?: number;
};

export const Spinner = ({ dots = 8, size = 48 }: TProps) => {
  return (
    <div
      className={styles.spinner}
      style={
        {
          '--size': `${size}px`,
          '--dots': dots,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={styles.spinner__dot}
          style={
            {
              '--i': i,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
