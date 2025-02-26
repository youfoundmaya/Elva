'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface AuthResponse{
    error: null | string,
    success: boolean,
    data: unknown |null
}

export async function SignUp(formData:FormData): Promise<AuthResponse> {
    const supabase = await createClient()

    const data ={
        email : formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data:{
                username: formData.get('username') as string
            }
        }
    }
    const { data: signupData, error } = await supabase.auth.signUp(data)   
    return{
        error: error?.message || "There was an error while signing up.",
        success: !error,
        data: signupData || null
    }
}

export async function Login(formData:FormData): Promise<AuthResponse> {
    const supabase = await createClient()

    const data ={
        email : formData.get('email') as string,
        password: formData.get('password') as string
    }
    const { data: loginData, error } = await supabase.auth.signInWithPassword(data)   
    return{
        error: error?.message || "There was an error while logging in.",
        success: !error,
        data: loginData || null
    }
}

export async function Logout(): Promise<void>{
    const supabase = await createClient()
    await supabase.auth.signOut();
    redirect('/login')
}

export async function updateProfile(values: {username : string}): Promise<AuthResponse> {
    const supabase = await createClient()
    const username = values.username;

    const { data: profileData, error } = await supabase.auth.updateUser({data: {username}})   
    return{
        error: error?.message || "There was an error updating the profile.",
        success: !error,
        data: profileData || null
    }
}