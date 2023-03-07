import * as fabric from 'fabric';
export declare class EditorClippingText extends fabric.Textbox {
    pattern?: any;
    cropX: number;
    cropY: number;
    isClipping?: boolean;
    controls: {
        tl: fabric.Control;
        tr: fabric.Control;
        bl: fabric.Control;
        br: fabric.Control;
        mtr: fabric.Control;
        ml: fabric.Control;
        mr: fabric.Control;
        e: fabric.Control;
    };
    _cachePatternCanvas?: any;
    _originalLockMovementX: boolean;
    _originalLockMovementY: boolean;
    constructor(text: string, options?: any);
    initEvent(): void;
    _render(ctx: CanvasRenderingContext2D): void;
    _renderClippingText(ctx: CanvasRenderingContext2D): void;
    drawBorders(ctx: CanvasRenderingContext2D, styleOverride: any): void;
    _renderClippingBorders(ctx: CanvasRenderingContext2D, styleOverride?: any): void;
    lockClippingMove(): void;
    resetClippingMove(): void;
    static fromObject(object: Record<string, any>): Promise<any>;
}
