import * as fabric from 'fabric';
import { normalizePoint } from '../../controls/util';
// @ts-ignore
var wrapWithFireEvent = fabric.controlsUtils.wrapWithFireEvent;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fireClippingTextEvent(target, fnName) {
    var _a;
    // console.log(fnName, '====fireClippingTextEvent====');
    (_a = target.canvas) === null || _a === void 0 ? void 0 : _a.fire('clippingtext:update', {
        action: 'clippingText',
        target: target,
    });
}
// @ts-ignore
function scaleIsProportional(eventData, fabricObject) {
    var canvas = fabricObject.canvas;
    var uniScaleKey = canvas.uniScaleKey;
    var uniformIsToggled = eventData[uniScaleKey];
    return (canvas.uniformScaling && !uniformIsToggled)
        || (!canvas.uniformScaling && uniformIsToggled);
}
// @ts-ignore
function scalingIsForbidden(fabricObject, by, scaleProportionally) {
    var lockX = fabricObject.lockScalingX;
    var lockY = fabricObject.lockScalingY;
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
// @ts-ignore
function getPatternLocalPoint(transform, originX, originY, x, y) {
    var target = transform.target;
    var control = target.controls[transform.corner];
    var zoom = target.canvas.getZoom();
    var padding = target.padding / zoom;
    // const localPoint = target.pattern.toLocalPoint(new fabric.Point(x, y), originX, originY);
    var localPoint = normalizePoint(target.pattern, new fabric.Point(x, y), originX, originY);
    // const localPoint = fabric.controlsUtils.getLocalPoint(transform, originX, originY, x, y);
    if (localPoint.x >= padding) {
        localPoint.x -= padding;
    }
    if (localPoint.x <= -padding) {
        localPoint.x += padding;
    }
    if (localPoint.y >= padding) {
        localPoint.y -= padding;
    }
    if (localPoint.y <= padding) {
        localPoint.y += padding;
    }
    localPoint.x -= control.offsetX;
    localPoint.y -= control.offsetY;
    return localPoint;
}
// @ts-ignore
// eslint-disable-next-line func-names
var sign = (Math.sign || function (x) { return ((x > 0) - (x < 0)) || +x; });
var CENTER = 'center';
// @ts-ignore
function isTransformCentered(transform) {
    return transform.originX === CENTER && transform.originY === CENTER;
}
// @ts-ignore
function scaleObject(eventData, transform, x, y, options) {
    var target = transform.target;
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    var lockScalingX = target.lockScalingX;
    var lockScalingY = target.lockScalingY;
    var by = options.by;
    var scaleProportionally = scaleIsProportional(eventData, target);
    var forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var gestureScale = transform.gestureScale;
    var newPoint;
    var scaleX;
    var scaleY;
    var dim;
    var signX;
    var signY = transform.gestureScale;
    if (forbidScaling) {
        return false;
    }
    if (gestureScale) {
        scaleX = transform.scaleX * gestureScale;
        scaleY = transform.scaleY * gestureScale;
    }
    else {
        newPoint = getPatternLocalPoint(transform, transform.originX, transform.originY, x, y);
        // console.log('newPoint', newPoint);
        // use of sign: We use sign to detect change of direction of an action. sign usually change when
        // we cross the origin point with the mouse. So a scale flip for example. There is an issue when scaling
        // by center and scaling using one middle control ( default: mr, mt, ml, mb), the mouse movement can easily
        // cross many time the origin point and flip the object. so we need a way to filter out the noise.
        // This ternary here should be ok to filter out X scaling when we want Y only and vice versa.
        signX = by !== 'y' ? sign(newPoint.x) : 1;
        signY = by !== 'x' ? sign(newPoint.y) : 1;
        if (!transform.signX) {
            transform.signX = signX;
        }
        if (!transform.signY) {
            transform.signY = signY;
        }
        if (target.lockScalingFlip && (transform.signX !== signX || transform.signY !== signY)) {
            return false;
        }
        // console.log(target, transform);
        // dim = target.oCoords.tlS;
        dim = target.pattern._getTransformedDimensions();
        // missing detection of flip and logic to switch the origin
        if (scaleProportionally && !by) {
            // uniform scaling
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y);
            var original = transform.original;
            // eslint-disable-next-line max-len
            var originalDistance = Math.abs((dim.x * original.pattern.scaleX) / target.pattern.scaleX) + Math.abs((dim.y * original.pattern.scaleY) / target.pattern.scaleY);
            var scale = distance / originalDistance;
            scaleX = original.pattern.scaleX * scale;
            scaleY = original.pattern.scaleY * scale;
        }
        else {
            scaleX = Math.abs((newPoint.x * target.pattern.scaleX) / dim.x);
            scaleY = Math.abs((newPoint.y * target.pattern.scaleY) / dim.y);
        }
        // if we are scaling by center, we need to double the scale
        if (isTransformCentered(transform)) {
            scaleX *= 2;
            scaleY *= 2;
        }
        if (transform.signX !== signX && by !== 'y') {
            // @ts-ignore
            transform.originX = opposite[transform.originX];
            scaleX *= -1;
            transform.signX = signX;
        }
        if (transform.signY !== signY && by !== 'x') {
            // @ts-ignore
            transform.originY = opposite[transform.originY];
            scaleY *= -1;
            transform.signY = signY;
        }
    }
    // minScale is taken are in the setter.
    var oldScaleX = target.pattern.scaleX;
    var oldScaleY = target.pattern.scaleY;
    var corner = target.__corner;
    var originPattern = transform.original.pattern;
    var lockMinScaleY = false;
    var lockMinScaleX = false;
    if (corner && originPattern && originPattern.minScale && originPattern.minScale[corner]) {
        var scale = originPattern.minScale[corner];
        lockMinScaleX = scaleX < scale.scaleX;
        lockMinScaleY = scaleY < scale.scaleY;
        if (lockMinScaleX) {
            scaleX = scale.scaleX;
        }
        if (lockMinScaleY) {
            scaleY = scale.scaleY;
        }
    }
    if (!by) {
        // eslint-disable-next-line no-unused-expressions
        !lockScalingX && !lockMinScaleY && target.pattern.set('scaleX', scaleX);
        // eslint-disable-next-line no-unused-expressions
        !lockScalingY && !lockMinScaleX && target.pattern.set('scaleY', scaleY);
    }
    else {
        // forbidden cases already handled on top here.
        // eslint-disable-next-line no-unused-expressions
        by === 'x' && target.pattern.set('scaleX', scaleX);
        // eslint-disable-next-line no-unused-expressions
        by === 'y' && target.pattern.set('scaleY', scaleY);
    }
    target.dirty = true;
    target.canvas.requestRenderAll();
    var change = oldScaleX !== target.pattern.scaleX || oldScaleY !== target.pattern.scaleY;
    return change;
}
// @ts-ignore
function scaleObjectFromCorner(eventData, transform, x, y) {
    // @ts-ignore
    return scaleObject(eventData, transform, x, y);
}
// @ts-ignore
function scaleObjectX(eventData, transform, x, y) {
    return scaleObject(eventData, transform, x, y, { by: 'x' });
}
// @ts-ignore
function scaleObjectY(eventData, transform, x, y) {
    return scaleObject(eventData, transform, x, y, { by: 'y' });
}
// @ts-ignore
function wrapWithFixedAnchor(actionHandler) {
    // @ts-ignore
    // eslint-disable-next-line func-names
    return function (eventData, transform, x, y) {
        var target = transform.target;
        var centerPoint = target.pattern.getCenterPoint();
        var constraint = target.pattern.translateToOriginPoint(centerPoint, transform.originX, transform.originY);
        var actionPerformed = actionHandler(eventData, transform, x, y);
        target.pattern.setPositionByOrigin(constraint, transform.originX, transform.originY);
        return actionPerformed;
    };
}
var scalingEqually = wrapWithFireEvent('scaling2', wrapWithFixedAnchor(scaleObjectFromCorner));
var scalingX = wrapWithFireEvent('scaling2', wrapWithFixedAnchor(scaleObjectX));
var scalingY = wrapWithFireEvent('scaling2', wrapWithFixedAnchor(scaleObjectY));
// @ts-ignore
function cornerTL(dim, finalMatrix, fabricObject) {
    var vpt = fabricObject.canvas.viewportTransform;
    var zoom = fabricObject.canvas.getZoom();
    var coords = fabricObject.pattern._getCoords(true, true);
    return {
        x: coords.tl.x * zoom + vpt[4],
        y: coords.tl.y * zoom + vpt[5],
    };
}
// @ts-ignore
function cornerTR(dim, finalMatrix, fabricObject) {
    var vpt = fabricObject.canvas.viewportTransform;
    var zoom = fabricObject.canvas.getZoom();
    var coords = fabricObject.pattern._getCoords(true, true);
    return {
        x: coords.tr.x * zoom + vpt[4],
        y: coords.tr.y * zoom + vpt[5],
    };
}
// @ts-ignore
function cornerML(dim, finalMatrix, fabricObject) {
    var vpt = fabricObject.canvas.viewportTransform;
    var zoom = fabricObject.canvas.getZoom();
    var coords = fabricObject.pattern._getCoords(true, true);
    return {
        x: ((coords.tl.x + coords.bl.x) * zoom) / 2 + vpt[4],
        y: ((coords.tl.y + coords.bl.y) * zoom) / 2 + vpt[5],
    };
}
// @ts-ignore
function cornerMR(dim, finalMatrix, fabricObject) {
    var vpt = fabricObject.canvas.viewportTransform;
    var zoom = fabricObject.canvas.getZoom();
    var coords = fabricObject.pattern._getCoords(true, true);
    return {
        x: ((coords.tr.x + coords.br.x) * zoom) / 2 + vpt[4],
        y: ((coords.tr.y + coords.br.y) * zoom) / 2 + vpt[5],
    };
}
// @ts-ignore
function cornerBR(dim, finalMatrix, fabricObject) {
    var vpt = fabricObject.canvas.viewportTransform;
    var zoom = fabricObject.canvas.getZoom();
    var coords = fabricObject.pattern._getCoords(true, true);
    return {
        x: coords.br.x * zoom + vpt[4],
        y: coords.br.y * zoom + vpt[5],
    };
}
// @ts-ignore
function cornerBL(dim, finalMatrix, fabricObject) {
    var vpt = fabricObject.canvas.viewportTransform;
    var zoom = fabricObject.canvas.getZoom();
    var coords = fabricObject.pattern._getCoords(true, true);
    return {
        x: coords.bl.x * zoom + vpt[4],
        y: coords.bl.y * zoom + vpt[5],
    };
}
function editClippingTextHandler(eventData, transform) {
    var target = transform.target;
    target.isClipping = true;
    fireClippingTextEvent(target, 'editClippingTextHandler');
    return true;
}
export { cornerTL, cornerTR, cornerML, cornerMR, cornerBR, cornerBL, scalingEqually, scalingX, scalingY, editClippingTextHandler, fireClippingTextEvent, };
