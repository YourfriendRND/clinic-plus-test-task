export type LoginResult = {
  verificationId: string;
};

export type LoginBody = {
  phone?: string;
  password?: string;
};
