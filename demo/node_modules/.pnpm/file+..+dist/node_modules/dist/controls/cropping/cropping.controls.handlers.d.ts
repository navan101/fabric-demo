import * as fabric from 'fabric';
export declare function fireCropImageEvent(target: fabric.Object): void;
export declare function calcScale(newPoint: {
    x: number;
    y: number;
}, height: number, width: number, flipX?: boolean, flipY?: boolean): number;
/**
* Crops image dragging left to right.
* @private
* @param {Object} eventData
* @param {Number} x pointer's x coordinate
* @param {Number} y pointer's y coordinate
* @return {Boolean} true if the cropping occurred
*/
declare function cropFromLeft(eventData: any, transform: any, x: any, y: any): boolean;
declare function cropFromLeftFlig(eventData: any, transform: any, x: any, y: any): boolean;
/**
 * Crops image dragging right to left.
 * @private
 * @param {Object} eventData
 * @param {Number} x pointer's x coordinate
 * @param {Number} y pointer's y coordinate
 * @return {Boolean} true if the cropping occurred
 */
declare function cropFromRight(eventData: any, transform: any, x: any, y: any): boolean;
declare function cropFromRightFlig(eventData: any, transform: any, x: any, y: any): boolean;
/**
 * Crops image dragging top to bottom.
 * @private
 * @param {Object} eventData
 * @param {Number} x pointer's x coordinate
 * @param {Number} y pointer's y coordinate
 * @return {Boolean} true if the scaling occurred
 */
declare function cropFromTop(eventData: any, transform: any, x: any, y: any): boolean;
declare function cropFromTopFlig(eventData: any, transform: any, x: any, y: any): boolean;
/**
 * Crops image dragging bottom to top.
 * @private
 * @param {Object} eventData
 * @param {Number} x pointer's x coordinate
 * @param {Number} y pointer's y coordinate
 * @return {Boolean} true if the scaling occurred
 */
declare function cropFromBottom(eventData: any, transform: any, x: any, y: any): boolean;
declare function cropFromBottomFlig(eventData: any, transform: any, x: any, y: any): boolean;
declare const cropFromTopLeft: (eventData: any, transform: any, x: any, y: any) => any;
declare const cropFromBottomRight: (eventData: any, transform: any, x: any, y: any) => any;
declare const cropFromBottomLeft: (eventData: any, transform: any, x: any, y: any) => any;
declare const cropFromTopRight: (eventData: any, transform: any, x: any, y: any) => any;
declare function imageCornerTL(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function imageCornerTR(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function imageCornerBR(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function imageCornerBL(dim: any, finalMatrix: any, fabricObject: any): fabric.Point;
declare function scaleEquallyCropTR(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropTRFlig(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropBR(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropBRFlig(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropBL(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropBLFlig(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropTL(eventData: any, transform: any, x: any, y: any): boolean;
declare function scaleEquallyCropTLFlig(eventData: any, transform: any, x: any, y: any): boolean;
export { cropFromTopRight, cropFromBottomLeft, cropFromBottomRight, cropFromTopLeft, cropFromLeft, cropFromLeftFlig, cropFromRight, cropFromRightFlig, cropFromTop, cropFromTopFlig, cropFromBottom, cropFromBottomFlig, imageCornerTL, imageCornerBR, imageCornerBL, imageCornerTR, scaleEquallyCropTR, scaleEquallyCropBR, scaleEquallyCropBL, scaleEquallyCropTL, scaleEquallyCropTLFlig, scaleEquallyCropBRFlig, scaleEquallyCropTRFlig, scaleEquallyCropBLFlig, };
