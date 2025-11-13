'use client';

import { useSignUp } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SignUpFormProps extends React.ComponentProps<"form"> {}

export  function SignUpForm({ className, ...props }: SignUpFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('Please check your email for a verification code.', {
        position: 'top-right',
        closeButton: true,
        duration: 4000,
      });
      setPendingVerification(true);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during sign-up.', {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === 'complete') {
        setPendingVerification(false);
        toast.success('Email verified. Please sign in to complete MFA setup.', {
          position: 'top-right',
          closeButton: true,
          duration: 4000,
        });
        router.push('/sign-in?from=signup');
      } else {
        toast.error('Verification failed. Please try again.', {
          position: 'top-right',
          closeButton: true,
          duration: 6000,
        });
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Verification failed.', {
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
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('Verification code resent to your email.', {
        position: 'top-right',
        closeButton: true,
        duration: 4000,
      });
    } catch (err: any) {
      toast.error(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to resend code.', {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification form
  if (pendingVerification) {
    return (
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleVerification} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground text-sm text-balance">
            We've sent a verification code to <strong>{email}</strong>. Enter the code below.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
          
          <div className="flex flex-col gap-2 text-center">
            <Button type="button" variant="ghost" onClick={handleResendCode} disabled={isLoading}>
              Didn't receive the code? Resend
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setPendingVerification(false)}
            >
              Back to Sign Up
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Main sign-up form
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Get started with your free account today
        </p>
      </div>

      
      <div className="grid gap-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long
          </p>
        </div>

        <div id="clerk-captcha" data-theme="dark"></div>

        {/* Terms */}
        {/* <div className="text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="#" className="text-primary hover:text-primary/80 font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-primary hover:text-primary/80 font-medium">
            Privacy Policy
          </Link>
          .
        </div> */}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
      
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}


  export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
