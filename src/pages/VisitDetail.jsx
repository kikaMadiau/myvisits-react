import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Ban, MapPin, Clock, Phone, FileText, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/api/backendClient";
import { formatVisitDate } from "@/lib/date";
import { queryKeys } from "@/lib/queries";
import { getVisitDate, getVisitorId, getVisitorName, getVisitorPhone } from "@/lib/visitFields";

const statusColors = {
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const typeLabels = {
  inspection: "Inspection",
  maintenance: "Maintenance",
  consultation: "Consultation",
  follow_up: "Follow Up",
  other: "Other",
};

const hiddenDetailFields = new Set([
  "id",
  "vis_id",
  "vis_prenom",
  "vis_nom",
  "vis_post_nom",
  "vis_tel",
  "vis_rdvDate",
  "client_name",
  "contact_phone",
  "visit_date",
  "status",
  "report",
  "notes",
  "address",
  "visit_type",
  "duration_minutes",
]);

const formatFieldLabel = (key) =>
  key
    .replace(/^vis_/, "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getExtraDetails = (visit) =>
  Object.entries(visit || {}).filter(([key, value]) => {
    if (hiddenDetailFields.has(key)) return false;
    if (value === null || value === undefined || value === "") return false;
    return typeof value !== "object";
  });

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editReport, setEditReport] = useState(false);
  const [report, setReport] = useState("");

  const { data: visit, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.visits.detail(id),
    queryFn: () => api.visitors.get(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    setReport(visit?.report || "");
  }, [visit?.report]);

  const updateMutation = useMutation({
    mutationFn: (payload) => api.visits.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.visits.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.visits.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
      toast({ title: "Visit deleted" });
      navigate("/myvisits");
    },
  });

  const blacklistMutation = useMutation({
    mutationFn: (visitorId) => api.blacklist.create({ vis_id: visitorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
      toast({ title: "Visitor blacklisted" });
    },
    onError: (err) => {
      toast({
        title: err.message || "Failed to blacklist visitor",
        variant: "destructive",
      });
    },
  });

  const updateStatus = async (status) => {
    await updateMutation.mutateAsync({ status });
    toast({ title: `Status updated to ${status.replace("_", " ")}` });
  };

  const saveReport = async () => {
    await updateMutation.mutateAsync({ report });
    setEditReport(false);
    toast({ title: "Report saved" });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this visit?")) return;
    await deleteMutation.mutateAsync();
  };

  const handleBlacklist = async () => {
    if (!confirm("Blacklist this visitor?")) return;
    await blacklistMutation.mutateAsync(visitorId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5 text-center">
        <p className="text-red-600 font-semibold mb-1">Failed to load visit details</p>
        <p className="text-gray-400 text-sm mb-4">{error?.message || "Unknown error"}</p>
        <Button variant="outline" onClick={() => navigate("/myvisits")}>Go back</Button>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5">
        <p className="text-gray-400 mb-3">Visit not found</p>
        <Button variant="outline" onClick={() => navigate("/myvisits")}>Go back</Button>
      </div>
    );
  }

  const visitDate = getVisitDate(visit);
  const visitorId = getVisitorId(visit) || id;
  const visitorName = getVisitorName(visit);
  const visitorPhone = getVisitorPhone(visit);
  const extraDetails = getExtraDetails(visit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white pt-12 pb-5 px-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/myvisits")} className="p-1">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{visitorName}</h1>
          <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50">
            <Trash2 className="w-4.5 h-4.5 text-red-400" />
          </button>
        </div>
        {visit.status && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[visit.status] || statusColors.planned}`}>
            {visit.status.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Info Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3.5">
          <div className="flex items-start gap-3">
            <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Visitor</p>
              <p className="text-sm text-gray-800">{visitorName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Address</p>
              <p className="text-sm text-gray-800">{visit.address || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
              <p className="text-sm text-gray-800">
                {formatVisitDate(visitDate, "EEE, MMM d yyyy · HH:mm")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{visit.duration_minutes || 60} min</p>
            </div>
          </div>
          {visitorPhone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Contact</p>
                <a href={`tel:${visitorPhone}`} className="text-sm text-blue-600">{visitorPhone}</a>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <FileText className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Type</p>
              <p className="text-sm text-gray-800">{typeLabels[visit.visit_type] || visit.visit_type || "—"}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {visit.notes && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
          </div>
        )}

        {/* Report 
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Visit Report</p>
            {!editReport && (
              <button onClick={() => setEditReport(true)} className="text-blue-600 text-xs font-medium flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {editReport ? (
            <div className="space-y-2">
              <Textarea value={report} onChange={(e) => setReport(e.target.value)} placeholder="Write your visit report..." rows={4} />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveReport} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditReport(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.report || "No report yet."}</p>
          )}
        </div>

        {extraDetails.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-3">Additional Details</p>
            <div className="space-y-2.5">
              {extraDetails.map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-gray-400">{formatFieldLabel(key)}</span>
                  <span className="text-gray-800 text-right break-words">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}*/}

        <div className="bg-white rounded-2xl p-4 border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Blacklist Visitor</p>
              <p className="text-xs text-gray-400 truncate">{visitorName}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="w-full rounded-xl"
            onClick={handleBlacklist}
            disabled={blacklistMutation.isPending || !visitorId}
          >
            {blacklistMutation.isPending ? "Blacklisting..." : "Blacklist"}
          </Button>
        </div>

        {/* Status Update */}
        {visit.status && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Update Status</p>
          <Select value={visit.status} onValueChange={updateStatus}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          </div>
        )}
      </div>
    </div>
  );
}
