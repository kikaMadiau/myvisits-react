import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-12 pb-6 px-5 border-b border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl font-bold text-blue-600">
            {displayInitial}
          </span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">{displayName}</h1>
        <p className="text-sm text-gray-400">{displayEmail || "—"}</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {isLoading && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-sm text-gray-500">
            Chargement du profil...
          </div>
        )}

        {isError && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-sm text-red-600">
            {error?.message || "Impossible de charger les informations utilisateur."}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Nom complet</p>
              <p className="text-sm font-medium text-gray-800">{displayName || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800">{displayEmail || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Rôle</p>
              <p className="text-sm font-medium text-gray-800 capitalize">{displayRole || "user"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Téléphone</p>
          </div>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+243 000 000 000"
            className="rounded-xl mb-3"
          />
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 text-red-500 font-medium text-sm"
        >
          <LogOut className="w-4.5 h-4.5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
