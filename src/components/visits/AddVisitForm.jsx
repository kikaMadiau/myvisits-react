import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/api/backendClient";

export default function AddVisitForm({ onClose, onCreated }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    visitor_prenom: "",
    visitor_nom: "",
    visitor_post_nom: "",
    visitor_email: "",
    visitor_gender: "",
    contact_phone: "",
    appointment_date: "",
    status: "planned",
    priority: "",
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isFormValid =
    form.visitor_prenom &&
    form.visitor_nom &&
    form.visitor_post_nom &&
    form.visitor_gender &&
    form.contact_phone &&
    form.visitor_email &&
    form.appointment_date &&
    form.priority;

  const formatAppointmentDate = (value) => {
    const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!match) {
      throw new Error("La date du rendez-vous doit respecter le format JJ-MM-AAAA HH:MM.");
    }

    const [, day, month, year, hours, minutes] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    const isValidDate =
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day) &&
      date.getHours() === Number(hours) &&
      date.getMinutes() === Number(minutes);

    if (!isValidDate) {
      throw new Error("La date sélectionnée est invalide.");
    }

    return `${month}-${day}-${year} ${hours}:${minutes}`;
  };

  // Convertit la priorité textuelle en valeur numérique attendue par l'API
  const getPriorityValue = (priority) => {
    if (priority === "high") return "1";
    if (priority === "medium") return "2";
    if (priority === "low") return "3";
    return "2"; // Valeur par défaut
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isFormValid) return;

  setIsLoading(true);
  try {
    // Payload ajusté selon le format que vous avez fourni
    const payload = {
      vis_prenom: form.visitor_prenom,
      vis_nom: form.visitor_nom,
      vis_post_nom: form.visitor_post_nom,
      vis_gender: form.visitor_gender,
      vis_tel: form.contact_phone,
      vis_email: form.visitor_email,
      vis_rdvDate: formatAppointmentDate(form.appointment_date),
      vis_priority: getPriorityValue(form.priority),
    };

    // 3. Utilisation de votre client d'origine pour passer la sécurité CORS
    await api.visits.create(payload);
    
    toast({ title: "Visit created successfully" });
    await onCreated?.();
    onClose();
  } catch (error) {
    console.error("Erreur complète :", error);
    toast({ 
      title: error.message || "Failed to create visit", 
      variant: "destructive" 
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">New Visit</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1">Prénom *</Label>
            <Input value={form.visitor_prenom} onChange={(e) => update("visitor_prenom", e.target.value)} placeholder="Prénom du visiteur" />
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1">Nom *</Label>
            <Input value={form.visitor_nom} onChange={(e) => update("visitor_nom", e.target.value)} placeholder="Nom du visiteur" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Post-nom *</Label>
            <Input value={form.visitor_post_nom} onChange={(e) => update("visitor_post_nom", e.target.value)} placeholder="Post-nom du visiteur" />
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1">Genre *</Label>
            <Select value={form.visitor_gender || undefined} onValueChange={(v) => update("visitor_gender", v)}>
              <SelectTrigger>
                <SelectValue placeholder="-- Sélectionnez --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="female">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Téléphone *</Label>
            <Input type="tel" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="+243 000 000 000" />
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1">Email *</Label>
            <Input type="email" value={form.visitor_email} onChange={(e) => update("visitor_email", e.target.value)} placeholder="email@example.com" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Date du rendez-vous *</Label>
            <Input
              value={form.appointment_date}
              onChange={(e) => update("appointment_date", e.target.value)}
              placeholder="JJ-MM-AAAA HH:MM"
              inputMode="numeric"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Priorité *</Label>
            <Select value={form.priority || undefined} onValueChange={(v) => update("priority", v)}>
              <SelectTrigger><SelectValue placeholder="-- Sélectionnez --" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={isLoading || !isFormValid} className="w-full h-12 rounded-xl text-[15px] font-semibold bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Création..." : "Créer la visite"}
          </Button>
        </form>
      </div>
    </div>
  );
}
