import React, { useCallback, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';


export const useProvideAppFormContext = () => {
    const [key, setKey] = useState<string | null>();
    const [isNew, setIsNew] = useState<boolean | false>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(null);  

    const { pathname } = useLocation();


    const setKeyValue = useCallback((data: any) => setKey(data), []);

    const setFormDataValue = useCallback((jsonFormData: string) => {
        setFormData(JSON.parse(jsonFormData))}, []);

    const updateFormDataValue = useCallback((updateData: any) => {
        setFormData((prevData: any) => ({
            ...prevData,
            ...updateData
        }));
    }, []);

    const newFormContext = useCallback(() => {

        const params = {
            isNew: 'true'
        };

        navigate({
            pathname: pathname,
            search: `?${createSearchParams(params)}`,
        });

        setKey(null);
        setIsNew(true);
    }, [navigate, pathname]);

    const updateFormContext = useCallback((keyValue: string) => {

        const params = {
            isNew: 'false',
            key: keyValue
        };

        navigate({
            pathname: pathname,
            search: `?${createSearchParams(params)}`,
        });

        setKey(keyValue);
        setIsNew(false);
    }, [navigate, pathname]);

    React.useEffect(() => {
        if (searchParams.get('key')) {
            setKey(searchParams.get('key'));
            setIsNew(searchParams.get('isNew') === 'true');
        } else {
            newFormContext();
        }
    }, [searchParams, newFormContext])

    return useMemo(() => ({ key, isNew, formData, setFormDataValue,updateFormDataValue, setKeyValue, newFormContext, updateFormContext }), [key, isNew,formData]);

}

type AppFormContextValue = ReturnType<typeof useProvideAppFormContext>;

export const AppFormContext = React.createContext<AppFormContextValue | null>(null);

export const useAppFormContext = () => {
    const context = React.useContext(AppFormContext);

    if (!context) {
        throw new Error('useAppFormContext must be used within AppFormContext.Provider');
    }

    return context;
};