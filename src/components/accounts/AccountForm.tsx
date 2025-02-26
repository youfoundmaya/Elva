"use client";
import { User } from "@supabase/supabase-js";
import React, { useId } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/auth_actions";

const formSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

interface AccountFormProps {
  user: User;
}

const AccountForm = ({ user }:AccountFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.user_metadata?.username || "",
      email: user?.email || ""
    },
  });
  const toastId = useId();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.loading("Updating your profile...", {id: toastId})
    try{
        const {success, error} = await updateProfile(values);
        if (!success){
            toast.error(error,{id:toastId})
        }else{
            toast.success("Your profile has been updated!",{id:toastId})
        }
    }catch(error: any){
        toast.error(error?.message || "There was an error while updating your profile",{id:toastId})
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Profile</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;
