import * as fabric from 'fabric';
import { resolveOrigin } from '../util/misc/resolveOrigin';
export var getActionFromCorner = function (alreadySelected, corner, e, target) {
    if (!corner || !alreadySelected) {
        return 'drag';
    }
    var control = target.controls[corner];
    return control.getActionName(e, control, target);
};
export function isTransformCentered(transform) {
    return transform.originX === 'center' && transform.originY === 'center';
}
export function invertOrigin(origin) {
    return -resolveOrigin(origin) + 0.5;
}
export var isLocked = function (target, lockingKey) { return target[lockingKey]; };
export function normalizePoint(target, point, originX, originY) {
    var center = target.getRelativeCenterPoint(), p = typeof originX !== 'undefined' && typeof originY !== 'undefined'
        ? target.translateToGivenOrigin(center, 'center', 'center', originX, originY)
        : new fabric.Point(target.left, target.top), p2 = target.angle
        ? point.rotate(-fabric.util.degreesToRadians(target.angle), center)
        : point;
    return p2.subtract(p);
}
