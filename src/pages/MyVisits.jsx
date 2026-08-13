import { useState, useEffect } from "react"; 
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"; 
import { Plus, Search, Loader2, AlertCircle } from "lucide-react"; 
import VisitCard from "@/components/visits/VisitCard"; 
import StatusFilter from "@/components/visits/StatusFilter"; 
import AddVisitForm from "@/components/visits/AddVisitForm"; 
import { useSearchParams } from "react-router-dom"; 
import { api } from "@/api/backendClient"; 
import { queryKeys } from "@/lib/queries"; 
import { getVisitSearchText, getVisitorId } from "@/lib/visitFields"; 

export default function MyVisits() { 
  const queryClient = useQueryClient(); 
  const [filter, setFilter] = useState("all"); 
  const [search, setSearch] = useState(""); 
  const [showAdd, setShowAdd] = useState(false); 
  const [searchParams] = useSearchParams(); 

  // Récupération des données avec gestion des états de chargement et d'erreur 
  const { data: visits = [], isLoading, isError, error } = useQuery({ 
    queryKey: queryKeys.visits.all, 
    queryFn: () => api.visits.list(), 
  }); 

  // MUTATION : Mise à jour du statut (PATCH)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.visits.update(id, { status }),
    onSuccess: (updatedVisit) => {
      // Met à jour la visite modifiée directement dans la liste locale du cache
      queryClient.setQueryData(queryKeys.visits.all, (oldVisits = []) =>
        oldVisits.map((v) => (v.id === updatedVisit.id ? { ...v, ...updatedVisit } : v))
      );
    },
    onError: (err) => alert(`Failed to update status: ${err.message}`)
  });

  // MUTATION : Suppression (DELETE)
  const deleteMutation = useMutation({
    mutationFn: (id) => api.visits.remove(id),
    onSuccess: (_, id) => {
      // Supprime la visite du cache local immédiatement
      queryClient.setQueryData(queryKeys.visits.all, (oldVisits = []) =>
        oldVisits.filter((v) => v.id !== id)
      );
    },
    onError: (err) => alert(`Failed to delete visit: ${err.message}`)
  });

  useEffect(() => { 
    if (searchParams.get("add") === "true") setShowAdd(true); 
  }, [searchParams]); 

  // Rafraîchit instantanément la liste après un ajout réussi dans AddVisitForm 
  const refreshVisits = () => { 
    queryClient.invalidateQueries({ queryKey: queryKeys.visits.all }); 
  }; 

  // Filtrage combiné (Statut + Recherche textuelle) 
  const filtered = visits.filter((v) => { 
    if (filter !== "all" && v.status !== filter) return false; 
    const matchSearch = getVisitSearchText(v).includes(search.toLowerCase()); 
    if (search && !matchSearch) return false; 
    return true; 
  }); 

  return ( 
    <div className="min-h-screen bg-gray-50"> 
      {/* Header */} 
      <div className="bg-white pt-12 pb-4 px-5 border-b border-gray-100"> 
        <div className="flex items-center justify-between mb-4"> 
          <h1 className="text-xl font-bold text-gray-900">My Visits</h1> 
          <button onClick={() => setShowAdd(true)} className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors" > 
            <Plus className="w-5 h-5 text-white" /> 
          </button> 
        </div> 
        <div className="relative mb-3"> 
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /> 
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search visits..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" /> 
        </div> 
        <StatusFilter value={filter} onChange={setFilter} /> 
      </div> 

      {/* List Content */} 
      <div className="px-5 py-4"> 
        {/* 1. État de chargement initial */} 
        {isLoading && ( 
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2"> 
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> 
            <p className="text-sm">Loading visits...</p> 
          </div> 
        )} 

        {/* 2. État d'erreur API */} 
        {isError && ( 
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-700"> 
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
            <div> 
              <p className="font-semibold text-sm">Failed to load visits</p> 
              <p className="text-xs text-red-600/80 mt-0.5">{error?.message || "Unknown error"}</p> 
            </div> 
          </div> 
        )} 

        {/* 3. Affichage des listes si le chargement est fini et sans erreur */} 
        {!isLoading && !isError && ( 
          filtered.length === 0 ? ( 
            <div className="text-center py-16"> 
              <p className="text-gray-400 text-sm">No visits found</p> 
              <button onClick={() => setShowAdd(true)} className="text-blue-600 text-sm font-medium mt-2 hover:underline" > 
                + Add your first visit 
              </button> 
            </div> 
          ) : ( 
            <div className="space-y-2.5"> 
              {filtered.map((v) => ( 
                <VisitCard 
                  key={getVisitorId(v)} 
                  visit={v} 
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                  isActionPending={deleteMutation.isPending || updateStatusMutation.isPending}
                /> 
              ))} 
            </div> 
          ) 
        )} 
      </div> 

      {/* Formulaire Modal */} 
      {showAdd && ( 
        <AddVisitForm onClose={() => setShowAdd(false)} onCreated={refreshVisits} /> 
      )} 
    </div> 
  ); 
}
