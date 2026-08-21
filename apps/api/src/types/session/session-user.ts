import type { RoleCode } from '../../modules/auth/role-code.enum';

export type SessionUser = {
  id: string;
  fullName: string;
  roleCode: RoleCode;
};
