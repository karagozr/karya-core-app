import React from "react";
import type { IBasePageProps } from "./types";
import { AppMainContext, useAppMainContext } from "../contexts";
import { PageLayout } from "../layouts";

export function BaseMainPage({ breadcrumb, caption, children }: React.PropsWithChildren<IBasePageProps>) {

  const appMainContext = useAppMainContext();

  return (
    <AppMainContext.Provider value={appMainContext}>
      <PageLayout breadcrumb={breadcrumb} title={{ title: caption }}>
        {children}
      </PageLayout>
    </AppMainContext.Provider>
  );
}


