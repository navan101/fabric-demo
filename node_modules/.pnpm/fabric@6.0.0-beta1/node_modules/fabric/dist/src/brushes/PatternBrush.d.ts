import { PathData } from '../typedefs';
import type { Canvas } from '../canvas/Canvas';
import { PencilBrush } from './PencilBrush';
export declare class PatternBrush extends PencilBrush {
    source?: CanvasImageSource;
    constructor(canvas: Canvas);
    getPatternSrc(): HTMLCanvasElement;
    /**
     * Creates "pattern" instance property
     * @param {CanvasRenderingContext2D} ctx
     */
    getPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null;
    /**
     * Sets brush styles
     * @param {CanvasRenderingContext2D} ctx
     */
    _setBrushStyles(ctx: CanvasRenderingContext2D): void;
    /**
     * Creates path
     */
    createPath(pathData: PathData): import("../..").Path;
}
//# sourceMappingURL=PatternBrush.d.ts.map