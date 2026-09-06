import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarCheck, Clock, CheckCircle2, XCircle, Plus, ChevronRight, TrendingUp } from "lucide-react";
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

const getGreeting = () => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";
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
  const completionRate = weekScheduled > 0 ? Math.round((weekCompleted / weekScheduled) * 100) : 0;

  const stats = [
    { label: "Total", value: total, icon: CalendarCheck, tone: "bg-sky-50 text-sky-700 ring-sky-100" },
    { label: "Today", value: today, icon: Clock, tone: "bg-amber-50 text-amber-700 ring-amber-100" },
    { label: "Completed", value: completed, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
    { label: "Cancelled", value: cancelled, icon: XCircle, tone: "bg-rose-50 text-rose-700 ring-rose-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-950">
      <section className="bg-blue-600 px-5 pb-9 pt-12 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-100">MyVisit Control</p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                {getGreeting()}, {userName}
              </h1>
               {/*<p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Gardez une vue claire sur les visites actives, les priorités du jour et la progression de la semaine.
              </p>*/}
            </div>
            <Link
              to="/myvisits?add=true"
              aria-label="Ajouter une visite"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg shadow-blue-900/20 transition hover:bg-blue-50 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-white/15 bg-white/15 px-2.5 py-2 shadow-sm backdrop-blur">
                <div className="mb-1 flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-medium text-blue-100">{s.label}</span>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ${s.tone}`}>
                    <s.icon className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-xl font-semibold leading-none tracking-normal text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {isLoading && (
            <p className="mt-4 text-xs text-blue-100">Chargement du tableau de bord...</p>
          )}

          {isError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error?.message || "Impossible de charger le tableau de bord."}</p>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <section className="-mt-12 mb-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/70">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-950">Cette semaine</p>
                <p className="text-xs text-zinc-500">Suivi de l'exécution</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {completionRate}% terminé
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-zinc-100 rounded-xl border border-zinc-100 bg-zinc-50">
            <div className="px-3 py-4 text-center">
              <p className="text-2xl font-semibold text-zinc-950">{weekScheduled}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">Planifiées</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-2xl font-semibold text-emerald-700">{weekCompleted}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">Terminées</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-2xl font-semibold text-amber-700">{weekPending || planned}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">En attente</p>
            </div>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Agenda</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">Prochaines visites</h2>
          </div>
          <Link to="/myvisits" className="flex items-center gap-1 text-sm font-medium text-blue-700 transition hover:text-blue-900">
            Tout voir <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-7 text-center shadow-sm">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <CalendarCheck className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-zinc-900">Aucune visite à venir</p>
            <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-zinc-500">
              Ajoutez une visite pour préparer l'accueil et suivre son statut depuis ce tableau de bord.
            </p>
            <Link to="/myvisits?add=true" className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Planifier une visite
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((v, index) => (
              <VisitCard key={getVisitorId(v) || v.id || index} visit={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
