import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';


export const useAppFormContext =    () => {
  const [key, setKey] = useState<string>();

  const { key: paramKey } = useParams();
      React.useEffect(() => {
          if(paramKey) setKey(paramKey);
      }, [paramKey])
      

  const setKeyValue = useCallback((data:any) => setKey(data), []);
  return useMemo(()=> ({ key,setKeyValue }), [key]);

}

export const AppFormContext = React.createContext<ReturnType<typeof useAppFormContext> | null>(null);