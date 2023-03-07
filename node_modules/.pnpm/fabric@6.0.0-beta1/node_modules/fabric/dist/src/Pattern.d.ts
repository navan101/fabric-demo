import { TCrossOrigin, TMat2D, TSize } from './typedefs';
export type TPatternRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
type TExportedKeys = 'crossOrigin' | 'offsetX' | 'offsetY' | 'patternTransform' | 'repeat' | 'source';
export type TPatternOptions = Partial<Pick<Pattern, TExportedKeys>>;
export type TPatternSerialized = TPatternOptions & {
    source: string;
};
export type TPatternHydrationOptions = {
    /**
     * handle aborting
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal
     */
    signal?: AbortSignal;
};
type TImageSource = {
    source: HTMLImageElement;
};
type TCanvasSource = {
    source: HTMLCanvasElement;
};
/**
 * @see {@link http://fabricjs.com/patterns demo}
 * @see {@link http://fabricjs.com/dynamic-patterns demo}
 */
export declare class Pattern {
    type: string;
    /**
     * @type TPatternRepeat
     * @defaults
     */
    repeat: TPatternRepeat;
    /**
     * Pattern horizontal offset from object's left/top corner
     * @type Number
     * @default
     */
    offsetX: number;
    /**
     * Pattern vertical offset from object's left/top corner
     * @type Number
     * @default
     */
    offsetY: number;
    /**
     * @type TCrossOrigin
     * @default
     */
    crossOrigin: TCrossOrigin;
    /**
     * transform matrix to change the pattern, imported from svgs.
     * @todo verify if using the identity matrix as default makes the rest of the code more easy
     * @type Array
     * @default
     */
    patternTransform: TMat2D | null;
    /**
     * The actual pixel source of the pattern
     */
    source: CanvasImageSource;
    /**
     * If true, this object will not be exported during the serialization of a canvas
     * @type boolean
     */
    excludeFromExport?: boolean;
    /**
     * ID used for SVG export functionalities
     * @type number
     */
    readonly id: number;
    /**
     * Constructor
     * @param {Object} [options] Options object
     * @param {option.source} [source] the pattern source, eventually empty or a drawable
     */
    constructor(options?: TPatternOptions);
    /**
     * @returns true if {@link source} is an <img> element
     */
    isImageSource(): this is TImageSource;
    /**
     * @returns true if {@link source} is a <canvas> element
     */
    isCanvasSource(): this is TCanvasSource;
    sourceToString(): string;
    /**
     * Returns an instance of CanvasPattern
     * @param {CanvasRenderingContext2D} ctx Context to create pattern
     * @return {CanvasPattern}
     */
    toLive(ctx: CanvasRenderingContext2D): CanvasPattern | null;
    /**
     * Returns object representation of a pattern
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {object} Object representation of a pattern instance
     */
    toObject(propertiesToInclude?: string[]): Record<string, any>;
    /**
     * Returns SVG representation of a pattern
     */
    toSVG({ width, height }: TSize): string;
    static fromObject({ source, ...serialized }: TPatternSerialized, options: TPatternHydrationOptions): Promise<Pattern>;
}
export {};
//# sourceMappingURL=Pattern.d.ts.map