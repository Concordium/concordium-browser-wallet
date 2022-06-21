import React, { PropsWithChildren, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Controller } from 'react-hook-form';

import Button from '@popup/shared/Button';
import Form from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';

type ItemProps = PropsWithChildren<{
    value: number;
    onFocus(v: number): void;
    onBlur(): void;
    onClick(): void;
    name: string;
}>;

function EntityItem({ name, value, children, onFocus, onClick, onBlur }: ItemProps) {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <label onMouseUp={onClick}>
            <input
                name={name}
                type="radio"
                value={value}
                onFocus={(e) => onFocus(Number(e.target.value))} // onFocus used for selection to consistently select elements with keyboard.
                onBlur={onBlur}
            />
            {children}
        </label>
    );
}

type FormValues = {
    [key: string]: number;
};

type Props<E extends Record<string, unknown>> = {
    entities: E[];
    onSelect(entity: E): void;
    onNew(): void;
    children(entity: E): JSX.Element;
    getKey(entity: E): string | number;
    searchableKeys?: Array<keyof E>;
};

export default function EntityList<E extends Record<string, unknown>>({
    entities,
    children,
    onSelect,
    onNew,
    getKey,
    searchableKeys,
}: Props<E>) {
    const { current: id } = useRef(uuidv4());
    const [search, setSearch] = useState('');

    const handleSubmit = (values: FormValues) => {
        const s = entities[values[id]];
        onSelect(s);
    };

    const filteredEntities = useMemo(
        () =>
            entities.filter((entity) =>
                Object.entries(entity)
                    .filter(([k]) => (searchableKeys ? searchableKeys.includes(k) : true))
                    .some(([, v]) => (typeof v === 'string' ? v.includes(search) : false))
            ),
        [entities, search]
    );

    return (
        <div className="entity-list">
            <div>
                <input
                    type="search"
                    placeholder="Search"
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button clear onClick={onNew}>
                    Add new
                </Button>
            </div>
            <Form<FormValues> onSubmit={handleSubmit}>
                {(f) => (
                    <>
                        {filteredEntities.map((entity, i) => (
                            <Controller
                                control={f.control}
                                name={id}
                                key={getKey(entity)}
                                render={({ field }) => (
                                    <EntityItem
                                        name={field.name}
                                        value={i}
                                        onFocus={field.onChange}
                                        onBlur={field.onBlur}
                                        onClick={() => onSelect(entity)}
                                    >
                                        {children(entity)}
                                    </EntityItem>
                                )}
                            />
                        ))}
                        <Submit className="entity-list__submit">Submit</Submit>
                    </>
                )}
            </Form>
        </div>
    );
}
