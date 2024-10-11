import React from 'react';
import clsx from 'clsx';
import UpDown from '@assets/svgX/caret-up-down.svg';

export default function AccountButton() {
    const [account, setAccount] = React.useState<boolean>(false);
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={clsx('header__account', account && 'active')} onClick={() => setAccount(!account)}>
            <span className="text__main_medium">Accout 1 / 6gk...k7o</span>
            <UpDown />
        </div>
    );
}
