"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "../../components/ui/Logo";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../components/common/AppContext";
import { useMetaMask } from "../../hooks/useMetaMask";
import { Eye, EyeOff, Wallet, Check, AlertCircle, ArrowLeft, Sun, Users } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setRole, addToast } = useApp();
  const { isConnected, address, connectWallet } = useMetaMask();

  // Role: Producer or Consumer (Admin public registration forbidden)
  const [selectedRole, setSelectedRole] = useState<"PRODUCER" | "CONSUMER">("CONSUMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-rose-500", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "bg-amber-500", width: "66%" };
    return { label: "Strong", color: "bg-brand-500", width: "100%" };
  };

  const strength = calculatePasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validations
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000/api/v1"
        : (process.env.NEXT_PUBLIC_API_URL || "https://l19idchgw6.execute-api.ap-southeast-2.amazonaws.com/api/v1");
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: selectedRole,
          phone: phone.trim() || undefined,
          walletAddress: address || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      // Store tokens and user profile under both keys for universal compatibility
      localStorage.setItem("greenledger_auth_token", data.token);
      localStorage.setItem("greenledger_jwt", data.token);
      localStorage.setItem("greenledger_user", JSON.stringify(data.user));
      localStorage.setItem("user", JSON.stringify(data.user));

      setRole(selectedRole);
      addToast({
        type: "success",
        title: "Registration Complete",
        description: `Welcome ${data.user.name}! Your account is active.`,
      });

      router.push(data.redirectPath || (selectedRole === "PRODUCER" ? "/producer/dashboard" : "/consumer/dashboard"));
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
      addToast({
        type: "error",
        title: "Registration Failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-navy-950 transition-colors">
      {/* Left Form Column */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-brand-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          <div className="mt-8 sm:mt-12 max-w-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Create an Account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-navy-500 dark:text-navy-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign In
              </Link>
            </p>

            {/* Role Tabs */}
            <div className="mt-6">
              <label className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block mb-1.5">
                Select Your Participant Role
              </label>
              <div className="p-1 bg-navy-100 dark:bg-navy-800 rounded-xl grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedRole("CONSUMER")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedRole === "CONSUMER"
                      ? "bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-navy-500 hover:text-navy-900 dark:hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Consumer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("PRODUCER")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedRole === "PRODUCER"
                      ? "bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-navy-500 hover:text-navy-900 dark:hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Producer</span>
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <Input
                label="Full Name / Entity"
                type="text"
                required
                placeholder={selectedRole === "PRODUCER" ? "e.g. Apex Solar Microgrid" : "e.g. Metro Green Hospital"}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {/* Password with Strength Indicator */}
              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-navy-400 hover:text-navy-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {password && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: strength.width }}
                        className={`h-full ${strength.color} transition-all duration-300`}
                      />
                    </div>
                    <span className="text-[10px] text-navy-400 flex items-center justify-between">
                      <span>Strength: {strength.label}</span>
                      <span>Requires uppercase, lowercase & number</span>
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {/* Optional Wallet Connection Slot */}
              <div className="p-3.5 rounded-xl bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-navy-700 dark:text-navy-300 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-brand-600" /> Web3 Settlement Address
                  </span>
                  {address ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Linked
                    </span>
                  ) : (
                    <span className="text-navy-400">Optional</span>
                  )}
                </div>

                {address ? (
                  <span className="text-xs font-mono text-navy-500 dark:text-navy-400 block truncate">
                    {address}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => connectWallet()}
                  >
                    Connect MetaMask Wallet
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                Register as {selectedRole === "PRODUCER" ? "Energy Producer" : "Energy Consumer"}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-xs text-navy-400">
          Public administrator registration is prohibited. Administrator credentials are provisioned out-of-band.
        </div>
      </div>

      {/* Right Column (Branded Visual) */}
      <div className="hidden lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-brand-900 via-brand-950 to-navy-950 p-12 lg:p-16 relative overflow-hidden flex flex-col justify-between text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
            GreenLedger Protocol
          </span>
          <span className="text-xs text-brand-200/80 font-mono">Ethereum Sepolia</span>
        </div>

        <div className="my-auto max-w-md mx-auto w-full z-10 text-center space-y-6">
          <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 inline-block mx-auto">
            <Sun className="w-12 h-12 text-brand-400" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Fair Allocation. Decentralized Clean Energy.
          </h3>

          <p className="text-sm text-brand-100/80 leading-relaxed max-w-sm mx-auto">
            Join the peer-to-peer microgrid network where power is distributed proportionally, settlements are instant in ETH, and carbon offsets are verifiable on-chain.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left pt-4">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
              <span className="text-xs font-bold text-brand-400 block mb-1">For Producers:</span>
              <p className="text-xs text-brand-100/70">Automatic merit-order listings and instant settlement revenue.</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
              <span className="text-xs font-bold text-brand-400 block mb-1">For Consumers:</span>
              <p className="text-xs text-brand-100/70">Fair proportional allocation with verified ERC-721 certificates.</p>
            </div>
          </div>
        </div>

        <div className="z-10 text-xs text-brand-300/80 flex items-center justify-between">
          <span>Decentralized Renewable Trading</span>
          <span>© GreenLedger 2026</span>
        </div>
      </div>
    </div>
  );
}
