'use client'

import { useUser, useReverification } from '@clerk/nextjs'
import { TOTPResource } from '@clerk/types'
import Link from 'next/link'
import * as React from 'react'
// QR rendering via external service to avoid extra dependency
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


type AddTotpSteps = 'add' | 'verify' | 'backupcodes' | 'success'

type DisplayFormat = 'qr' | 'uri'

function AddTotpScreen({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<AddTotpSteps>>
}) {
  const { user } = useUser()
  const [totp, setTOTP] = React.useState<TOTPResource | undefined>(undefined)
  const [displayFormat, setDisplayFormat] = React.useState<DisplayFormat>('qr')
  const createTOTP = useReverification(() => user?.createTOTP())

  React.useEffect(() => {
    void createTOTP()
      .then((totp) => {
        if (totp) {
          setTOTP(totp)
        }
      })
      .catch((err) =>
        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
        // for more info on error handling
        console.error(JSON.stringify(err, null, 2)),
      )
  }, [])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Add authenticator app (TOTP)</h1>
        <p className="mt-1 text-sm text-gray-600">
          Scan the QR code with your authenticator app or use the URI.
        </p>
      </div>

      {totp && displayFormat === 'qr' && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-lg border p-2">
            <img
              alt="Scan this QR in your authenticator app"
              width={200}
              height={200}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                totp?.uri || '',
              )}`}
            />
          </div>
          <Button variant="ghost" onClick={() => setDisplayFormat('uri')}>
            Use URI instead
          </Button>
        </div>
      )}
      {totp && displayFormat === 'uri' && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-gray-50 p-3">
            <p className="text-xs text-gray-500">URI</p>
            <p className="font-mono text-sm break-all">{totp.uri}</p>
          </div>
          <Button variant="ghost" onClick={() => setDisplayFormat('qr')}>
            Use QR code instead
          </Button>
        </div>
      )}
      <div className="mt-4">
        <Button variant="secondary" onClick={() => setStep('add')}>
          Reset
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-700">Once set up, verify your 6‑digit code.</p>
        <Button onClick={() => setStep('verify')}>Continue to verify</Button>
      </div>
    </div>
  )
}

function VerifyTotpScreen({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<AddTotpSteps>>
}) {
  const { user } = useUser()
  const [code, setCode] = React.useState('')

  const verifyTotp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await user?.verifyTOTP({ code })
      setStep('backupcodes')
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Verify code</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the 6‑digit code from your authenticator app to enable MFA.
        </p>
      </div>
      <form onSubmit={(e) => verifyTotp(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totp-code">6‑digit code</Label>
          <Input
            id="totp-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.currentTarget.value)}
            placeholder="123456"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={code.length !== 6}>
            Verify and enable
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStep('add')}>
            Back
          </Button>
        </div>
      </form>
    </div>
  )
}

// function BackupCodeScreen({
//   setStep,
// }: {
//   setStep: React.Dispatch<React.SetStateAction<AddTotpSteps>>
// }) {
//   return (
//     <>
//       <h1>Verification was a success!</h1>
//       <div>
//         <p>
//           Save this list of backup codes somewhere safe in case you need to access your account in
//           an emergency
//         </p>
//         <GenerateBackupCodes />
//         <button onClick={() => setStep('success')}>Finish</button>
//       </div>
//     </>
//   )
// }

function SuccessScreen() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold">Success!</h1>
      <p className="mt-1 text-sm text-gray-700">
        You have successfully added TOTP MFA via an authenticator app.
      </p>
      <div className="mt-4">
        <Link href="/account/manage-mfa">
          <Button>Return to MFA settings</Button>
        </Link>
      </div>
    </div>
  )
}

export default function AddMFaScreen() {
  const [step, setStep] = React.useState<AddTotpSteps>('add')
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    // Handle loading state
    return null
  }

  if (!isSignedIn) {
    // Handle signed out state
    return <p>You must be logged in to access this page</p>
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Set up MFA</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enable an authenticator app to protect your account.
        </p>
      </div>
      <div className="space-y-4">
        {step === 'add' && <AddTotpScreen setStep={setStep} />}
        {step === 'verify' && <VerifyTotpScreen setStep={setStep} />}
        {step === 'success' && <SuccessScreen />}
        <div className="flex justify-end">
          <Link href="/account/manage-mfa">
            <Button variant="ghost">Back to MFA settings</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}