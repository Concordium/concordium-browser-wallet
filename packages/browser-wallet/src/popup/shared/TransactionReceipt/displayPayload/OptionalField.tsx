import React, { ReactNode } from 'react';

/* eslint-disable react/destructuring-assignment */
type OptionalFieldBaseProps = {
    title: string;
};

type OptionalNonRenderableFieldProps<T> = OptionalFieldBaseProps & {
    value: T | undefined;
    children(field: T): ReactNode;
};

type OptionalRenderableFieldProps = OptionalFieldBaseProps & {
    value: ReactNode | undefined;
};

type OptionalFieldProps<T> = OptionalRenderableFieldProps | OptionalNonRenderableFieldProps<T>;

function hasChildren<T>(props: OptionalFieldProps<T>): props is OptionalNonRenderableFieldProps<T> {
    return (props as OptionalNonRenderableFieldProps<T>).children !== undefined;
}

export default function OptionalField<T>(props: OptionalFieldProps<T>) {
    if (props.value === undefined) {
        return null;
    }

    return (
        <>
            <h5>{props.title}:</h5>
            <div>{hasChildren(props) ? props.children(props.value) : props.value}</div>
        </>
    );
}
