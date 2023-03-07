import * as fabric from 'fabric';
import { EditorImage } from './EditorImage';
import { TClassProperties } from '../typedefs';
export type GraphemeBBox<onPath = false> = {
    width: number;
    height: number;
    kernedWidth: number;
    left: number;
    deltaY: number;
} & (onPath extends true ? {
    renderLeft: number;
    renderTop: number;
    angle: number;
} : Record<string, never>);
type ImageSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export declare class EditorClippingMask extends EditorImage {
    cropOpacity: number;
    isClipping?: boolean;
    clippingPath?: fabric.Textbox;
    controls: {
        tl: fabric.Control;
        tr: fabric.Control;
        bl: fabric.Control;
        br: fabric.Control;
        mtr: fabric.Control;
        mr: fabric.Control;
        ml: fabric.Control;
    };
    _elementToDraw: any;
    protected _styleProperties: string[];
    constructor(element: ImageSource, options?: any);
    initEvent(): void;
    calcImageByClipPath(): {
        cropX: number;
        cropY: number;
        width: number;
        height: number;
    };
    _render(ctx: CanvasRenderingContext2D): void;
    _renderClippingBackground(ctx: CanvasRenderingContext2D): void;
    _renderClippingByText(ctx: CanvasRenderingContext2D): void;
    _renderClippingByImage(ctx: CanvasRenderingContext2D): void;
    _getOriginalTransformedDimensions(options?: any): fabric.Point;
    static fromObject({ filters: f, resizeFilter: rf, src, crossOrigin, ...object }: any, options: {
        signal: AbortSignal;
    }): Promise<EditorClippingMask>;
}
export declare const clippingMaskDefaultValues: Partial<TClassProperties<EditorClippingMask>>;
export {};
