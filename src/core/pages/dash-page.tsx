import DashboardControl from "devexpress-dashboard-react";
import React, { memo, useCallback, useContext, useLayoutEffect } from "react";
import { currentTheme, refreshTheme } from "devextreme/viz/themes";
import { DockingLayoutSettings } from "devexpress-dashboard/common/docking-layout/_docking-layout-settings";
import type { IBasePageProps } from "./types";
import { ThemeContext } from "../../theme";
import "./dash-page.scss";
import { BaseMainPage } from "./main-page";
import { dashboardEndpoint, dashboardRemoteService } from "../services/dashboard";


const DashboardView = memo(({operationUrl,dashboardId,layoutPaddings}: {operationUrl: string, dashboardId: string, layoutPaddings?: number}) => {
  
  const configureLayout = useCallback(() => {
    DockingLayoutSettings.layoutPaddings = layoutPaddings ?? 0;
  }, [layoutPaddings]);

  return (
    <DashboardControl
      onBeforeRender={configureLayout}
      style={{ height: '100%', width: '100%' }}
      id="web-dashboard"
      endpoint={operationUrl}
      fetchRemoteService={dashboardRemoteService}
      workingMode="Viewer"
      dashboardId={dashboardId}
    />
  );
});

export const DashPage = ({ caption,breadcrumb }: React.PropsWithChildren<IBasePageProps>) => {
  
  const theme = useContext(ThemeContext)?.theme ?? 'light';

  useLayoutEffect(() => {
    currentTheme(theme === 'dark' ? 'material.blue.dark' : 'material.blue.light');
    refreshTheme();
  }, [theme]);

  return (
    <div className="dashboard-page" aria-label={caption}>
      <BaseMainPage caption={caption} breadcrumb={breadcrumb}>
        <div className="dashboard-host">
          <DashboardView operationUrl={dashboardEndpoint} dashboardId="SalesOverview" layoutPaddings={0} />
        </div>
      </BaseMainPage>
    </div>
  );

}
