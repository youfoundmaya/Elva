"use client";
import React, { useState } from "react";
import LoginForm from "./LoginForm";
import { Button } from "../ui/button";
import SignUpForm from "./SignUpForm";
import Link from "next/link";
import ResetPassword from "./ResetPassword";

const AuthForm = () => {
  const [mode, setMode] = useState("login");
  return (
    <div className="relative bg-primary-foreground pt-8 pb-8 pr-7 pl-7 rounded-lg">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "reset"
              ? "Reset Password"
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "reset"
              ? "Enter your email below to reset your password."
              : mode === "login"
              ? "Enter your email below to login to your account."
              : "Enter your information below to create an account."}
          </p>
        </div>
        {mode === "login" && (
          <>
            <LoginForm />
            <div className="text-center flex justify-between">
              <Button
                variant={"link"}
                className="p-0 text-left"
                onClick={() => setMode("signup")}
              >
                Need an account?
                <br />
                Sign up
              </Button>
              <Button
                variant={"link"}
                className="p-0 text-right"
                onClick={() => setMode("reset")}
              >
                Forgot Password?
              </Button>
            </div>
          </>
        )}
        {mode === "signup" && (
          <>
            <SignUpForm />
            <div className="text-center">
              <Button
                variant={"link"}
                className="p-0"
                onClick={() => setMode("login")}
              >
                Already have an account? Login
              </Button>
            </div>
            <p className="px-2 text-center text-sm text-muted-foreground">
              By clicking Sign Up, you agree to our{" "}
              <Link
                href="https://creativecommons.org/terms/"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms and Services
              </Link>{" "}
              and{" "}
              <Link
                href="https://creativecommons.org/privacy/"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy.
              </Link>
            </p>
          </>
        )}
        {mode === "reset" && (
          <>
            <ResetPassword />
            <div className="text-center">
              <Button
                variant={"link"}
                className="p-0"
                onClick={() => setMode("login")}
              >
                Back to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
