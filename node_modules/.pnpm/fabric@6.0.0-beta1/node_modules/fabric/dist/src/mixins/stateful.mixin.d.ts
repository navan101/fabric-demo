export declare class StatefulMixin {
    /**
     * Returns true if object state (one of its state properties) was changed
     * @param {String} [propertySet] optional name for the set of property we want to save
     * @return {Boolean} true if instance' state has changed since `{@link fabric.Object#saveState}` was called
     */
    private hasStateChanged;
    private saveProps;
    /**
     * Saves state of an object
     * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
     * @param {string[]} [options.stateProperties] Object with additional `stateProperties` array to include when saving state
     * @param {string} [options.propertySet] name for the property set to save
     * @return {fabric.Object} thisArg
     */
    private saveState;
}
//# sourceMappingURL=stateful.mixin.d.ts.map