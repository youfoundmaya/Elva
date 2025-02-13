import React from "react";
import AuthImg from "@/public/Abstract Curves and Colors.jpeg";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import AuthForm from "@/components/ui/authentication/AuthForm";

const AuthenticationPage = () => {
  return (
    <main className="h-screen grid grid-cols-2 relatives">
      <div className="relative w-full flex flex-col bg-muted p-10 text-primary-foreground">
        <div className="w-full h-[30%] bg-gradient-to-t from-transparent to-black/50 absolute top-0 left-0 z-10" />
        <div className="w-full h-[40%] bg-gradient-to-b from-transparent to-black/50 absolute bottom-0 left-0 z-10" />
        <Image
          src={AuthImg}
          alt="Login Image"
          fill
          className="w-full h-full object-cover"
        />
        <div className="z-20 flex items-center">
          <Logo />
        </div>
        <div className="relative z-20 mt-auto">
          
        <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Creating visual content has never been this seamless. What
              once took hours of work can now be achieved in minutes, opening up
              endless possibilities for creativity&rdquo;
            </p>
            <footer className="text-sm">Try Artify AI now!</footer>
          </blockquote> 
         
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className="max-w-xl w-[350px] mx-auto">
        <AuthForm/>
        </div>
        </div>
    </main>
  );
};

export default AuthenticationPage;
