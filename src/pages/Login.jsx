import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/api/backendClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionConflict, setSessionConflict] = useState(false);
  const [loading, setLoading] = useState(false);

  const completeLogin = (result) => {
    console.log("Login response:", result);

    if (result?.access_token || result?.token) {
      api.auth.setToken(result.access_token || result.token);
      toast.success("Connexion réussie !");
      setTimeout(() => {
        window.location.href = searchParams.get("redirect") || "/";
      }, 1000);
      return;
    }

    if (result?.requires_otp || result?.otp_required ||
         result?.status === "otp_required" ||
         result?.message?.toLowerCase()?.includes("otp") ||
         result?.message?.toLowerCase()?.includes("code") ||
         result?.message?.toLowerCase()?.includes("vérification")) {
      const redirectParam = searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "";
      toast.info("Code OTP envoyé à votre email");
      navigate(`/verify-otp?email=${encodeURIComponent(email)}${redirectParam}`);
      return;
    }

    if (result?.status === "success" || result?.success) {
      toast.info(result.message || "Veuillez vérifier votre email pour continuer");
      const redirectParam = searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "";
      navigate(`/verify-otp?email=${encodeURIComponent(email)}${redirectParam}`);
      return;
    }

    toast.success("Connexion réussie !");
    setTimeout(() => {
      window.location.href = searchParams.get("redirect") || "/";
    }, 1000);
  };

  const submitLogin = async ({ forceLogin = false } = {}) => {
    setError("");
    setSessionConflict(false);
    setLoading(true);
    try {
      const result = await api.auth.login(email, password, { forceLogin });
      completeLogin(result);
    } catch (err) {
      if (err.status === 409) {
        const message = err.message || "Une session est déjà active sur un autre appareil.";
        setSessionConflict(true);
        setError(message);
        toast.error(message);
        return;
      }

      setError(err.message || "Email ou mot de passe incorrect");
      toast.error(err.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    submitLogin();
  };

  const handleForceLogin = () => {
    submitLogin({ forceLogin: true });
  };

  const handleGoogle = () => {
    api.auth.loginWithProvider("google", searchParams.get("redirect") || "/");
  };

  return (
    <AuthLayout
      icon={LogIn}
      logo="https://res.cloudinary.com/dnrljxeuv/image/upload/v1779204775/logo-final-presidence_1_rxim43.png"
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 space-y-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex gap-2">
            {sessionConflict && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
            <p>{error}</p>
          </div>
          {sessionConflict && (
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleForceLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter sur cet appareil"
              )}
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
