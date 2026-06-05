import React from 'react';

type AppModalContextProps = {
    data: AppModalData;
    setModalData: (e: AppModalData) => void;
    getModalData: (key: string) => any;
}

interface AppModalData {
    key: string|null;
    data: any;
}

export const AppModalContext = React.createContext<AppModalContextProps | null>(null);

export const AppModalProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const [data, setData] = React.useState<AppModalData>({key: null, data: null });

    const setModalData = React.useCallback((e: AppModalData) => setData(e) , []);

    const getModalData = React.useCallback((key:string) => data.key === key ? data.data : null, [data]);

    const value = React.useMemo(() => ({ data, setModalData, getModalData }), [data, setModalData, getModalData]);

    return <AppModalContext.Provider value={value}>{children}</AppModalContext.Provider>;
}

export const useAppModalContext = () => React.useContext(AppModalContext);

