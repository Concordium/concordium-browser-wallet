import { spawnedPopupUrl, web3IdProofPopupUrl } from '@shared/constants/url';

export const isSpawnedWindow = window.location.href.includes(spawnedPopupUrl);
export const isSpawnedWeb3IdProofWindow = window.location.href.includes(web3IdProofPopupUrl);
export const isFullscreenWindow = window.location.hash === '#fullscreen';
export const isFullscreenDemoWindow = window.location.hash === '#fullscreen-demo';
export const haveInitialEntry = (() => {
    const url = new URL(window.location.href);
    const navTo = url.searchParams.get('navTo');
    const state = JSON.parse(url.searchParams.get('state') || '""') || null;

    // Remove search params from url
    // Prevent initial redirect on page refresh
    url.search = '';
    window.history.replaceState({}, '', url.toString());

    if (!navTo) return null;
    return { pathname: navTo, state };
})();
