import { FC } from 'react';
import { useSelector } from '../../services/store';
import { selectUserState } from '../../services/userSlice';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const { user } = useSelector(selectUserState);

  return <AppHeaderUI userName={user?.name || ''} />;
};
