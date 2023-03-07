declare function renderEditClippingMaskHandler(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any): void;
declare function renderCropMiddle(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any): void;
declare function renderWithShadows(x: number, y: number, fn: Function): (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) => void;
declare function renderFillClippingMaskHandler(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any): void;
export declare function convertPixelToUnit(value: number, unit: string, resolution: number): number;
declare function renderUploadHandler(this: any, ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any): void;
export { renderCropMiddle, renderWithShadows, renderFillClippingMaskHandler, renderEditClippingMaskHandler, renderUploadHandler, };
