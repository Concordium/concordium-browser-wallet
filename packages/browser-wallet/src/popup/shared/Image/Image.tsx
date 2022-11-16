import clsx from 'clsx';
import React, { useState } from 'react';
import { ClassName } from 'wallet-common-helpers';

const DEFAULT_LOADING = <div>loading</div>;
const DEFAULT_FAILED = <div>failed</div>;

type BaseProps = ClassName & {
    src?: string;
    alt?: string;
};

type WithDefaultsProps = BaseProps & {
    withDefaults: true;
};

type NoDefaultsProps = BaseProps & {
    withDefaults?: false;
    loadingImage?: JSX.Element;
    failedImage?: JSX.Element;
};

type Props = WithDefaultsProps | NoDefaultsProps;

export default function Img({ src, alt, className, ...props }: Props) {
    const { loadingImage, failedImage } = props.withDefaults
        ? { loadingImage: DEFAULT_LOADING, failedImage: DEFAULT_FAILED }
        : props;

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    const shouldHide = (!loaded && loadingImage) || (failed && failedImage);

    const handleError = () => {
        setLoaded(true);
        setFailed(true);
    };

    return (
        <span>
            <img
                className={clsx('image', shouldHide && 'image--hidden', className)}
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={handleError}
            />
            {loaded || loadingImage}
            {failed && failedImage}
        </span>
    );
}
