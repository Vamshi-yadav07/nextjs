'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
interface SignInFormProps extends React.ComponentProps<"form"> {}

function SignInForm({ className, ...props }: SignInFormProps) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPasswordVisible, setShowNewPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        console.log('Sign-in incomplete:', result);
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during sign-in.', {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      await signIn.create({
        identifier: email,
        strategy: 'reset_password_email_code',
      });
      setResetEmailSent(true);
      setShowCodeInput(true);
      toast.success('New verification code sent to your email.', {
        position: 'top-right',
        closeButton: true,
        duration: 4000,
      });
    } catch (err: any) {
      console.error('Email code error:', err);
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred sending the verification code.';
      toast.error(errorMessage, {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: verificationCode,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        console.log('Password reset incomplete:', result);
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      await signIn.create({
        identifier: email,
        strategy: 'reset_password_email_code',
      });
      toast.success('New verification code sent to your email.', {
        position: 'top-right',
        closeButton: true,
        duration: 4000,
      });
    } catch (err: any) {
      console.error('Resend code error:', err);
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred resending the code.';
      toast.error(errorMessage, {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verification and password reset form
  if (showCodeInput) {
    return (
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleResetPassword} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            We've sent a 6-digit code to <strong>{email}</strong>. Enter the code and your new password below.
          </p>
        </div>
        
        <div className="grid gap-6">
          {/* Verification Code */}
          <div className="grid gap-3">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              required
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
            />
          </div>

          {/* New Password */}
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPasswordVisible ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 px-0 hover:bg-transparent"
                onClick={() => setShowNewPasswordVisible(!showNewPasswordVisible)}
              >
                {showNewPasswordVisible ? <Eye /> : <EyeOff />}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || verificationCode.length < 6 || !newPassword} 
            className="w-full"
          >
            {isLoading ? 'Updating password...' : 'Update Password'}
          </Button>
          
          <div className="flex flex-col gap-2 text-center">
            <Button type="button" variant="ghost" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleResendCode();
            }} disabled={isLoading}>
              Didn't receive the code? Resend
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowForgotPassword(false);
                setResetEmailSent(false);
                setShowCodeInput(false);
                setVerificationCode('');
                setNewPassword('');
              }}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleForgotPassword} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email and we'll send you a verification code
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@company.com"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Sending code...' : 'Send verification code'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowForgotPassword(false);
              setShowCodeInput(false);
              setResetEmailSent(false);
              setVerificationCode('');
              setNewPassword('');
            }}
          >
            Back to Sign In
          </Button>
        </div>
      </form>
    );
  }

  // Main sign-in form
  return (
    <form className={cn("flex flex-col max-w-sm  gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold"> Welcome back!</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials to access your account
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@company.com"
          />
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowForgotPassword(true);
              }}
              className="ml-auto text-sm underline-offset-4 hover:underline text-primary"
            >
              Forgot your password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 px-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </Button>
          </div>
        </div>
        <div id="clerk-captcha"></div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
      
      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/sign-up" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}