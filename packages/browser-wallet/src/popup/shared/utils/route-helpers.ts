import { absoluteRoutes } from '@popup/constants/routes';

export const ftDetailsRoute = (id: string) => absoluteRoutes.home.account.ft.path.replace(':id', id);
export const nftDetailsRoute = (id: string) => absoluteRoutes.home.account.nft.path.replace(':id', id);
