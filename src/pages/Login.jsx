import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/api/backendClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, LogIn, Mail, Lock, Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";

const LOGO_URL = "https://res.cloudinary.com/dnrljxeuv/image/upload/v1779204775/logo-final-presidence_1_rxim43.png";

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
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-slate-950 sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center sm:min-h-0">
        <div className="mb-6 overflow-hidden rounded-3xl bg-blue-600 p-5 text-white shadow-xl shadow-blue-100">
          <div className="flex items-center justify-between gap-4">
            <img src={LOGO_URL} alt="MyVisit" className="h-14 w-14 rounded-2xl bg-white object-contain p-1.5 shadow-md" />
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <LogIn className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-100">Connexion</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">Bienvenue</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Connectez-vous pour gérer vos visites.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/70">
          <Button
            type="button"
            variant="outline"
            className="mb-5 h-12 w-full rounded-xl border-gray-200 text-sm font-semibold hover:bg-blue-50 hover:text-blue-700"
            onClick={handleGoogle}
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continuer avec Google
          </Button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-medium text-gray-400">ou</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 space-y-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <div className="flex gap-2">
                {sessionConflict && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                <p>{error}</p>
              </div>
              {sessionConflict && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={handleForceLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <Label htmlFor="email" className="text-xs font-semibold text-gray-500">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-10 focus-visible:ring-blue-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-500">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-10 focus-visible:ring-blue-200"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
