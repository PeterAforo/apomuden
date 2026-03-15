"use client";

import { useHealthAlerts } from "@/hooks/useHealthAlerts";
import { HealthAlertPopup } from "./HealthAlertPopup";

export function HealthAlertProvider({ children }: { children: React.ReactNode }) {
  const { alerts, dismissAlert, dismissAllAlerts } = useHealthAlerts();

  return (
    <>
      {children}
      {alerts.length > 0 && (
        <HealthAlertPopup
          alerts={alerts}
          onDismiss={dismissAlert}
          onDismissAll={dismissAllAlerts}
        />
      )}
    </>
  );
}
