'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSession } from '../../hooks/use-session';
import { homePath } from '../../lib/role';
import type { SessionUser } from '../../lib/session-user';
import { AppHeader } from './app-header';
import './require-auth.css';

type RequireAuthProps = {
  role: SessionUser['roleCode'];
  children: ReactNode;
};

export function RequireAuth({ role, children }: RequireAuthProps) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isPending) {
      return;
    }

    if (session.isError || !session.data) {
      router.replace('/login');
      return;
    }

    if (session.data.roleCode !== role) {
      router.replace(homePath(session.data.roleCode));
    }
  }, [role, router, session.data, session.isError, session.isPending]);

  if (session.isPending) {
    return <p className="require-auth">Загрузка…</p>;
  }

  if (session.isError || !session.data || session.data.roleCode !== role) {
    return null;
  }

  return (
    <div className="cabinet">
      <AppHeader user={session.data} />
      <div className="cabinet__body">{children}</div>
    </div>
  );
}
