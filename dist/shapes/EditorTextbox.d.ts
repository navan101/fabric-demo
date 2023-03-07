import * as fabric from 'fabric';
import { TClassProperties } from '../typedefs';
export declare class EditorTextbox extends fabric.Textbox {
    isClipping?: boolean;
    cropX: number;
    cropY: number;
    cropOpacity: number;
    originalText?: string;
    placeholder?: string;
    uppercase?: boolean;
    clippingPath: fabric.Image;
    _cacheClippingPathCanvas: any;
    stateProperties: string[];
    cacheProperties: string[];
    constructor(text: string, options?: any);
    render(ctx: CanvasRenderingContext2D): void;
    _render(ctx: CanvasRenderingContext2D): void;
    _renderClippingBackground(ctx: CanvasRenderingContext2D): void;
    _renderClippingText(ctx: CanvasRenderingContext2D): void;
    calcTextByClipPath(): {
        cropX: number;
        cropY: number;
    };
    drawBorders(ctx: CanvasRenderingContext2D, styleOverride: any): void;
    _renderClippingBorders(ctx: CanvasRenderingContext2D, styleOverride?: any): void;
    static fromObject(object: Record<string, any>): Promise<any>;
}
export declare const textboxDefaultValues: Partial<TClassProperties<EditorTextbox>>;
