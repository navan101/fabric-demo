import * as fabric from 'fabric';
import { invertOrigin, isLocked, isTransformCentered } from './util';
/**
 * Inspect event and fabricObject properties to understand if the scaling action
 * @param {Event} eventData from the user action
 * @param {FabricObject} fabricObject the fabric object about to scale
 * @return {Boolean} true if scale is proportional
 */
export function scaleIsProportional(eventData, fabricObject) {
    var canvas = fabricObject.canvas, 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    uniformIsToggled = eventData[canvas.uniScaleKey];
    return ((canvas.uniformScaling && !uniformIsToggled) ||
        (!canvas.uniformScaling && uniformIsToggled));
}
/**
 * Inspect fabricObject to understand if the current scaling action is allowed
 * @param {FabricObject} fabricObject the fabric object about to scale
 * @param {String} by 'x' or 'y' or ''
 * @param {Boolean} scaleProportionally true if we are trying to scale proportionally
 * @return {Boolean} true if scaling is not allowed at current conditions
 */
export function scalingIsForbidden(fabricObject, by, scaleProportionally) {
    var lockX = isLocked(fabricObject, 'lockScalingX'), lockY = isLocked(fabricObject, 'lockScalingY');
    if (lockX && lockY) {
        return true;
    }
    if (!by && (lockX || lockY) && scaleProportionally) {
        return true;
    }
    if (lockX && by === 'x') {
        return true;
    }
    if (lockY && by === 'y') {
        return true;
    }
    return false;
}
export var scaleObjectFromCorner = function (eventData, transform, x, y) {
    return scaleObject(eventData, transform, x, y);
};
function scaleObject(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, scaleProportionally = scaleIsProportional(eventData, target), forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var newPoint, scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
        newPoint = fabric.controlsUtils.getLocalPoint(
        // @ts-ignore
        transform, transform.originX, transform.originY, x, y);
        // use of sign: We use sign to detect change of direction of an action. sign usually change when
        // we cross the origin point with the mouse. So a scale flip for example. There is an issue when scaling
        // by center and scaling using one middle control ( default: mr, mt, ml, mb), the mouse movement can easily
        // cross many time the origin point and flip the object. so we need a way to filter out the noise.
        // This ternary here should be ok to filter out X scaling when we want Y only and vice versa.
        signX = by !== 'y' ? Math.sign(newPoint.x || transform.signX || 1) : 1;
        signY = by !== 'x' ? Math.sign(newPoint.y || transform.signY || 1) : 1;
        if (!transform.signX) {
            transform.signX = signX;
        }
        if (!transform.signY) {
            transform.signY = signY;
        }
        if (isLocked(target, 'lockScalingFlip') &&
            (transform.signX !== signX || transform.signY !== signY)) {
            return false;
        }
        dim = target._getTransformedDimensions();
        // missing detection of flip and logic to switch the origin
        if (scaleProportionally && !by) {
            // uniform scaling
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original = transform.original, originalDistance = Math.abs((dim.x * original.scaleX) / target.scaleX) +
                Math.abs((dim.y * original.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original.scaleX * scale;
            scaleY = original.scaleY * scale;
        }
        else {
            scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
            scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
        }
        // if we are scaling by center, we need to double the scale
        if (isTransformCentered(transform)) {
            scaleX *= 2;
            scaleY *= 2;
        }
        if (transform.signX !== signX && by !== 'y') {
            transform.originX = invertOrigin(transform.originX);
            scaleX *= -1;
            transform.signX = signX;
        }
        if (transform.signY !== signY && by !== 'x') {
            transform.originY = invertOrigin(transform.originY);
            scaleY *= -1;
            transform.signY = signY;
        }
    }
    // minScale is taken are in the setter.
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleChangeX = scaleX / oldScaleX;
    var scaleChangeY = scaleX / oldScaleX;
    if (!by) {
        !isLocked(target, 'lockScalingX') && target.set('scaleX', scaleX);
        !isLocked(target, 'lockScalingY') && target.set('scaleY', scaleY);
    }
    else {
        // forbidden cases already handled on top here.
        by === 'x' && target.set('scaleX', scaleX);
        by === 'y' && target.set('scaleY', scaleY);
    }
    // @ts-ignore
    if (target.clippingPath) {
        // @ts-ignore
        target.clippingPath.sHeight = (target.clippingPath.height) * target.scaleY;
    }
    return oldScaleX !== target.scaleX || oldScaleY !== target.scaleY;
}
export var scalingEqually = fabric.controlsUtils.wrapWithFireEvent('scaling', 
// @ts-ignore
fabric.controlsUtils.wrapWithFixedAnchor(scaleObjectFromCorner));
