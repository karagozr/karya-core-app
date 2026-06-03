import React from "react";
import { AppForm, AppFormDetail } from "../components/form";
import type { IFormPageMetaItem } from "../interfaces";
import { AppFormContext, useAppFormContext } from "../contexts";
import { PageFormDetailLayout, PageFormLayout, PageLayout } from "../layouts";
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';

export function BaseFormPage({ detailItems,formOptions, breadcrumbPath, caption }: React.PropsWithChildren<IFormPageMetaItem>) {

  const appFormContext = useAppFormContext();

  return (

    <AppFormContext.Provider value={appFormContext}>
        <PageLayout breadcrumb={{ path: breadcrumbPath }} title={{ title: caption }}>
        {formOptions && <PageFormLayout key={0}><AppForm key={0} {...formOptions} /></PageFormLayout>}  
        {
          detailItems?.filter(item => !item.inTab).map((item: any, index: number) => {
            switch (item.type) {
              case 'form':
                return<PageFormLayout key={index}>
                    <AppForm key={index} {...item.formOptions} />
                </PageFormLayout>
              case 'detail':
                return<PageFormDetailLayout key={index} pageType="form-detail" caption={{ title: item.title }}>
                  <AppFormDetail operationUrl={item.operationUrl} {...item.formDetailOptions} />
                </PageFormDetailLayout>
              default:
                return null;
            }
          })
        }{
          detailItems?.some(item => item.inTab) && (
            <PageFormDetailLayout pageType="form-detail"  caption={{ title: caption }}>
              <TabPanel>
                {detailItems?.filter(item => item.inTab).map((item: any, index: number) => (
                  <TabPanelItem key={index} title={item.title}>
                    {
                      item.type === 'form' ? 
                        <AppForm {...item.formOptions} />
                      : item.type === 'detail' ? 
                        <AppFormDetail {...item.formDetailOptions} />
                      : 
                        <div>diğer</div>
                    }
                  </TabPanelItem>
                ))
                }
              </TabPanel>
            </PageFormDetailLayout>
          )
        }
      </PageLayout>
    </AppFormContext.Provider>
  );
}


