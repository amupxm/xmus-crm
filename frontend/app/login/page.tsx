"use client";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

type errors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);
  const [errors, setErrors] = React.useState<errors>({});
  const toggleVisibility = () => setIsVisible(!isVisible);
  const { login, isLoggingIn, loginError } = useAuth();
  // Email validation
  const getEmailError = (value: string) => {
    if (!value) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  // Password validation
  const getPasswordError = (value: string) => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 4) {
      return "Password must be at least 4 characters";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear previous errors
    setErrors({});
    // Validate fields
    const emailError = getEmailError(email);
    const passwordError = getPasswordError(password);

    const newErrors: errors = {};

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      return;
    }
    addToast({
      title: "info",
      description: "loagging in",
      color: "default",
    });
    try {
      e.preventDefault();
      await login({ email: email, password });

      router.push("/dashboard");
    } catch (e) {
      addToast({
        title: "Error",
        description: "Login failed. Please try again.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    if (loginError) {
      addToast({
        title: "Error",
        description: loginError.message,
        color: "danger",
      });
    }
  }, [loginError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              classNames={{
                input: "text-base",
                inputWrapper:
                  "h-12 bg-white/50 border border-gray-200 hover:border-blue-300 focus-within:border-blue-500 shadow-sm",
                label: "text-gray-700 font-medium",
              }}
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label=""
              labelPlacement="outside"
              placeholder="Enter your email"
              startContent={<Mail className="w-4 h-4 " />}
              type="email"
              value={email}
              onValueChange={(v) => {
                setEmail(v);
                setErrors({});
              }}
            />

            <Input
              classNames={{
                input: "text-base",
                inputWrapper:
                  "h-12  border border-gray-200 hover:border-blue-300 focus-within:border-blue-500 shadow-sm",
                label: "text-gray-700 font-medium",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              }
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              label=""
              labelPlacement="outside"
              placeholder="Enter your password"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              type={isVisible ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
            />

            <div className="flex justify-end">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                type="button"
              >
                Forgot password?
              </button>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              isLoading={isLoggingIn}
              type="submit"
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center pt-4">
              <span className="text-gray-600">Don&#39;t have an account? </span>
              <button
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                type="button"
              >
                Sign up
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
