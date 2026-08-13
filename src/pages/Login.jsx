import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/api/backendClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.auth.login(email, password);
      
      // Après un login réussi, l'API pourrait :
      // 1. Retourner directement un token (authentification sans OTP)
      // 2. Retourner un message indiquant qu'un OTP a été envoyé
      // 3. Retourner un statut "success" avec d'autres données
      
      console.log("Login response:", result);
      
      // Vérifier si un token est présent
      if (result?.access_token || result?.token) {
        // Authentification directe réussie
        api.auth.setToken(result.access_token || result.token);
        toast.success("Connexion réussie !");
        setTimeout(() => {
          window.location.href = searchParams.get("redirect") || "/";
        }, 1000);
      } 
      // Vérifier si un OTP est requis (basé sur différents patterns possibles)
      else if (result?.requires_otp || result?.otp_required || 
               result?.status === "otp_required" || 
               result?.message?.toLowerCase()?.includes('otp') ||
               result?.message?.toLowerCase()?.includes('code') ||
               result?.message?.toLowerCase()?.includes('vérification')) {
        
        // Rediriger vers la page de vérification OTP
        const redirectParam = searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : '';
        toast.info("Code OTP envoyé à votre email");
        navigate(`/verify-otp?email=${encodeURIComponent(email)}${redirectParam}`);
      }
      // Autres cas de succès (peut-être juste un message de confirmation)
      else if (result?.status === "success" || result?.success) {
        // L'API indique que le login a réussi mais peut-être qu'un OTP sera envoyé séparément
        // Ou peut-être que l'utilisateur doit vérifier son email
        toast.info(result.message || "Veuillez vérifier votre email pour continuer");
        const redirectParam = searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : '';
        navigate(`/verify-otp?email=${encodeURIComponent(email)}${redirectParam}`);
      }
      else {
        // Cas par défaut : supposer que le login a réussi sans OTP
        toast.success("Connexion réussie !");
        setTimeout(() => {
          window.location.href = searchParams.get("redirect") || "/";
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
      toast.error(err.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
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
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
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
