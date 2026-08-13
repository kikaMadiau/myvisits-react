import { Link } from "react-router-dom";
import { Clock, ChevronRight, Phone, UserRound } from "lucide-react";
import { formatVisitTime } from "@/lib/date";
import { getVisitTime, getVisitorId, getVisitorName, getVisitorPhone } from "@/lib/visitFields";

const statusColors = {
  planned: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
};

const priorityDots = {
  low: "bg-gray-300",
  medium: "bg-amber-400",
  high: "bg-red-500",
};

export default function VisitCard({ visit }) {
  const visitorName = getVisitorName(visit);
  const visitorId = getVisitorId(visit);
  const visitTime = getVisitTime(visit);
  const visitorPhone = getVisitorPhone(visit);

  return (
    <Link
      to={`/myvisits/${encodeURIComponent(visitorId)}`}
      className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${priorityDots[visit.priority] || priorityDots.medium}`} />
            <h3 className="font-semibold text-gray-900 text-[15px] truncate">{visitorName}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{formatVisitTime(visitTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{visitorPhone || "No phone number"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[visit.status] || statusColors.planned}`}>
              {visit.status?.replace("_", " ")}
            </span>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <UserRound className="w-3 h-3" />
              <span>Visiteur</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 mt-1 shrink-0" />
      </div>
    </Link>
  );
}
