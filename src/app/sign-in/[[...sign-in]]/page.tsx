'use client'

import * as React from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [useBackupCode, setUseBackupCode] = React.useState(false)
  const [needsSecondFactor, setNeedsSecondFactor] = React.useState(false)
  const router = useRouter()

  // 1️⃣ First factor: email + password
  const handleFirstStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      // Start sign-in
      const firstFactor = await signIn.create({
        identifier: email,
        password: password,
      })

      // If MFA required, Clerk tells us:
      if (firstFactor.status === 'needs_second_factor') {
        setNeedsSecondFactor(true)
      }

      // If complete (no MFA required)
      else if (firstFactor.status === 'complete') {
        await setActive({ session: firstFactor.createdSessionId })
        router.push('/')
      }
    } catch (err) {
      console.error('First factor error:', err)
    }
  }

  // 2️⃣ Second factor: TOTP or backup code
  const handleSecondFactor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const result = await signIn.attemptSecondFactor({
        strategy:  'totp',
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      } else {
        console.log('Unexpected second factor status:', result)
      }
    } catch (err) {
      console.error('Second factor error:', err)
    }
  }

  // ✅ Second factor UI
  if (needsSecondFactor) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSecondFactor} className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Verify your identity</h1>
              <p className="text-muted-foreground text-sm">
                Enter your authenticator code to continue
              </p>
            </div>

            <div className="grid gap-4">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={useBackupCode ? 'Backup code' : '000000'}
                className="text-center text-2xl font-mono"
              />
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ✅ First factor UI
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <form onSubmit={handleFirstStage} className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <div className="grid gap-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
            />
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              type="password"
            />
            <Button type="submit" className="w-full" disabled={!email || !password}>
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
