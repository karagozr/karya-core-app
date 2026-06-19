export const prepareLoadOptionsForBackend = (loadOptions : any) => {
    const params = { ...loadOptions };

    if (params.sort) params.sort = JSON.stringify(params.sort);
    if (params.filter) params.filter = JSON.stringify(params.filter);
    if (params.group) params.group = JSON.stringify(params.group);
    if (params.totalSummary) params.totalSummary = JSON.stringify(params.totalSummary);
    if (params.groupSummary) params.groupSummary = JSON.stringify(params.groupSummary);

    return params;
}