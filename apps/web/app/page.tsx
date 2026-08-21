'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '../hooks/use-session';
import { homePath } from '../lib/role';

export default function Home() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isPending) {
      return;
    }

    if (session.data) {
      router.replace(homePath(session.data.roleCode));
      return;
    }

    router.replace('/login');
  }, [router, session.data, session.isPending]);

  return null;
}
