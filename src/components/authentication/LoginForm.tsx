"use client"
import React, { useId, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Login } from '@/app/actions/auth_actions'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    email: z.string().email({
        message : "Please enter a valid email address."
    }),
    password: z.string().min(8,{
        message : "Password must be at least 8 characters."
    }),
  })

const LoginForm = ({className}:{className? : string}) => {
    const [loading, setLoading] = useState(false)
    const toastID = useId();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password: ""
        },
      })

    async function onSubmit(values: z.infer<typeof formSchema>) {
      toast.loading("Signing in...",{id: toastID})
      setLoading(true)
      const formData = new FormData;
      formData.append('email',values.email)
      formData.append('password',values.password)
  
      const { success, error } = await Login(formData)
      if (!success){
        setLoading(false)
        toast.error(String(error), {id:toastID})
      }
      else{
        setLoading(false)
        toast.success('Signed in successfully.', {id:toastID})
        redirect('/dashboard')
      }
      setLoading(false)
      console.log(values);
    }
  return (
    <div className={cn('grid gap-6',className)}>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="username@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full" disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 2-4 animate-spin" />}
      Login</Button>
    </form>
  </Form>
  </div>
  )
}

export default LoginForm