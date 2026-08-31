import { ReactNode } from 'react';

import { useDialog } from 'shared/lib';

import { useLogout } from '../model/useLogout';

type TProps = {
  children: ReactNode;
  className?: string;
};

export const LogoutBtn = ({ children, className }: TProps) => {
  const { mutate } = useLogout();
  const dialog = useDialog();

  const handleClick = async () => {
    const ok = await dialog.confirm({
      title: 'Вы действительно хотите выйти?',
      description: 'Вы сможете вернуться в любое время.',
      confirmText: 'Выйти',
    });

    if (ok) return mutate();
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};
