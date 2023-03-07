import type { TClassProperties } from '../typedefs';
import { type AnyFilter, BaseFilter, type BaseFilterOptions } from './BaseFilter';
import type { T2DPipelineState, TWebGLPipelineState } from './typedefs';
/**
 * A container class that knows how to apply a sequence of filters to an input image.
 */
export declare class Composed extends BaseFilter {
    /**
     * A non sparse array of filters to apply
     */
    subFilters: AnyFilter[];
    constructor({ subFilters, ...options }?: Partial<BaseFilterOptions & {
        subFilters: AnyFilter[];
    }>);
    /**
     * Apply this container's filters to the input image provided.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be applied.
     */
    applyTo(options: TWebGLPipelineState | T2DPipelineState): void;
    /**
     * Serialize this filter into JSON.
     *
     * @returns {Object} A JSON representation of this filter.
     */
    toObject(): {
        subFilters: {
            type: string;
        }[];
        type: string;
    };
    isNeutralState(): boolean;
    /**
     * Deserialize a JSON definition of a ComposedFilter into a concrete instance.
     * @static
     * @param {oject} object Object to create an instance from
     * @param {object} [options]
     * @param {AbortSignal} [options.signal] handle aborting `BlendImage` filter loading, see https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal
     * @returns {Promise<Composed>}
     */
    static fromObject(object: Record<string, any>, options: {
        signal: AbortSignal;
    }): Promise<Composed>;
}
export declare const composedDefaultValues: Partial<TClassProperties<Composed>>;
//# sourceMappingURL=Composed.d.ts.map