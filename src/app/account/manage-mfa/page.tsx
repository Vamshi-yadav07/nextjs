'use client'

import * as React from 'react'
import { useUser, useReverification } from '@clerk/nextjs'
import Link from 'next/link'
import { BackupCodeResource } from '@clerk/types'
import { Button } from '@/components/ui/button'

// If TOTP is enabled, provide the option to disable it
const TotpEnabled = () => {
  const { user } = useUser()
  const disableTOTP = useReverification(() => user?.disableTOTP())

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Authenticator app (TOTP)</p>
          <p className="mt-1 text-sm">
            Status:{' '}
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Enabled
            </span>
          </p>
        </div>
        <Button variant="destructive" onClick={() => disableTOTP()}>
          Disable
        </Button>
      </div>
    </div>
  )
}

// If TOTP is disabled, provide the option to enable it
const TotpDisabled = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Authenticator app (TOTP)</p>
          <p className="mt-1 text-sm text-gray-700">
            Add an extra layer of security using an authenticator app.
          </p>
        </div>
        <Link href="/account/manage-mfa/add">
          <Button>Add</Button>
        </Link>
      </div>
    </div>
  )
}

// Generate and display backup codes
export function GenerateBackupCodes() {
  const { user } = useUser()
  const [backupCodes, setBackupCodes] = React.useState<BackupCodeResource | undefined>(undefined)
  const createBackupCode = useReverification(() => user?.createBackupCode())

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (backupCodes) {
      return
    }

    setLoading(true)
    void createBackupCode()
      .then((backupCode: BackupCodeResource | undefined) => {
        setBackupCodes(backupCode)
        setLoading(false)
      })
      .catch((err) => {
        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
        // for more info on error handling
        console.error(JSON.stringify(err, null, 2))
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="text-sm text-gray-600">Generating backup codes…</p>
  }

  if (!backupCodes) {
    return <p className="text-sm text-red-600">There was a problem generating backup codes.</p>
  }

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="mb-2 text-sm font-medium">Backup codes (store securely):</p>
      <ol className="grid grid-cols-2 gap-2 font-mono text-sm">
        {backupCodes.codes.map((code, index) => (
          <li key={index} className="rounded border bg-white px-2 py-1">
            {code}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function ManageMFA() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [showNewCodes, setShowNewCodes] = React.useState(false)

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
        <h1 className="text-xl font-semibold">Multi‑Factor Authentication</h1>
        <p className="mt-1 text-sm text-gray-600">
          Protect your account with an authenticator app and backup codes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Manage TOTP MFA */}
        {user.totpEnabled ? <TotpEnabled /> : <TotpDisabled />}

        {/* Manage backup codes */}
        {user.backupCodeEnabled && user.twoFactorEnabled && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Backup codes</p>
                <p className="mt-1 text-sm text-gray-700">
                  Use one‑time backup codes when you can’t access your authenticator.
                </p>
              </div>
              <Button onClick={() => setShowNewCodes(true)}>Generate</Button>
            </div>
          </div>
        )}
        {showNewCodes && (
          <div className="space-y-3">
            <GenerateBackupCodes />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowNewCodes(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}