import React from "react";
import type { IBasePageMetaItem } from "../interfaces";
import { PageCustomLayout } from "../layouts";
import { BaseMainPage } from "./main-page";

export function BaseCustomPage({ breadcrumb, caption, children }: React.PropsWithChildren<IBasePageMetaItem>) {

  return (
    <BaseMainPage breadcrumb={breadcrumb} caption={caption}>
      <PageCustomLayout>
        {children}
      </PageCustomLayout>
    </BaseMainPage>
  );
}


