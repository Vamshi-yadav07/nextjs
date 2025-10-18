'use client';

import { useOrganizationList } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface CreateOrganizationFormProps extends React.ComponentProps<"form"> {}

export function CreateOrganizationForm({ className, ...props }: CreateOrganizationFormProps) {
  const { createOrganization, isLoaded, setActive } = useOrganizationList();
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !organizationName.trim()) return;

    setIsLoading(true);

    try {
      // Create organization using Clerk's createOrganization method
      const organization = await createOrganization({
        name: organizationName.trim(),
        slug: organizationName.trim(),
      });

      if (organization) {
        // Set the new organization as active
        await setActive({ organization: organization.id });
        
        toast.success('Organization created successfully!', {
          position: 'top-right',
          closeButton: true,
          duration: 4000,
        });
        
        // Redirect to the dashboard or home page
        router.push('/');
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to create organization. Please try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        closeButton: true,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow user to skip organization creation and go to home
    router.push('/');
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your organization</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Set up your organization to collaborate with your team
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            type="text"
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Enter your organization name"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            This will be the name of your organization that others will see
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isLoading || !organizationName.trim()} className="w-full">
            {isLoading ? 'Creating organization...' : 'Create organization'}
          </Button>
          
          <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function CreateOrganizationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <CreateOrganizationForm />
      </div>
    </div>
  );
}
