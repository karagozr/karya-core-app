import React from 'react';


export const useAppMainContext = () => {
   
    return React.useMemo(() => ({  }), []);

}

export const AppMainContext = React.createContext<ReturnType<typeof useAppMainContext> | null>(null);