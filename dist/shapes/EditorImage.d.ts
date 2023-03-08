import * as fabric from 'fabric';
type ImageSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export declare class EditorImage extends fabric.Image {
    isCropping?: boolean;
    constructor(element: ImageSource, options?: any);
    initEvent(): void;
    getOriginalElementWidth(): any;
    getOriginalElementHeight(): any;
    getElementWidth(): any;
    getElementHeight(): any;
    _getOriginalTransformedDimensions(options?: any): fabric.Point;
    _render(ctx: CanvasRenderingContext2D): void;
    drawBorders(ctx: CanvasRenderingContext2D, options: any, styleOverride: any): void;
    _renderCroppingBorders(ctx: CanvasRenderingContext2D): void;
    static fromURL(url: string, options?: any): Promise<EditorImage>;
    static fromObject({ filters: f, resizeFilter: rf, src, crossOrigin, ...object }: any, options: {
        signal: AbortSignal;
    }): Promise<EditorImage>;
}
export {};
