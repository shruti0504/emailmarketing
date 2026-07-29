"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import AlertNotification from "@/components/ui/alert/AlertNotification";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import api from "@/lib/api";

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAlertInfo(null);

    // Validation
    if (!formData.email.trim()) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Email address is required.",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (!formData.password) {
      setAlertInfo({
        variant: "error",
        title: "Validation Error",
        message: "Password is required.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const result = response.data;

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      setAlertInfo({
        variant: "success",
        title: "Success",
        message: result.message || "Logged in successfully!",
      });

      setTimeout(() => {
        router.push("/campaigns");
      }, 1000);
    } catch (err: any) {
      setAlertInfo({
        variant: "error",
        title: "Authentication Failed",
        message: err.response?.data?.message || err.message || "Failed to sign in.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/campaigns"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon />
          Back to campaigns
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-title-md">
              Sign In
            </h1>

            <p className="text-sm text-gray-500">
              Enter your email and password to sign in!
            </p>
          </div>

          {alertInfo && (
            <AlertNotification
              variant={alertInfo.variant}
              title={alertInfo.title}
              message={alertInfo.message}
              onClose={() => setAlertInfo(null)}
              durationMs={3000}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>

                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="info@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />

                  <span className="text-theme-sm">
                    Keep me logged in
                  </span>
                </div>

                <Link
                  href="/reset-password"
                  className="text-brand-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                className="w-full"
                size="sm"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-brand-500"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}