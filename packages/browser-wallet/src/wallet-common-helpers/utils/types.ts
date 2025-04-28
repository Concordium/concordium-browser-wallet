/* eslint-disable @typescript-eslint/ban-types */
import type { HTMLAttributes } from 'react';

export interface Versioned<T> {
    v: number;
    value: T;
}

export interface Typed<T> {
    type: string;
    contents: T;
}

// Makes all properties of type T non-optional.
export type NotOptional<T> = {
    [P in keyof T]-?: T[P];
};

export type MakeRequired<T, K extends keyof T> = NotOptional<Pick<T, K>> & Omit<T, K>;

/**
 * @description
 * Object where keys and values are the same. Useful for storing names of form fields, and other things.
 *
 * @example
 * const equal: EqualRecord<{ name: string, address: string }> = { name: 'name', address: 'address' };
 */
export type EqualRecord<T> = { [P in keyof T]: P };

export type Id = Pick<HTMLAttributes<HTMLElement>, 'id'>;
export type ClassName = Pick<HTMLAttributes<HTMLElement>, 'className'>;
export type Style = Pick<HTMLAttributes<HTMLElement>, 'style'>;

export type ClassNameAndStyle = ClassName & Style;

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithRef on its own
export type PropsOf<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>
> = JSX.LibraryManagedAttributes<C, React.ComponentPropsWithRef<C>>;

export type AsProp<C extends React.ElementType> = {
    /**
     * An override of the default HTML tag.
     * Can also be another React component.
     */
    as?: C;
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<ExtendedProps = {}, OverrideProps = {}> = OverrideProps &
    Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type InheritableElementProps<C extends React.ElementType, Props = {}> = ExtendableProps<PropsOf<C>, Props>;

/**
 * @description
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included. Used for polymorphic components.
 *
 * @example
 * type ButtonProps<TAs extends ElementType = 'button'> = PolymorphicComponentProps<TAs, { p1: string, p2?: number }>;
 *
 * function Button<TAs extends ElementType = 'button'>({ p1, p2, as, ...props }: ButtonProps<TAs>) {
 *   const Component = as || 'button';
 *
 *   return <Component {...props} />;
 * }
 */
export type PolymorphicComponentProps<C extends React.ElementType, Props = {}> = InheritableElementProps<
    C,
    Props & AsProp<C>
>;

export type StateUpdate<Type> = React.Dispatch<React.SetStateAction<Type>>;

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export declare type DeepPartial<T> = T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {
          [key in keyof T]: T[key];
      }
    ? {
          [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;
