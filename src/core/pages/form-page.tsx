import React from "react";
import { AppForm, AppFormDetail } from "../components/form";
import type { IFormMetaItemList } from "../interfaces";
import { AppFormContext, useAppFormContext } from "../contexts";
import { PageFormDetailLayout, PageLayout } from "../layouts";
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';




export function BaseFormPage({ items, breadcrumbPath, caption }: React.PropsWithChildren<IFormMetaItemList>) {

  const appFormContext = useAppFormContext();


  return (

    <AppFormContext.Provider value={appFormContext}>
      <React.Fragment>
        {
          items?.filter(item => !item.inTab).map((item: any, index: number) => {
            switch (item.type) {
              case 'form':
                return <PageLayout pageType="form" breadcrumb={{ path: breadcrumbPath }} title={{ title: caption }}>
                  <AppForm key={index} {...item} />
                </PageLayout>
              case 'detail':
                return <PageFormDetailLayout pageType="form-detail" title={{ title: caption }}>
                  <AppFormDetail key={index} {...item} />
                </PageFormDetailLayout>
              default:
                return null;
            }
          })
        }{
          items?.some(item => item.inTab) && (
            <PageLayout pageType="form-detail" >
              <TabPanel>
                {items?.filter(item => item.inTab).map((item: any, index: number) => (
                  <TabPanelItem key={index} title={item.caption}>
                    {
                      item.type === 'form' ? 
                        <AppForm {...item} />
                      : item.type === 'detail' ? 
                        <AppFormDetail {...item} />
                      : 
                        <div>diğer</div>
                    }
                  </TabPanelItem>
                ))

                }
              </TabPanel>
            </PageLayout>
          )

        }
      </React.Fragment>
    </AppFormContext.Provider>
  );
}


