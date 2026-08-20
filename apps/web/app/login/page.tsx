'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CredentialsForm } from '../../components/auth/credentials-form';
import { VerifyForm } from '../../components/auth/verify-form';
import { ApiError } from '../../lib/api-error';
import { getMe, login, verify } from '../../lib/auth-api';
import { formatPhoneInput, phoneToApi } from '../../lib/phone';
import './login-page.css';

type Step = 'credentials' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getMe()
      .then(() => {
        router.replace('/');
      })
      .catch(() => undefined);
  }, [router]);

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
      await verify(verificationId, code.trim());
      router.replace('/');
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
