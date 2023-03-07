import * as fabric from 'fabric';
export declare class ClippingText extends fabric.Textbox {
    isClipping?: boolean;
    cropX: number;
    cropY: number;
    originalText?: string;
    placeholder?: string;
    uppercase?: boolean;
    clippingPath: fabric.Image;
    _cacheClippingPathCanvas: any;
    cacheProperties: string[];
    constructor(text: string, options?: any);
    _render(ctx: CanvasRenderingContext2D): void;
    _renderClippingText(ctx: CanvasRenderingContext2D): void;
    static fromObject(object: Record<string, any>): Promise<any>;
}
