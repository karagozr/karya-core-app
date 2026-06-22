export const normalizeApiDataForArray = (payload: any) => {
    if (payload?.data?.data) return payload.data.data;
    if (payload?.data) return payload.data;
    if (payload) return payload;
    
    
    return [];
};

export const normalizeApiDataForObject = (payload: any) => {

    if (payload?.data?.data && typeof payload.data.data === 'object') return payload.data.data;
    if (payload?.data && typeof payload.data === 'object') return payload.data;
    if (payload && typeof payload === 'object') return payload;
    return {};
};