import React from "react";
import type { IBasePageProps } from "./types";
import { BaseMainPage } from "./main-page";
import DashboardControl from "devexpress-dashboard-react";
import { PageCustomLayout } from "../layouts";


export function DashPage({ breadcrumb, caption, children }: React.PropsWithChildren<IBasePageProps>) {

  return (
    <div style={{ backgroundColor: 'green',height: '100%', width: '100%' }}>
          <DashboardControl
          style={{ height: '800px', width: '100%' }}
                id="web-dashboard"
                // DevExpress'in resmî global demo API adresi
                endpoint="https://demos.devexpress.com/services/dashboard/api" 
                workingMode="Viewer"
                // Demoda yer alan hazır bir şablon kimliği (Örn: SalesPerformance veya WebsiteStatistics)
                dashboardId="WebsiteStatistics" 
            />
        </div>
  );
}


