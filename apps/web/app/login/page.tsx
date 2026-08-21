'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CredentialsForm } from '../../components/auth/credentials-form';
import { VerifyForm } from '../../components/auth/verify-form';
import { useSession } from '../../hooks/use-session';
import { ApiError } from '../../lib/api-error';
import { login, verify } from '../../lib/auth-api';
import { formatPhoneInput, phoneToApi } from '../../lib/phone';
import { queryKeys } from '../../lib/query-keys';
import { homePath } from '../../lib/role';
import './login-page.css';

type Step = 'credentials' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const [step, setStep] = useState<Step>('credentials');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session.data) {
      router.replace(homePath(session.data.roleCode));
    }
  }, [router, session.data]);

  async function handleLogin() {
    setError('');
    setPending(true);

    try {
      const result = await login(phoneToApi(phone), password);
      setVerificationId(result.verificationId);
      setCode('');
      setStep('code');
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Неверный телефон или пароль',
      );
    } finally {
      setPending(false);
    }
  }

  async function handleVerify() {
    setError('');
    setPending(true);

    try {
      const user = await verify(verificationId, code.trim());
      queryClient.setQueryData(queryKeys.me, user);
      router.replace(homePath(user.roleCode));
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Неверный или истёкший код',
      );
    } finally {
      setPending(false);
    }
  }

  function handleBack() {
    setStep('credentials');
    setCode('');
    setVerificationId('');
    setError('');
  }

  return (
    <main className="login-page">
      <div className="login-page__card">
        {step === 'credentials' ? (
          <CredentialsForm
            phone={phone}
            password={password}
            error={error}
            pending={pending}
            onPhoneChange={(value) => {
              setPhone(formatPhoneInput(value));
              setError('');
            }}
            onPasswordChange={(value) => {
              setPassword(value);
              setError('');
            }}
            onSubmit={handleLogin}
          />
        ) : (
          <VerifyForm
            code={code}
            error={error}
            pending={pending}
            onCodeChange={(value) => {
              setCode(value);
              setError('');
            }}
            onSubmit={handleVerify}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}
