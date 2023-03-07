import * as fabric from 'fabric';
import { TPointerEvent, Transform } from '../../EventTypeDefs';
type ScaleTransform = Transform & {
    gestureScale?: number;
    signX?: number;
    signY?: number;
};
declare function fireClippingTextEvent(target: fabric.Object, fnName?: string): void;
declare function cornerTL(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function cornerTR(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function cornerML(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function cornerMR(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function cornerBR(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function cornerBL(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function scaleEquallyCrop(eventData: TPointerEvent, transform: ScaleTransform, x: number, y: number): boolean;
declare function scalingXCrop(eventData: TPointerEvent, transform: ScaleTransform, x: number, y: number): boolean;
declare function scaleEquallyCropTL(eventData: any, transform: any, x: any, y: any): boolean;
declare function editClippingTextHandler(eventData: any, transform: any): boolean;
export { cornerTL, cornerTR, cornerML, cornerMR, cornerBR, cornerBL, scalingXCrop, scaleEquallyCrop, scaleEquallyCropTL, editClippingTextHandler, fireClippingTextEvent, };
