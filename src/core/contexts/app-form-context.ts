import React, { useCallback, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';


export const useAppFormContext = () => {
    const [key, setKey] = useState<string | null>();
    const [isNew, setIsNew] = useState<boolean | false>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { pathname } = useLocation();

    React.useEffect(() => {
        if (searchParams.get('key')) {
            setKey(searchParams.get('key'));
            setIsNew(searchParams.get('isNew') === 'true');
        } else {
            newFormContext();
        }
    }, [searchParams])


    const setKeyValue = useCallback((data: any) => setKey(data), []);

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
    }, []);

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
    }, []);

    return useMemo(() => ({ key, isNew, setKeyValue, newFormContext, updateFormContext }), [key, isNew]);

}

export const AppFormContext = React.createContext<ReturnType<typeof useAppFormContext> | null>(null);