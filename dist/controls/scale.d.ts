import type { Object as FabricObject } from 'fabric';
import { TAxis } from '../typedefs';
import { TPointerEvent, Transform, TransformActionHandler } from '../EventTypeDefs';
type ScaleTransform = Transform & {
    gestureScale?: number;
    signX?: number;
    signY?: number;
};
type ScaleBy = TAxis | 'equally' | '' | undefined;
/**
 * Inspect event and fabricObject properties to understand if the scaling action
 * @param {Event} eventData from the user action
 * @param {FabricObject} fabricObject the fabric object about to scale
 * @return {Boolean} true if scale is proportional
 */
export declare function scaleIsProportional(eventData: TPointerEvent, fabricObject: FabricObject): boolean;
/**
 * Inspect fabricObject to understand if the current scaling action is allowed
 * @param {FabricObject} fabricObject the fabric object about to scale
 * @param {String} by 'x' or 'y' or ''
 * @param {Boolean} scaleProportionally true if we are trying to scale proportionally
 * @return {Boolean} true if scaling is not allowed at current conditions
 */
export declare function scalingIsForbidden(fabricObject: FabricObject, by: ScaleBy, scaleProportionally: boolean): boolean;
export declare const scaleObjectFromCorner: TransformActionHandler<ScaleTransform>;
export declare const scalingEqually: import("fabric/dist/src/EventTypeDefs").TransformActionHandler<import("fabric/dist/src/EventTypeDefs").Transform>;
export {};
