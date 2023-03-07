import * as fabric from 'fabric';
import { TPointerEvent, Transform } from '../../EventTypeDefs';
declare function fireClippingMaskEvent(target: fabric.Object): void;
declare function editClippingMaskHandler(eventData: any, transform: any): boolean;
declare function uploadImageHandler(eventData: any, transform: any): boolean;
type ScaleTransform = Transform & {
    gestureScale?: number;
    signX?: number;
    signY?: number;
};
declare function scaleEquallyCrop(eventData: TPointerEvent, transform: ScaleTransform, x: number, y: number): boolean | undefined;
declare function scalingXCrop(eventData: TPointerEvent, transform: ScaleTransform, x: number, y: number): boolean | undefined;
declare function imageCornerML(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function imageCornerMR(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare const scalingEqually: import("fabric/dist/src/EventTypeDefs").TransformActionHandler<import("fabric/dist/src/EventTypeDefs").Transform>;
export { fireClippingMaskEvent, editClippingMaskHandler, uploadImageHandler, scaleEquallyCrop, imageCornerML, imageCornerMR, scalingXCrop, scalingEqually, };
