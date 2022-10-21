import { absoluteRoutes } from '@popup/constants/routes';

export const ftDetailsRoute = (contractIndex: string, id: string) =>
    absoluteRoutes.home.account.ft.path.replace(':contractIndex', contractIndex).replace(':id', id);
export const nftDetailsRoute = (contractIndex: string, id: string) =>
    absoluteRoutes.home.account.nft.path.replace(':contractIndex', contractIndex).replace(':id', id);
