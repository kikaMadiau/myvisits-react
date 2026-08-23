import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    visitor_gender: "male", // Validé par l'API
    address: "",
    visit_date: "",
    status: "planned",
    priority: "medium",
    visit_type: "inspection",
    contact_phone: "",
    duration_minutes: "60",
    notes: "",
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Convertit la priorité textuelle en valeur numérique attendue par l'API
  const getPriorityValue = (priority) => {
    if (priority === "high") return "1";
    if (priority === "medium") return "2";
    if (priority === "low") return "3";
    return "2"; // Valeur par défaut
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.visitor_nom || !form.visitor_prenom || !form.visit_date) return;

  setIsLoading(true);
  try {
    const dateObj = new Date(form.visit_date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("La date sélectionnée est invalide.");
    }

    // Le backend attend un format de date spécifique : "m-d-Y H:i" (ex: 08-10-2026 18:00)
    const pad = (num) => num.toString().padStart(2, '0');
    
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1); // Les mois sont de 0 à 11
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    
    const formattedDate = `${month}-${day}-${year} ${hours}:${minutes}`;

    // Payload ajusté selon le format que vous avez fourni
    const payload = {
      vis_prenom: form.visitor_prenom,
      vis_nom: form.visitor_nom,
      vis_post_nom: form.visitor_post_nom || "",
      vis_gender: form.visitor_gender,
      vis_tel: form.contact_phone || "",
      vis_email: form.visitor_email || "",
      vis_rdvDate: formattedDate,
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
            <Label className="text-xs text-gray-500 mb-1">Nom *</Label>
            <Input value={form.visitor_nom} onChange={(e) => update("visitor_nom", e.target.value)} placeholder="Nom du visiteur" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Prénom *</Label>
            <Input value={form.visitor_prenom} onChange={(e) => update("visitor_prenom", e.target.value)} placeholder="Prénom du visiteur" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Post-nom</Label>
            <Input value={form.visitor_post_nom} onChange={(e) => update("visitor_post_nom", e.target.value)} placeholder="Post-nom du visiteur" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Email</Label>
            <Input type="email" value={form.visitor_email} onChange={(e) => update("visitor_email", e.target.value)} placeholder="email@example.com" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Genre *</Label>
            <Select value={form.visitor_gender} onValueChange={(v) => update("visitor_gender", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="female">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Address</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Visit location" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1">Date & Time *</Label>
              <Input type="datetime-local" value={form.visit_date} onChange={(e) => update("visit_date", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Duration (min)</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => update("duration_minutes", e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1">Type</Label>
              <Select value={form.visit_type} onValueChange={(v) => update("visit_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Contact Phone</Label>
            <Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="+1 234 567 890" />
          </div>
          
          <div>
            <Label className="text-xs text-gray-500 mb-1">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any additional notes..." rows={3} />
          </div>
          
          <Button type="submit" disabled={isLoading || !form.visitor_nom || !form.visitor_prenom || !form.visit_date} className="w-full h-12 rounded-xl text-[15px] font-semibold bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Creating..." : "Create Visit"}
          </Button>
        </form>
      </div>
    </div>
  );
}
