import React from "react";
import type { IBasePageMetaItem } from "../interfaces";
import { AppMainContext, useAppMainContext } from "../contexts";
import { PageLayout } from "../layouts";

export function BaseMainPage({ breadcrumb, caption, children }: React.PropsWithChildren<IBasePageMetaItem>) {

  const appMainContext = useAppMainContext();

  return (
    <AppMainContext.Provider value={appMainContext}>
      <PageLayout breadcrumb={breadcrumb} title={{ title: caption }}>
        {children}
      </PageLayout>
    </AppMainContext.Provider>
  );
}


