"use client"
import React, { useId, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { changePassword } from '@/app/actions/auth_actions'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const password_regex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])(?=.{8,})"
  );
  
const formSchema = z.object({
   password: z
       .string({
         required_error: "Password is required.",
       })
       .min(8, {
         message: "Password must be at least 8 characters long.",
       })
       .regex(password_regex, {
         message:
           "Password must contain 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.",
       }),
       confirmPassword: z.string({
         required_error: "Password is required.",
       }) 
   }).refine(data => data.password === data.confirmPassword,{
     message: "Passwords do not match.",
     path: ["confirmPassword"]
   })

const ChangePasswordForm = ({className}:{className? : string}) => {
    const [loading, setLoading] = useState(false)
    const toastID = useId();
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          password: "",
          confirmPassword: ""
        },
      })

    async function onSubmit(values: z.infer<typeof formSchema>) {
      toast.loading("Changing Password...",{id: toastID})
      setLoading(true)
  try{
    
    const { success, error } = await changePassword(values.password)
    if (!success){
      setLoading(false)
      toast.error(String(error), {id:toastID})
    }
    else{
      setLoading(false)
      toast.success('Password changed successfully. Redirecting you to login!', {id:toastID})
      router.push(`/login`);
    }
    setLoading(false)
  }
  catch(error:any){
    console.log(String(error?.message))
  }
  finally{
    setLoading(false)
  }
    }
  return (
    <div className={cn('grid gap-6',className)}>
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Change Password
          </h1>
          <p className="text-sm text-muted-foreground">
Enter your new password below to change password
          </p>
        </div>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Password" {...field} />
            </FormControl>
            <FormDescription>
                Enter a strong password that meets the requirements
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm New Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Password" {...field} />
            </FormControl>
            <FormDescription>
                Re-enter your new password to confirm
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 2-4 animate-spin" />}
        {loading? "Changing password..." : "Change Password" }
      </Button>
    </form>
  </Form>
  </div>
  )
}

export default ChangePasswordForm