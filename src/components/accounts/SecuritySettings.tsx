"use client";

import { User } from '@supabase/supabase-js';
import React, { useId } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "../ui/card";
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { resetPassword } from '@/app/actions/auth_actions';

interface SecuritySettingsProps {
  user: User;
}

const SecuritySettings = ({user}:SecuritySettingsProps) => {
  const toastId = useId();
  async function handleChangePassword() {
    toast.loading("Sending reset password email...", {id: toastId})
    try{
        const {success, error} = await resetPassword({email: user.email || ""});
        if (!success){
            toast.error(error,{id:toastId})
        }else{
            toast.success("Reset password email has been sent. Please check your email for further instructions.",{id:toastId})
        }
    }catch(error: any){
        toast.error(error?.message || "There was an error while sending the reset password email.",{id:toastId})
    }
  }


  return (
    <Card className="w-full">
    <CardHeader>
      <CardTitle>Security</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='space-y-2'>
        <h3 className='font-medium'>Password</h3>
        <p className='text-sm text-muted-foreground'>Change your password to keep your account secure</p>
        <Button variant={"outline"} onClick={handleChangePassword} >
            Change Password
        </Button>
      </div>
    </CardContent>
  </Card>  
  )
}

export default SecuritySettings