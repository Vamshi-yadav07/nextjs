import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            card: "shadow-2xl border border-gray-200 rounded-2xl",
          },
        }}
      />
    </div>
  );
}


