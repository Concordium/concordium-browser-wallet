import React from 'react';
import clsx from 'clsx';
import UpDown from '@assets/svgX/caret-up-down.svg';

export default function AccountButton() {
    const [account, setAccount] = React.useState<boolean>(false);
    return (
        <div className={clsx('header__account', account && 'active')} onClick={() => setAccount(!account)}>
            <span className="text__main_medium">Accout 1 / 6gk...k7o</span>
            <UpDown />
        </div>
    );
}
