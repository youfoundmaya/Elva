import AccountForm from "@/components/accounts/AccountForm";
import SecuritySettings from "@/components/accounts/SecuritySettings";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

const AccountSettings = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login`);
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
          Account Settings
          <Settings className="w-10 h-10" />
        </h1>
        <p className="text-muted-foreground mb-6 flex items-center justify-center">
          Manage your Account settings and preferences
        </p>
      </div>
      <div className="w-full max-w-3xl m-6">
        <div className="mb-6">
  <AccountForm user={user} />  {/* Add margin-bottom */}
  </div>
  <SecuritySettings user={user} />  {/* Or margin-top */}
</div>
    </div>
  );
};

export default AccountSettings;
