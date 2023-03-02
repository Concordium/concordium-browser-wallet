/**
 * Used for outlet on the account page.
 */
export const tokensRoutes = {
    collectibles: 'collectibles',
    details: 'details/:contractIndex/:id/',
    manage: 'manage',
};

export const defaultCis2TokenId = '__default__';

export const detailsRoute = (contractIndex: string, id: string) =>
    tokensRoutes.details.replace(':contractIndex', contractIndex).replace(':id', id || defaultCis2TokenId);
