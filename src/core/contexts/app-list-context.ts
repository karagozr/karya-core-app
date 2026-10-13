import React, { useMemo } from 'react';



export const useAppListContext = () => {
   
    return useMemo(() => ({  }), []);

}

export const AppListContext = React.createContext<ReturnType<typeof useAppListContext> | null>(null);