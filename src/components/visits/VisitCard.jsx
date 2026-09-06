import { Link } from "react-router-dom";
import { ChevronRight, Clock, Phone } from "lucide-react";
import { formatVisitDate, formatVisitTime } from "@/lib/date";
import { getVisitDate, getVisitTime, getVisitorId, getVisitorName, getVisitorPhone } from "@/lib/visitFields";

const statusStyles = {
  planned: {
    label: "Planifiée",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  in_progress: {
    label: "En cours",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  completed: {
    label: "Terminée",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  cancelled: {
    label: "Annulée",
    className: "bg-rose-50 text-rose-700 ring-rose-100",
  },
};

const priorityStyles = {
  low: "bg-slate-300",
  medium: "bg-amber-400",
  high: "bg-rose-500",
};

const getStatus = (status) => {
  const normalizedStatus = String(status || "planned").toLowerCase();
  return statusStyles[normalizedStatus] || {
    label: normalizedStatus.replace("_", " "),
    className: statusStyles.planned.className,
  };
};

export default function VisitCard({ visit }) {
  const visitorName = getVisitorName(visit);
  const visitorId = getVisitorId(visit);
  const visitDate = getVisitDate(visit);
  const visitTime = getVisitTime(visit);
  const visitorPhone = getVisitorPhone(visit);
  const status = getStatus(visit.status || visit.vis_status);
  const priorityClassName = priorityStyles[visit.priority] || priorityStyles.medium;

  return (
    <Link
      to={`/myvisits/${encodeURIComponent(visitorId)}`}
      className="group block rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 px-2 py-1.5 text-blue-700 ring-1 ring-blue-100">
          <span className="text-[11px] font-semibold leading-none">{formatVisitDate(visitDate, "dd MMM")}</span>
          <span className="mt-1 flex items-center gap-1 text-[10px] font-medium leading-none text-blue-600/80">
            <Clock className="h-2.5 w-2.5" />
            {formatVisitTime(visitTime)}
          </span>
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${priorityClassName}`} />
            <h3 className="truncate text-sm font-semibold leading-5 text-slate-950">{visitorName}</h3>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{visitorPhone || "Pas de téléphone"}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 sm:inline-flex ${status.className}`}>
            {status.label}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </div>
      </div>

      <div className="mt-2 flex justify-end sm:hidden">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.className}`}>
          {status.label}
        </span>
      </div>
    </Link>
  );
}
