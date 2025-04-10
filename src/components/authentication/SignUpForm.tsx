"use client";
import React, { useId, useState } from "react";
import { z, ZodLazy } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SignUp } from "@/app/actions/auth_actions";
import { redirect } from "next/navigation";


const password_regex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])(?=.{8,})"
);

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
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

const SignUpForm = ({ className }: { className?: string }) => {

  const [loading, setLoading] = useState(false)

  const toastID = useId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });
  const emailValue = form.watch("email");
  const isEmailEmpty = !emailValue || emailValue.trim() === "";


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastID = 'signup-toast';
    toast.loading("Signing up...", { id: toastID });
    setLoading(true);
  
    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('email', values.email);
    formData.append('password', values.password);
  
    try {
      const { success, error } = await SignUp(formData);
  
      if (!success) {
        if (error === "Email already in use.") {
          toast.error("You already have an account. Try logging in instead.", { id: toastID });
        } else {
          toast.error(String(error), { id: toastID });
        }
      } else {
        toast.success("Signed up successfully. Please confirm your email.", { id: toastID });
        redirect('/login');
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Unexpected error during signup", { id: toastID });
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div className={cn("grid gap-6", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            disabled={isEmailEmpty}
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
          <FormField
            control={form.control}
            name="confirmPassword"
            disabled={isEmailEmpty}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 2-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
