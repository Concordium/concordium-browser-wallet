import { spawnedPopupUrl, web3IdProofPopupUrl } from '@shared/constants/url';

export const isSpawnedWindow = window.location.href.includes(spawnedPopupUrl);
export const isSpawnedWeb3IdProofWindow = window.location.href.includes(web3IdProofPopupUrl);
