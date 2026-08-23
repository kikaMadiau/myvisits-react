import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock, CheckCircle2, XCircle, Plus, ChevronRight, TrendingUp } from "lucide-react";
import VisitCard from "@/components/visits/VisitCard";
import { api } from "@/api/backendClient";
import { queryKeys } from "@/lib/queries";
import { getUserName } from "@/lib/userFields";
import { getVisitDate, getVisitorId } from "@/lib/visitFields";
import { isVisitUpcoming, parseVisitDate } from "@/lib/date";
import { useAuth } from "@/lib/AuthContext";

const getFirstValue = (source, fields) => {
  for (const field of fields) {
    const value = source?.[field];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return undefined;
};

const getNumber = (source, fields) => Number(getFirstValue(source, fields) || 0);

const getList = (source, fields) => {
  const value = getFirstValue(source, fields);
  return Array.isArray(value) ? value.filter(Boolean) : [];
};

const getObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

const getVisitsList = (source) => {
  if (Array.isArray(source)) return source.filter(Boolean);

  const data = getObject(source);
  return getList(data, ["data", "visits", "result", "items"]);
};

const isOpenVisit = (visit) => {
  const status = String(visit?.status || visit?.vis_status || "").toLowerCase();
  return !["completed", "complete", "cancelled", "canceled", "annulee", "annulée"].includes(status);
};

const sortByVisitDate = (a, b) => {
  const dateA = parseVisitDate(getVisitDate(a));
  const dateB = parseVisitDate(getVisitDate(b));

  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateA.getTime() - dateB.getTime();
};

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const { data: dashboardResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.dashboard.get(),
  });

  const { data: visitsResponse } = useQuery({
    queryKey: queryKeys.visits.all,
    queryFn: () => api.visits.list(),
  });

  const dashboard = getObject(dashboardResponse);
  const dashboardData = getObject(dashboard.dashboard || dashboard.data || dashboard.result || dashboard);
  const dashboardStats = getObject(dashboardData.stats || dashboardData.statistics || dashboardData.counters || dashboardData);
  const weekStats = getObject(dashboardData.this_week || dashboardData.thisWeek || dashboardData.week || dashboardData.week_stats || dashboardData);
  const dashboardUpcoming = getList(dashboardData, [
    "upcoming_visits",
    "upcomingVisits",
    "upcoming",
    "planned_visits",
    "plannedVisits",
    "next_visits",
    "nextVisits",
  ]);
  const visits = getVisitsList(visitsResponse);
  const upcomingSource = dashboardUpcoming.length > 0 ? dashboardUpcoming : visits;
  const upcoming = upcomingSource
    .filter((visit) => isOpenVisit(visit) && (isVisitUpcoming(getVisitDate(visit)) || !parseVisitDate(getVisitDate(visit))))
    .sort(sortByVisitDate)
    .slice(0, 5);

  const userName = getUserName(
    authUser ||
      dashboardData.user ||
      dashboardData.current_user ||
      dashboardData.currentUser ||
      dashboardData.profile ||
      dashboardData,
  ) || "Utilisateur";

  const total = getNumber(dashboardStats, ["total", "total_visits", "totalVisits", "visits_total", "visitsTotal"]);
  const today = getNumber(dashboardStats, ["today", "today_visits", "todayVisits", "visits_today", "visitsToday"]);
  const completed = getNumber(dashboardStats, ["completed", "completed_visits", "completedVisits", "visits_completed", "visitsCompleted"]);
  const cancelled = getNumber(dashboardStats, ["cancelled", "canceled", "cancelled_visits", "cancelledVisits", "visits_cancelled", "visitsCancelled"]);
  const planned = getNumber(dashboardStats, ["planned", "pending", "planned_visits", "plannedVisits", "visits_planned", "visitsPlanned"]);
  const weekScheduled = getNumber(weekStats, ["scheduled", "total", "planned", "this_week", "thisWeek", "scheduled_visits", "scheduledVisits"]);
  const weekCompleted = getNumber(weekStats, ["completed", "completed_visits", "completedVisits"]);
  const weekPending = getNumber(weekStats, ["pending", "planned", "planned_visits", "plannedVisits"]);

  const stats = [
    { label: "Total", value: total, icon: CalendarCheck, color: "bg-blue-50 text-blue-600" },
    { label: "Today", value: today, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Cancelled", value: cancelled, icon: XCircle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 pt-12 pb-8 px-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h1 className="text-white text-xl font-bold">{userName}</h1>
          </div>
          <Link
            to="/myvisits?add=true"
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-4 h-4 text-blue-100" />
                <span className="text-blue-100 text-xs font-medium">{s.label}</span>
              </div>
              <p className="text-white text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {isLoading && (
          <p className="text-blue-100 text-xs mt-4">Chargement du tableau de bord...</p>
        )}

        {isError && (
          <p className="text-red-100 text-xs mt-4">
            {error?.message || "Impossible de charger le tableau de bord."}
          </p>
        )}
      </div>

      {/* Upcoming */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Upcoming Visits</h2>
          <Link to="/myvisits" className="text-blue-600 text-xs font-medium flex items-center gap-0.5">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No upcoming visits</p>
            <Link to="/myvisits?add=true" className="text-blue-600 text-sm font-medium mt-2 inline-block">
              Schedule one →
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((v, index) => (
              <VisitCard key={getVisitorId(v) || v.id || index} visit={v} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats 
      <div className="px-5 mt-6 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">This Week</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{weekScheduled}</p>
              <p className="text-[11px] text-gray-400">Scheduled</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{weekCompleted}</p>
              <p className="text-[11px] text-gray-400">Completed</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{weekPending || planned}</p>
              <p className="text-[11px] text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </div>*/}
    </div>
  );
}
