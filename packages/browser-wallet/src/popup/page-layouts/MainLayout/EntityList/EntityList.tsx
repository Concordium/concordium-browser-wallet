import React, {
    FocusEventHandler,
    KeyboardEventHandler,
    PropsWithChildren,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Controller } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Button from '@popup/shared/Button';
import Form, { useForm } from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';
import SearchIcon from '@assets/svg/search.svg';
import PlusIcon from '@assets/svg/plus.svg';
import { ClassName } from '@shared/utils/types';
import { useUpdateEffect } from '@popup/shared/utils/hooks';

type ItemProps = PropsWithChildren<{
    value: number;
    /**
     * Marks the item as checked.
     */
    checked: boolean;
    onFocus(v: number): void;
    onBlur: FocusEventHandler<HTMLInputElement>;
    onClick(): void;
    /**
     * If it's possible to tab to the item.
     */
    tabbable: boolean;
    name: string;
}>;

function EntityItem({ name, value, children, onFocus, onClick, onBlur, checked, tabbable }: ItemProps) {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <label className="entity-list-item" onMouseUp={onClick}>
            <input
                name={name}
                type="radio"
                value={value}
                onFocus={() => onFocus(value)} // onFocus used for selection to consistently select elements with keyboard.
                onBlur={onBlur}
                checked={checked}
                readOnly // To silence react-DOM warnings... we know what we're doing!
                tabIndex={tabbable ? undefined : -1}
            />
            <div className="entity-list-item__content">{children}</div>
        </label>
    );
}

type FormValues = {
    [key: string]: number;
};

export type EntityListProps<E extends Record<string, unknown>> = ClassName & {
    /**
     * Entities to render in list
     */
    entities: E[];
    /**
     * Callback for when an entity has been selected from the list
     */
    onSelect(entity: E): void;
    /**
     * Action for creating new entities
     */
    onNew(): void;
    /**
     * Callback function for rendering list items
     *
     * @param entity an entity to render
     * @param checked whether the entity is checked (i.e. internally selected)
     *
     * @example
     *  <EntityList ...>
     *      {(e, checked) => <div className={checked ? 'checked' : 'unchecked'}>{e.text}</div>}
     *  </EntityList>
     */
    children(entity: E, checked: boolean): JSX.Element;
    /**
     * Callback for getting key of list item corresponding to entity
     */
    getKey(entity: E): string | number;
    /**
     * Keys of object E that should be included in search
     */
    searchableKeys?: Array<keyof E>;
    /**
     * Text for button for creating new entities
     */
    newText: string;
};

/**
 * Represent a list of entities in a searchable options list, with an action to create new entities.
 */
export default function EntityList<E extends Record<string, unknown>>({
    entities,
    children,
    onSelect,
    onNew,
    getKey,
    searchableKeys,
    newText,
    className,
}: EntityListProps<E>) {
    const { current: id } = useRef(uuidv4());
    const [search, setSearch] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const formMethods = useForm<FormValues>();
    const [searchFocus, setSearchFocus] = useState(false);
    const { t } = useTranslation();

    useUpdateEffect(() => {
        formMethods.setValue(id, 0);
    }, [search]);

    const handleSearchFocus = () => {
        setSearchFocus(true);
        const currentValue = formMethods.getValues()[id];

        if (currentValue === undefined) {
            formMethods.setValue(id, 0);
        }
    };

    const handleSearchBlur = () => {
        setSearchFocus(false);
        formMethods.resetField(id);
    };

    /** entities filtered by searching through values corresponding to "searchableKeys" */
    const filteredEntities = useMemo(
        () =>
            entities.filter((entity) =>
                Object.entries(entity)
                    .filter(([k]) => (searchableKeys ? searchableKeys.includes(k) : true))
                    .some(([, v]) => (typeof v === 'string' ? v.toLowerCase().includes(search.toLowerCase()) : false))
            ),
        [entities, search]
    );

    const handleSearchKey: KeyboardEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                // Propagate selection of the currently checked entity.
                const currentValue = formMethods.getValues()[id];
                onSelect(filteredEntities[currentValue]);
            } else if (e.key === 'ArrowDown') {
                // Shift focus to selected option in list
                const radio = rootRef.current?.querySelector('input[type="radio"]:checked') as
                    | HTMLInputElement
                    | undefined;
                radio?.focus();
            }
        },
        [filteredEntities]
    );

    const handleSubmit = useCallback(
        (values: FormValues) => {
            const selected = filteredEntities[values[id]];
            onSelect(selected);
        },
        [filteredEntities]
    );

    const handleItemBlur = () => {
        formMethods.resetField(id);
    };

    return (
        <div className={clsx('entity-list', className)} ref={rootRef}>
            <div className={clsx('entity-list__top', searchFocus && 'entity-list__top--search-focus')}>
                <div className="relative h-full flex align-center">
                    <input
                        className="entity-list__search"
                        type="search"
                        placeholder={t('entityList.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={handleSearchKey}
                        onBlur={handleSearchBlur}
                        onFocus={handleSearchFocus}
                    />
                    <SearchIcon className="entity-list__search-icon" />
                </div>
                <Button className="entity-list__new-entity" clear onClick={onNew}>
                    <div className="entity-list__new-entity-text">{newText}</div>
                    <PlusIcon className="entity-list__new-entity-icon" />
                </Button>
            </div>
            <Form<FormValues> className="entity-list__options" onSubmit={handleSubmit} formMethods={formMethods}>
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
                                        tabbable={i === 0 || i === field.value} // Browser looses tab order when tabbing away from non-tabbable elements.
                                        checked={field.value === i}
                                        onFocus={field.onChange}
                                        onBlur={() => {
                                            field.onBlur();
                                            handleItemBlur();
                                        }}
                                        onClick={() => onSelect(entity)}
                                    >
                                        {children(entity, field.value === i)}
                                    </EntityItem>
                                )}
                            />
                        ))}
                        <Submit className="entity-list__submit" />
                    </>
                )}
            </Form>
        </div>
    );
}
