import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const formatError = (err: any, fallback: string): string => {
  if (typeof err?.response?.data?.detail === "string") {
    return err.response.data.detail;
  }
  if (Array.isArray(err?.response?.data?.detail)) {
    return err.response.data.detail
      .map((e: any) => e.msg || JSON.stringify(e))
      .join(", ");
  }
  return err.message || err.toString() || fallback;
};

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(formatError(err, "Registration failed"));
      console.error("Full error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fadeIn">
        {/* Brand Heading */}
        <div className="text-center mb-12">
          <h1 className="text-display-1 font-display text-white mb-4 tracking-tight">
            Create Account
          </h1>
          <h2 className="text-display-3 font-display text-silver mb-2 tracking-tight">
            Join the Platform
          </h2>
          <p className="text-soft-silver text-sm font-light">
            Start creating premium documents
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8 animate-fadeInUp">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create your account
            </h2>
            <p className="text-silver text-sm">
              Or{" "}
              <Link
                to="/login"
                className="text-white hover:text-soft-silver transition-colors underline underline-offset-2"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-silver mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-premium"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-silver mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-premium"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-silver mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-premium"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-premium-black w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
