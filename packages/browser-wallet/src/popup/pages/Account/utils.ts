import { createContext, Dispatch, SetStateAction } from 'react';
import { noOp } from 'wallet-common-helpers';

export type AccountPageContext = {
    setDetailsExpanded: Dispatch<SetStateAction<boolean>>;
    detailsExpanded: boolean;
};

export const accountPageContext = createContext<AccountPageContext>({
    detailsExpanded: true,
    setDetailsExpanded: noOp,
});
