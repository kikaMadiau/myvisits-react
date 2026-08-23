import { useEffect, useRef, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export default function PwaStatus() {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const waitingWorkerRef = useRef(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const updateOnlineState = () => setIsOffline(!navigator.onLine);

    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || import.meta.env.DEV) return undefined;

    const onControllerChange = () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      window.location.reload();
    };

    const showUpdateToast = (worker) => {
      waitingWorkerRef.current = worker;
      toast({
        title: "Mise à jour disponible",
        description: "Une nouvelle version de l'application est prête.",
        duration: Infinity,
        action: (
          <ToastAction
            onClick={() => waitingWorkerRef.current?.postMessage({ type: "SKIP_WAITING" })}
          >
            Actualiser
          </ToastAction>
        ),
      });
    };

    const onLoad = () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          if (registration.waiting) {
            showUpdateToast(registration.waiting);
          }

          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                showUpdateToast(installingWorker);
              }
            });
          });
        })
        .catch(() => undefined);
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    window.addEventListener("load", onLoad);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("load", onLoad);
    };
  }, [toast]);

  if (!isOffline) return null;

  return (
    <div className="fixed left-3 right-3 top-3 z-[110] mx-auto flex max-w-lg items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span className="flex-1">Vous êtes hors ligne. Certaines données peuvent ne pas être à jour.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-900 hover:bg-amber-100"
        aria-label="Recharger"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
}
