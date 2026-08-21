'use client';

import { RequireAuth } from '../../components/layout/require-auth';
import { RoleCode } from '../../lib/role-code.enum';
import type { ReactNode } from 'react';

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return <RequireAuth role={RoleCode.Operator}>{children}</RequireAuth>;
}
