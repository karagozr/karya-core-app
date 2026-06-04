import React, { useCallback, useMemo, useState } from 'react';


export const useAppModalContext = () => {
    const [data, setData] = useState<any | null>(null);

    console.log('useAppModalContext data:', data);

    const setModalData = useCallback((e: any) => {
        setData(e);
    }, []);



    return useMemo(() => ({ data, setModalData }), [data]);

}

export const AppModalContext = React.createContext<ReturnType<typeof useAppModalContext> | null>(null);