import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, useNavigate, Route, useLocation } from 'react-router-dom';
import { isDefined, noOp, useUpdateEffect } from 'wallet-common-helpers';

const INDEX_ROUTE = '.';

export interface MultiStepFormPageProps<V, F = unknown> {
    /**
     * Function to be triggered on page submission. Will take user to next page in the flow.
     */
    onNext(values: V): void;
    /**
     * Initial values for substate.
     */
    initial: V | undefined;
    /**
     * Accumulated values of entire flow (thus far)
     */
    formValues: Partial<F>;
}

const makeFormPageObjects = <F extends Record<string, unknown>>(children: FormChildren<F>) => {
    const keyPagePairs = Object.entries(children).filter(([, c]) => isDefined(c));

    return keyPagePairs.map(([k, c]: [keyof F, FormChild<F>], i) => ({
        substate: k,
        render: c.render,
        route: i === 0 ? INDEX_ROUTE : `${i}`,
    }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormChild<F, K extends keyof F = any> {
    /**
     * Function to render page component responsible for letting user fill out the respective substate.
     * This is a function to avoid anonymous components messing up render tree updates.
     */
    render(initial: F[K] | undefined, onNext: (values: F[K]) => void, formValues: Partial<F>): JSX.Element;
}

export type FormChildren<F extends Record<string, unknown>> = {
    [K in keyof F]?: FormChild<F, K>;
};

/**
 * Helper type to generate type for children expected by MultiStepForm
 */
export type OrRenderValues<F extends Record<string, unknown>, C extends FormChildren<F>> =
    | C
    | ((values: Partial<F>) => C);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidateValues<F extends Record<string, any>> = (values: F) => keyof F | undefined;

interface Props<F extends Record<string, unknown>> {
    /**
     * Function to validate the transaction flow values as a whole.
     * Return key of the substate containing the invalid field, or undefined if valid
     */
    validate?: ValidateValues<F>;
    onDone(values: F): void;
    onPageActive?(step: keyof F, values: Partial<F>): void;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<F, FormChildren<F>>;
}

interface InternalValueStoreProps<F extends Record<string, unknown>> extends Props<F> {
    /**
     * Initial values for the form.
     */
    initialValues?: F;
}

interface ExternalValueStoreProps<F extends Record<string, unknown>> extends Props<F> {
    /**
     * Matches the return type of "useState" hook
     */
    valueStore: [Partial<F>, Dispatch<SetStateAction<Partial<F>>>];
}

/**
 * Props for multi step form component. Can either use an internal or external value store, which simply matches the tuple returned from the "useState" hook
 *
 * @template F Type of the form as a whole. Each step in the form flow should correspond to a member on the type.
 */
export type MultiStepFormProps<F extends Record<string, unknown>> =
    | InternalValueStoreProps<F>
    | ExternalValueStoreProps<F>;

/**
 * A component for spanning forms over multiple pages. This component doesn't render any UI, but merely handles collecting data from the different steps and routing between the steps.
 * The component uses the application router to go through a number of pages. As such it needs to be used in combination with a catch-all route, as seen in the example.
 *
 * @template F Type of the form as a whole. Each step in the form flow should correspond to a member on the type.
 * @component
 * @example
 * type Values = {
 *   first: { a: string; b: number; };
 *   second: { c: boolean; };
 * };
 *
 * const Flow = () => <MultiStepForm<Values>>
 *   {{
 *     first: { render: (initialValues, onNext) => <First initialValues={initialValues} onSubmit={onNext} /> },
 *     second: { render: (initialValues, onNext) => <Second initialValues={initialValues} onSubmit={onNext} /> },
 *   }}
 * </MultiStepForm>
 *
 * <Routes>
 *   <Route path="path/to/flow/*" element={<Flow />} />
 * </Routes>
 */
export default function MultiStepForm<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>
>(props: MultiStepFormProps<F>) {
    const { children, validate = () => undefined, onDone, onPageActive = noOp } = props;
    const initialValues = (props as InternalValueStoreProps<F>).initialValues ?? ({} as F);
    const { pathname } = useLocation();
    const internalValueStore = useState<Partial<F>>(initialValues);
    const externalValueStore = (props as ExternalValueStoreProps<F>).valueStore;
    const [values, setValues] = externalValueStore ?? internalValueStore;
    const nav = useNavigate();

    const getChildren = useCallback(
        (v: Partial<F>) => (typeof children === 'function' ? children(v) : children),
        [children]
    );

    const pages = useMemo(() => makeFormPageObjects(getChildren(values)), [getChildren, values]);
    const currentPage = pages.find((p) => pathname.endsWith(p.route)) ?? pages[0];

    useEffect(() => {
        if (currentPage?.substate) {
            onPageActive(currentPage?.substate, values);
        }
    }, [currentPage?.substate]);

    useUpdateEffect(() => {
        throw new Error('Changing value store during the lifetime of MultiStepForm will result in errors.');
    }, [externalValueStore === undefined]);

    const handleNext = (substate: keyof F) => (v: Partial<F>) => {
        const newValues = { ...values, [substate]: v };
        setValues(newValues);

        const newPages = makeFormPageObjects(getChildren(newValues));
        const currentIndex = newPages.findIndex((p) => p.substate === substate);

        if (currentIndex === -1) {
            // Could not find current page. Should not happen.
            // TODO: Log error.
            nav(INDEX_ROUTE, { replace: true });
        } else if (currentIndex !== newPages.length - 1) {
            // From any page that isn't the last, to the next in line.
            const { route } = newPages[currentIndex + 1] ?? {};
            nav(route);
        } else {
            // On final page. Do validation -> trigger done.
            const invalidPage = pages.find((p) => p.substate === validate(newValues as F));

            if (invalidPage) {
                nav(invalidPage.route);
                return;
            }

            onDone(newValues as F);
        }
    };

    return (
        <Routes>
            {pages.map(({ render, route, substate }) =>
                route === INDEX_ROUTE ? (
                    <Route index key="index" element={render(values[substate], handleNext(substate), values)} />
                ) : (
                    <Route path={route} key={route} element={render(values[substate], handleNext(substate), values)} />
                )
            )}
        </Routes>
    );
}
