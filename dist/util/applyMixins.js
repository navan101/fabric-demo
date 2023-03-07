/***
 * https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
 */
export function applyMixins(derivedCtor, constructors) {
    constructors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            name !== 'constructor' &&
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null));
        });
    });
    return derivedCtor;
}
