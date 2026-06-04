import React from 'react';


type AppModalContextProps = {
    data: any | null;
    setModalData: (e: any) => void;
}

export const AppModalContext = React.createContext<AppModalContextProps>({
    data: null,
    setModalData: () => {}
});

export const AppModalProvider = ({ children, initialData }: React.PropsWithChildren<{ initialData?: any }>) => {
    const [data, setData] = React.useState<any>(initialData ?? null);

    React.useEffect(() => {
        setData(initialData ?? null);
    }, [initialData]);

    const setModalData = React.useCallback((e: any) => {
        setData(e);
    }, []);





    const value = React.useMemo(() => ({ data, setModalData }), [data]);

    return <AppModalContext.Provider value={value}>{children}</AppModalContext.Provider>;
}

export const useAppModalContext = () => React.useContext(AppModalContext);

