import { spawnedPopupUrl } from '@shared/constants/url';

export const isSpawnedWindow = window.location.href.includes(spawnedPopupUrl);
