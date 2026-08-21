export type TwoFaPayload = {
  userId: string;
  code: string;
};

export type LoginResult = {
  verificationId: string;
};

export type LoginBody = {
  phone?: string;
  password?: string;
};

export type VerifyBody = {
  verificationId?: string;
  code?: string;
};
