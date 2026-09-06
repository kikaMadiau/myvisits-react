import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, LogOut, Mail, Phone, Shield, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/api/backendClient";
import { useAuth } from "@/lib/AuthContext";
import { queryKeys } from "@/lib/queries";
import {
  getUserEmail,
  getUserInitial,
  getUserName,
  getUserPhone,
  getUserRole,
} from "@/lib/userFields";

export default function Profile() {
  const { toast } = useToast();
  const { logout, user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.auth.me(),
    initialData: authUser,
  });

  const displayName = getUserName(user) || "Utilisateur";
  const displayEmail = getUserEmail(user);
  const displayPhone = getUserPhone(user);
  const displayRole = getUserRole(user);
  const displayInitial = getUserInitial(user);

  useEffect(() => {
    setPhone(displayPhone);
  }, [displayPhone]);

  const updateMutation = useMutation({
    mutationFn: (payload) => api.auth.updateMe(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.user, updated);
      toast({ title: "Profil mis à jour" });
    },
    onError: (error) => {
      toast({ title: error.message || "Impossible de mettre à jour le profil", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ phone });
  };

  const handleLogout = async () => {
    await logout();
  };

  const profileItems = [
    { label: "Nom complet", value: displayName || "—", icon: User },
    { label: "Email", value: displayEmail || "—", icon: Mail },
    { label: "Rôle", value: displayRole || "user", icon: Shield, capitalize: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-950">
      <section className="bg-blue-600 px-5 pb-20 pt-12 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-100">Compte</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold leading-tight">Profil</h1>
              <p className="mt-1 text-sm text-blue-100">Gérez vos informations personnelles.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 active:scale-95"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-14 max-w-3xl px-5 pb-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-xl shadow-blue-100/70">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-semibold text-white shadow-lg shadow-blue-200">
            {displayInitial}
          </div>
          <h2 className="mt-4 truncate text-lg font-semibold text-slate-950">{displayName}</h2>
          <p className="mt-1 truncate text-sm text-slate-500">{displayEmail || "—"}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Compte actif
          </div>
        </section>

        <div className="mt-5 space-y-4">
        {isLoading && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
            Chargement du profil...
          </div>
        )}

        {isError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error?.message || "Impossible de charger les informations utilisateur."}</p>
          </div>
        )}

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {profileItems.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 p-4 ${index > 0 ? "border-t border-gray-100" : ""}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400">{item.label}</p>
                  <p className={`truncate text-sm font-semibold text-gray-900 ${item.capitalize ? "capitalize" : ""}`}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Téléphone</p>
                <p className="text-xs text-gray-500">Utilisé pour vous contacter rapidement.</p>
              </div>
            </div>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+243 000 000 000"
              className="mb-3 h-11 rounded-xl border-gray-200 bg-gray-50"
            />
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </section>

          <button
            onClick={handleLogout}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </main>
    </div>
  );
}
