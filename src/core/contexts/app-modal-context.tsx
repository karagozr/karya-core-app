import React from 'react';

type AppModalContextProps = {
    data: Array<AppModalData>;
    setModalData: (e: Array<AppModalData>) => void;
    getModalData: (key: string) => any;
    isActive: (key: string) => boolean;
    openModal: (key: string, data: any) => void;
    closeModal: (key: string) => void;
}

interface AppModalData {
    key: string | null;
    data: any;
    visible: boolean | false;
}


export const useProvideAppModalContext = () => {
    const [data, setData] = React.useState<Array<AppModalData>>([]);

    const setModalData = React.useCallback((e: Array<AppModalData>) => setData(e), []);

    const getModalData = React.useCallback((key: string) => {
        const modal = data.find(d => d.key === key);
        return modal ? modal.visible : false;
    }, [data]);

    const isActive = React.useCallback((key: string) => {
        const modal = data.find(d => d.key === key);
        return modal ? modal.visible : false;
    }, [data]);

    const openModal = React.useCallback((key: string, formData: any) => {
        if (data.length === 0) {
            setData(prevData => [...prevData, { key, data: formData, visible: true }]);
        } else {
            const modal = data.find(d => d.key === key);
            if (!modal) {
                setData(prevData => [...prevData, { key, data: formData, visible: true }]);
            } else {
                setData(prevData => prevData.map(d => d.key === key ? { ...d, visible: true } : d));
            }
        }

    }, []);

    const closeModal = React.useCallback((key: string) => {
        setData(prevData => prevData.filter(d => d.key !== key));
    }, []);

    const value = React.useMemo(() => ({ data, setModalData, getModalData, isActive, openModal, closeModal }), [data, setModalData, getModalData, isActive, openModal, closeModal]);
    return value;
}


export const AppModalContext = React.createContext<AppModalContextProps | null>(null);

export const useAppModalContext = () => {
    const context = React.useContext(AppModalContext);

    if (!context) {
        throw new Error('useAppModalContext must be used within AppModalContext.Provider');
    }

    return context;
};




