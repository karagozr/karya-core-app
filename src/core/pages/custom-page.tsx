import React from "react";
import type { IBasePageProps } from "./types";
import { PageCustomLayout } from "../layouts";
import { BaseMainPage } from "./main-page";

export function BaseCustomPage({ breadcrumb, caption, children }: React.PropsWithChildren<IBasePageProps>) {

  return (
    <BaseMainPage breadcrumb={breadcrumb} caption={caption}>
      <PageCustomLayout>
        {children}
      </PageCustomLayout>
    </BaseMainPage>
  );
}


