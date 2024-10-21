import clsx from 'clsx';
import React, { useState } from 'react';
import { ClassName } from 'wallet-common-helpers';

const DEFAULT_LOADING = '/assets/svg/loading_icon.svg';
export const DEFAULT_FAILED = '/assets/svg/no_icon.svg';

type BaseProps = ClassName & {
    src?: string;
    alt?: string;
};

type WithDefaultsProps = BaseProps & {
    withDefaults: true;
};

type NoDefaultsProps = BaseProps & {
    withDefaults?: false;
    loadingImage?: string;
    failedImage?: string;
};

type Props = WithDefaultsProps | NoDefaultsProps;

export default function Img({ src, alt, className, ...props }: Props) {
    const { loadingImage, failedImage } = props.withDefaults
        ? { loadingImage: DEFAULT_LOADING, failedImage: DEFAULT_FAILED }
        : props;

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(!src);

    const shouldHide = (!loaded && loadingImage) || (failed && failedImage);

    const handleError = () => {
        setLoaded(true);
        setFailed(true);
    };

    return (
        <>
            <img
                className={clsx(shouldHide && 'd-none', className)}
                src={src}
                alt={alt}
                onLoad={() => {
                    setLoaded(true);
                    setFailed(false);
                }}
                onError={handleError}
            />
            {shouldHide && <img className={className} src={failed ? failedImage : loadingImage} alt={alt} />}
        </>
    );
}
