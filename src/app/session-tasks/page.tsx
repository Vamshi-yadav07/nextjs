'use client'

import { TaskChooseOrganization, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SessionTasksPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user becomes authenticated, redirect to home
    if (isLoaded && isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Complete Your Setup</h1>
          <p className="text-muted-foreground text-lg">
            Please complete the required setup steps to continue.
          </p>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg border p-8">
          <TaskChooseOrganization 
            redirectUrlComplete="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none",
                headerTitle: "text-xl font-semibold mb-4",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                organizationSwitcherTrigger: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                organizationPreview: "border border-input rounded-lg p-4 hover:bg-accent/50",
                organizationPreviewAvatarBox: "border-2",
                badge: "bg-primary/10 text-primary"
              }
            }}
          />
        </div>

        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              Complete the organization setup to access your account
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              You'll be redirected to the main dashboard after completion
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              You can change your organization anytime in settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}