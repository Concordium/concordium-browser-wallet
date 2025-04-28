export type LaxStringEnumValue<E extends string> = `${E}`;
export type LaxNumberEnumValue<E extends number> = `${E}` extends `${infer T extends number}` ? T : never;
