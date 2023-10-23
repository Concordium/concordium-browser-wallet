export type LaxStringEnumValue<E extends string> = `${E}`;
export type LaxNumberEnumValue<E extends number> = `${E}` extends `${infer T extends number}` ? T : never;

/**
 *
 * @example
 * type Test = { nested: { amount: number } };
 * type Out = DeepReplaceType<Test, number, string>; // Becomes the type: { nested: { amount: string } }.
 */
export type DeepReplaceType<Target, From, To> = {
    [Key in keyof Target]: Target[Key] extends From ? To : DeepReplaceType<Target[Key], From, To>;
};
