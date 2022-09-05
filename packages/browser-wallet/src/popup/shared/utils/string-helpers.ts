export function displayUrl(url: string) {
    const { hostname } = new URL(url);

    if (hostname.length < 29) {
        return hostname;
    }

    return `${hostname.substring(0, 29)}...`;
}
