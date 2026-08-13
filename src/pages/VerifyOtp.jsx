import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/api/backendClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Le code OTP doit contenir 6 chiffres");
      return;
    }

    setError("");
    setLoading(true);
    console.log("=== VERIFICATION OTP DÉBUT ===");
    console.log("Email:", email);
    console.log("OTP:", otp);
    
    try {
      const result = await api.auth.verifyOtp(email, otp);
      console.log("Résultat verifyOtp:", result);
      
      toast.success("Vérification réussie ! Redirection...");
      
      // Stocker le token si présent dans la réponse
      const token = result?.access_token || result?.token;
      if (token) {
        console.log("Token trouvé, sauvegarde...");
        api.auth.setToken(token);
      } else {
        console.log("Aucun token dans la réponse");
      }
      
      // Vérifier le token après sauvegarde
      const storedToken = api.auth.getToken();
      console.log("Token stocké:", storedToken ? "OUI" : "NON");
      
      // Rediriger immédiatement après succès
      const redirect = searchParams.get("redirect") || "/dashboard";
      console.log("Redirection immédiate vers:", redirect);
      console.log("Token stocké:", api.auth.getToken());
      
      // Redirection immédiate
      window.location.href = redirect;
    } catch (err) {
      console.log(" Erreur verifyOtp:", err);
      setError(err.message || "Code OTP invalide. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError("");
    try {
      await api.auth.resendOtp(email);
      toast.success("Nouveau code OTP envoyé à votre email");
      setCountdown(60); // Redémarrer le compte à rebours
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du code OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <AuthLayout
      icon={KeyRound}
      logo="https://res.cloudinary.com/dnrljxeuv/image/upload/v1779204775/logo-final-presidence_1_rxim43.png"
      title="Vérification OTP"
      subtitle={`Entrez le code à 6 chiffres envoyé à ${email}`}
      footer={
        <>
          <div className="text-center text-sm text-muted-foreground">
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Retour au login
            </Button>
          </div>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="pl-10 h-12 bg-muted"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Code OTP envoyé à cette adresse email
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="otp">Code OTP</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) setOtp(value);
              }}
              className="pl-10 h-12 text-center text-2xl tracking-widest"
              autoFocus
              required
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Entrez les 6 chiffres reçus par email
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleResendOtp}
            disabled={resendLoading || countdown > 0}
            className="h-10"
          >
            {resendLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {countdown > 0 ? `Renvoyer dans ${countdown}s` : "Renvoyer le code"}
          </Button>
          
          <Button type="submit" className="h-12 font-medium px-8" disabled={loading || otp.length !== 6}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">Vous n'avez pas reçu le code ?</p>
        <ul className="space-y-1 text-xs">
          <li>• Vérifiez vos spams ou courriers indésirables</li>
          <li>• Assurez-vous que l'adresse email est correcte</li>
          <li>• Le code expire après 10 minutes</li>
        </ul>
      </div>
    </AuthLayout>
  );
}