import type { RoleCode } from './role-code.enum';

export type SessionUser = {
  id: string;
  fullName: string;
  roleCode: RoleCode;
};
