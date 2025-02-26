import { User } from '@supabase/supabase-js';
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "../ui/card";
import { Button } from '../ui/button';

interface SecuritySettingsProps {
  user: User;
}

const SecuritySettings = ({user}:SecuritySettingsProps) => {
  return (
    <Card className="w-full">
    <CardHeader>
      <CardTitle>Security</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='space-y-2'>
        <h3 className='font-medium'>Password</h3>
        <p className='text-sm text-muted-foreground'>Change your password to keep your account secure</p>
        <Button variant={"outline"} >
            Change Password
        </Button>
      </div>
    </CardContent>
  </Card>  
  )
}

export default SecuritySettings