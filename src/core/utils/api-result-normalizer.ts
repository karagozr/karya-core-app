export const normalizeApiDataForArray = (payload: any) => {
    const normalized = payload?.data?.data ?? payload?.data ?? payload;

    if (Array.isArray(normalized)) {
        return {
            data: normalized,
            totalCount: normalized.length,
        };
    }

    if (normalized && typeof normalized === 'object' && Array.isArray(normalized.data)) {
        return {
            ...normalized,
            totalCount: typeof normalized.totalCount === 'number'
                ? normalized.totalCount
                : normalized.data.length,
        };
    }

    return {
        data: [],
        totalCount: 0,
    };
};

export const normalizeApiDataForObject = (payload: any) => {

    if (payload?.data?.data && typeof payload.data.data === 'object') return payload.data.data;
    if (payload?.data && typeof payload.data === 'object') return payload.data;
    if (payload && typeof payload === 'object') return payload;
    return {};
};