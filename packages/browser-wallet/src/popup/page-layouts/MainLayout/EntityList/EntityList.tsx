import React, {
    FocusEventHandler,
    forwardRef,
    KeyboardEventHandler,
    PropsWithChildren,
    Ref,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Controller } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ClassName, useUpdateEffect } from 'wallet-common-helpers';

import Button from '@popup/shared/Button';
import Form, { useForm } from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';
import SearchIcon from '@assets/svg/search.svg';
import PlusIcon from '@assets/svg/plus.svg';
import { WithRef } from '@shared/utils/types';

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
        <label
            className="entity-list-item"
            onMouseUp={onClick} // mouseUp used instead of click, as click is also triggered with keyboard navigation.
        >
            <input
                name={name}
                type="radio"
                value={value}
                onFocus={() => onFocus(value)} // onFocus used for selection to consistently select elements with keyboard.
                onBlur={onBlur}
                checked={checked}
                readOnly // To silence react-DOM warnings about "checked" props being used without onChange... we know what we're doing!
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
    onSelect(entity: E, index: number): void;
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
    children(entity: E, checked: boolean, index: number): JSX.Element;
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
const EntityList = forwardRef(
    <E extends Record<string, unknown>>(
        { entities, children, onSelect, onNew, getKey, searchableKeys, newText, className }: EntityListProps<E>,
        ref: Ref<HTMLDivElement>
    ) => {
        const { current: id } = useRef(uuidv4());
        const [search, setSearch] = useState('');
        const formMethods = useForm<FormValues>();
        const [searchFocus, setSearchFocus] = useState(false);
        const { t } = useTranslation('mainLayout');
        const formRef = useRef<HTMLFormElement>(null);

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
                        .some(([, v]) =>
                            typeof v === 'string' ? v.toLowerCase().includes(search.toLowerCase()) : false
                        )
                ),
            [entities, search]
        );

        const handleSearchKey: KeyboardEventHandler<HTMLInputElement> = useCallback(
            (e) => {
                if (e.key === 'Enter') {
                    // Propagate selection of the currently checked entity.
                    const currentValue = formMethods.getValues()[id];
                    onSelect(filteredEntities[currentValue], currentValue);
                } else if (e.key === 'ArrowDown') {
                    // Shift focus to selected option in list
                    const radio = formRef.current?.querySelector('input[type="radio"]:checked') as
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
                onSelect(selected, values[id]);
            },
            [filteredEntities]
        );

        const handleItemBlur = () => {
            formMethods.resetField(id);
        };

        return (
            <div className={clsx('entity-list', className)} ref={ref}>
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
                {filteredEntities.length > 0 ? (
                    <Form<FormValues>
                        className="entity-list__options"
                        onSubmit={handleSubmit}
                        formMethods={formMethods}
                        ref={formRef}
                    >
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
                                                tabbable={i === 0 || i === field.value} // Browser loses tab order when tabbing away from non-tabbable elements.
                                                checked={field.value === i}
                                                onFocus={field.onChange}
                                                onBlur={() => {
                                                    field.onBlur();
                                                    handleItemBlur();
                                                }}
                                                onClick={() => onSelect(entity, i)}
                                            >
                                                {children(entity, field.value === i, i)}
                                            </EntityItem>
                                        )}
                                    />
                                ))}
                                <Submit className="entity-list__submit" />
                            </>
                        )}
                    </Form>
                ) : (
                    <div className="entity-list__no-matches">{t('entityList.noMatches')}</div>
                )}
            </div>
        );
    }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default EntityList as <E extends Record<string, any>>(
    props: WithRef<EntityListProps<E>, HTMLDivElement>
) => JSX.Element;
