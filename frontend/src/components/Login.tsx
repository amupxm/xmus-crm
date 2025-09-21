"use client";

import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthApi } from '../hooks/useAuthApi';

type errors = {
  email?: string;
  password?: string;
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<errors>({});
  
  const { loginUser, isLoading, error, isAuthenticated } = useAuthApi();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const toggleVisibility = () => setIsVisible(!isVisible);

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

    try {
      await loginUser({ email, password });
      navigate(from, { replace: true });
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-cyber p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 glass-dark hover-lift">
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg neon-glow">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">
              Welcome Back
            </h1>
            <p className="text-gray-300 mt-2">Sign in to your account</p>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              classNames={{
                input: "text-base text-white",
                inputWrapper:
                  "h-12 glass border border-gray-600 hover:border-blue-400 focus-within:border-blue-500 shadow-sm",
                label: "text-gray-300 font-medium",
              }}
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label="Email Address"
              labelPlacement="outside"
              placeholder="Enter your email"
              startContent={<Mail className="w-4 h-4 text-gray-400" />}
              type="email"
              value={email}
              onValueChange={(v : any) => {
                setEmail(v);
                setErrors({});
              }}
            />

            <Input
              classNames={{
                input: "text-base text-white",
                inputWrapper:
                  "h-12 glass border border-gray-600 hover:border-blue-400 focus-within:border-blue-500 shadow-sm",
                label: "text-gray-300 font-medium",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                  )}
                </button>
              }
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              label="Password"
              labelPlacement="outside"
              placeholder="Enter your password"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              type={isVisible ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
            />

            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-500/30 p-4">
                <div className="text-sm text-red-300">{error}</div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                type="button"
              >
                Forgot password?
              </button>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] neon-glow"
              isLoading={isLoading}
              type="submit"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center pt-4">
              <span className="text-gray-400">Don&#39;t have an account? </span>
              <button
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                type="button"
                onClick={() => {
                  alert('Please contact your system administrator to create an account.');
                }}
              >
                Contact administrator
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
