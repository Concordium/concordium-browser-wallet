export function buildURLwithSearchParameters(baseUrl: string, params: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    return Object.entries(params).length === 0 ? baseUrl : `${baseUrl}?${searchParams.toString()}`;
}
