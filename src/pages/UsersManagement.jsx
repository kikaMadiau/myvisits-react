import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/api/backendClient";
import { queryKeys } from "@/lib/queries";

export default function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => api.users.list(),
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await api.users.invite(inviteEmail, inviteRole);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast({ title: "Invitation sent!" });
      setInviteEmail("");
      setShowInvite(false);
    } catch (error) {
      toast({ title: error.message || "Failed to send invitation", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200"
          >
            <UserPlus className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
        <p className="text-sm text-gray-400">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="px-5 pt-4">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-sm font-semibold text-blue-900 mb-3">Invite a new user</p>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="rounded-xl mb-2 bg-white"
            />
            <div className="flex gap-2">
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="rounded-xl bg-white flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                {inviting ? "..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="px-5 py-4 space-y-2.5">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-gray-500">
                {u.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name || "Unnamed"}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Mail className="w-3 h-3" />
                <span className="truncate">{u.email}</span>
              </div>
            </div>
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              u.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"
            }`}>
              {u.role || "user"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
