import React from "react";
import { AppListContext, useAppListContext } from "../contexts";
import { AppDatagrid } from "../components/list/app-datagrid";
import { PageLayout, PageListLayout } from "../layouts";
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import type { IMetaItemList } from "../interfaces";

export function BaseListPage({ items, isTabList, caption, breadcrumbPath }
    : React.PropsWithChildren<IMetaItemList>) {

    const appListContext = useAppListContext();



    return (
        <PageLayout breadcrumb={{ path: breadcrumbPath }} title={{ title: caption }}>
            <PageListLayout>
                <AppListContext.Provider value={appListContext}>
                    <React.Fragment>
                        {isTabList && items && (items.length > 1) ?
                            <TabPanel>
                                {items.map((item, index) => {
                                    return <TabPanelItem key={index} title={item.caption}>
                                        {
                                            item.type === 'grid' ? <AppDatagrid {...item} /> : <div>diğer</div>
                                        }
                                    </TabPanelItem>
                                })}
                            </TabPanel> :
                            items ? (
                                items[0].type === 'grid' ? <AppDatagrid {...items[0]} /> : <div>diğer</div>
                            ) : null}

                    </React.Fragment>
                </AppListContext.Provider>
            </PageListLayout>
        </PageLayout>
    );
}



