"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, ArrowLeft, Heart, Eye, EyeOff, Loader2 } from "lucide-react";

type AuthMethod = "phone" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Phone auth state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // Email auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Format phone number
      const formattedPhone = phone.startsWith("+") ? phone : `+233${phone.replace(/^0/, "")}`;
      
      // TODO: Call API to send OTP
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const otpCode = otp.join("");
      const formattedPhone = phone.startsWith("+") ? phone : `+233${phone.replace(/^0/, "")}`;

      const result = await signIn("phone-otp", {
        phone: formattedPhone,
        otp: otpCode,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid OTP. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("email-password", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white fill-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Apomuden
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-1">Sign in to access your health portal</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              {/* Auth Method Toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => { setAuthMethod("phone"); setStep("input"); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    authMethod === "phone"
                      ? "bg-white shadow-sm text-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
                <button
                  onClick={() => { setAuthMethod("email"); setStep("input"); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    authMethod === "email"
                      ? "bg-white shadow-sm text-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Phone Auth */}
              {authMethod === "phone" && (
                <AnimatePresence mode="wait">
                  {step === "input" ? (
                    <motion.form
                      key="phone-input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleSendOTP}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            +233
                          </span>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="24 123 4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            className="pl-14"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          We'll send you a verification code
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading || phone.length < 9}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Send Verification Code"
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="otp-input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleVerifyOTP}
                      className="space-y-4"
                    >
                      <div>
                        <Label>Enter Verification Code</Label>
                        <p className="text-sm text-gray-500 mb-3">
                          Sent to +233 {phone}
                        </p>
                        <div className="flex gap-2 justify-center">
                          {otp.map((digit, index) => (
                            <Input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="w-12 h-12 text-center text-lg font-bold"
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading || otp.some((d) => !d)}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Sign In"
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => setStep("input")}
                        className="w-full text-sm text-gray-600 hover:text-gray-900"
                      >
                        Change phone number
                      </button>

                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="w-full text-sm text-emerald-600 hover:text-emerald-700"
                        disabled={loading}
                      >
                        Resend code
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}

              {/* Email Auth */}
              {authMethod === "email" && (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">
                  Create an Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
