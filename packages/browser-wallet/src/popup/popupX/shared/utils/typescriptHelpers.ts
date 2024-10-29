// Generic type for iterating through nested object keys
export type ObjectPath<T extends object, D extends string = ''> = {
    [K in keyof T]: `${D}${Exclude<K, symbol>}${'' | (T[K] extends object ? ObjectPath<T[K], '.'> : '')}`;
}[keyof T];
