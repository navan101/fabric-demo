import * as fabric from 'fabric';
import { invertOrigin, isLocked, isTransformCentered, normalizePoint } from '../util';
import { calcScale } from '../cropping/cropping.controls.handlers';
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
    var localPoint = normalizePoint(target.clippingPath, new fabric.Point(x, y), originX, originY);
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
function cornerTL(dim, finalMatrix, fabricObject) {
    // const matrix = fabricObject.calcTransformMatrix();
    // const vpt = fabricObject.getViewportTransform();
    // const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    // const point = {
    //   x: (-fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    //   y: (-fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    // }
    // return fabric.util.transformPoint(point, _finalMatrix);
    // const matrix = fabricObject.calcTransformMatrix();
    // const vpt = fabricObject.getViewportTransform();
    // const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    // const point = {
    //   x: (-fabricObject.width / 2 - fabricObject.cropX),
    //   y: (-fabricObject.height / 2 - fabricObject.cropY),
    // }
    // return fabric.util.transformPoint(point, _finalMatrix);
    // const matrix = fabricObject.calcTransformMatrix();
    // const vpt = fabricObject.getViewportTransform();
    // const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    // const point = {
    //   x: (-fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    //   y: (-fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    // }
    // return fabric.util.transformPoint(point, _finalMatrix);
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var point = {
        x: (fabricObject.cropX - fabricObject.width / 2),
        y: -(fabricObject.height / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function cornerTR(dim, finalMatrix, fabricObject) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
    var point = {
        // eslint-disable-next-line max-len
        x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
        y: (-fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
    // const matrix = fabricObject.calcTransformMatrix();
    // const vpt = fabricObject.getViewportTransform();
    // const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    // const fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
    // const point = {
    //   x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.width / 2 - fabricObject.cropX),
    //   y: (fabricObject.cropY - fabricObject.height / 2),
    // }
    // return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function cornerML(dim, finalMatrix, fabricObject) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
    var point = {
        x: (-fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
        // eslint-disable-next-line max-len
        y: (fullHeight * fabricObject.clippingPath.scaleY / 2 - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function cornerMR(dim, finalMatrix, fabricObject) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
    var fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
    var point = {
        // eslint-disable-next-line max-len
        x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
        // eslint-disable-next-line max-len
        y: (fullHeight * fabricObject.clippingPath.scaleY / 2 - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function cornerBR(dim, finalMatrix, fabricObject) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
    var fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
    var point = {
        // eslint-disable-next-line max-len
        x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
        // eslint-disable-next-line max-len
        y: (fullHeight * fabricObject.clippingPath.scaleY - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function cornerBL(dim, finalMatrix, fabricObject) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
    var point = {
        x: (-fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
        // eslint-disable-next-line max-len
        y: (fullHeight * fabricObject.clippingPath.scaleY - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// function scaleEquallyCrop(
//   eventData: TPointerEvent,
//   transform: ScaleTransform,
//   x: number,
//   y: number,
// ) {
//   return scaleObjectCrop(eventData, transform, x, y);
// }
function scaleEquallyCrop(eventData, transform, x, y) {
    var corner = transform.corner;
    if (corner === 'tlS') {
        return scaleObjectCrop(eventData, transform, x, y);
    }
    else {
        return scaleObjectCropTL(eventData, transform, x, y);
    }
    // if (corner === 'trS') {
    //   return scaleObjectCropTR(eventData, transform, x, y);
    // }
    // if (corner === 'brS') {
    //   return scaleObjectCropBR(eventData, transform, x, y);
    // }
    // if (corner === 'blS') {
    //   return scaleObjectCropBL(eventData, transform, x, y);
    // }
}
function scalingXCrop(eventData, transform, x, y) {
    return scaleObjectCrop(eventData, transform, x, y, { by: 'x' });
}
function scaleObjectCrop(eventData, transform, x, y, options) {
    var _a, _b, _c, _d, _e, _f;
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target), forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var newPoint, scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    var centerPoint = target.clippingPath.getRelativeCenterPoint();
    var constraint = target.clippingPath.translateToOriginPoint(centerPoint, transform.originX, transform.originY);
    var centerPointText = target.clippingPath.getRelativeCenterPoint();
    var constraintText = target.clippingPath.translateToOriginPoint(centerPointText, transform.originX, transform.originY);
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
        newPoint = normalizePoint(target.clippingPath, new fabric.Point(x, y), transform.originX, transform.originY);
        // newPoint = getPatternLocalPoint(transform, transform.originX, transform.originY, x, y);
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
        dim = target.clippingPath._getTransformedDimensions();
        // missing detection of flip and logic to switch the origin
        if (scaleProportionally && !by) {
            // uniform scaling
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), 
            // { original } = transform,
            originalDistance = Math.abs((dim.x * ((_a = original.clippingPath) === null || _a === void 0 ? void 0 : _a.scaleX)) / target.clippingPath.scaleX) +
                Math.abs((dim.y * ((_b = original.clippingPath) === null || _b === void 0 ? void 0 : _b.scaleY)) / target.clippingPath.scaleY), scale = distance / originalDistance;
            scaleX = ((_c = original.clippingPath) === null || _c === void 0 ? void 0 : _c.scaleX) * scale;
            scaleY = ((_d = original.clippingPath) === null || _d === void 0 ? void 0 : _d.scaleY) * scale;
        }
        else {
            scaleX = Math.abs((newPoint.x * target.clippingPath.scaleX) / dim.x);
            scaleY = Math.abs((newPoint.y * target.clippingPath.scaleY) / dim.y);
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
    var oldScaleX = target.clippingPath.scaleX;
    var oldScaleY = target.clippingPath.scaleY;
    var corner = target.__corner;
    var originPattern = transform.original.clippingPath;
    var lockMinScaleY = false;
    var lockMinScaleX = false;
    // @ts-ignore
    if (corner && originPattern && originPattern.minScale && originPattern.minScale[corner]) {
        // @ts-ignore
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
        !isLocked(target, 'lockScalingX') && !lockMinScaleY && target.clippingPath.set('scaleX', scaleX);
        !isLocked(target, 'lockScalingY') && !lockMinScaleX && target.clippingPath.set('scaleY', scaleY);
    }
    else {
        // forbidden cases already handled on top here.
        by === 'x' && target.clippingPath.set('scaleX', scaleX);
        by === 'y' && target.clippingPath.set('scaleY', scaleY);
    }
    target.clippingPath.setPositionByOrigin(constraint, transform.originX, transform.originY);
    // target.setPositionByOrigin(constraintText, transform.originX, transform.originY);
    var centerPattern = target.clippingPath.getRelativeCenterPoint();
    var center = {
        x: ((_e = original.clippingPath) === null || _e === void 0 ? void 0 : _e.center.x) - centerPattern.x,
        y: ((_f = original.clippingPath) === null || _f === void 0 ? void 0 : _f.center.y) - centerPattern.y,
    };
    var angleRadians = fabric.util.degreesToRadians(-target.angle);
    var pointCenter = new fabric.Point(center.x, center.y);
    var point = fabric.util.rotateVector(pointCenter, angleRadians);
    target.cropX = original.cropX + point.x;
    target.cropY = original.cropY + point.y;
    // const widthPattern = target.clippingPath.getScaledWidth();
    // const heightPattern = target.clippingPath.getScaledHeight();
    // const widthText = target.getScaledWidth();
    // const heightText = target.getScaledHeight();
    // if (widthText >= heightText) {
    //   target.clippingPath.scaleFactor = widthPattern / widthText;
    // } else {
    //   target.clippingPath.scaleFactor = heightPattern / heightText;
    // }
    return oldScaleX !== target.clippingPath.scaleX || oldScaleY !== target.clippingPath.scaleY;
}
// @ts-ignore
function scaleEquallyCropTL(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.clippingPath.getOriginalElementWidth();
    var fullHeight = target.clippingPath.getOriginalElementHeight();
    var remainderX = fullWidth - target.clippingPath.width - target.cropX;
    var remainderY = fullHeight - target.clippingPath.height - target.cropY;
    var anchorOriginX = 1 + (remainderX / target.clippingPath.width);
    var anchorOriginY = 1 + (remainderY / target.clippingPath.height);
    var centerPoint = target.clippingPath.getRelativeCenterPoint();
    var constraint = target.clippingPath.translateToOriginPoint(centerPoint, anchorOriginX, anchorOriginY);
    var newPoint = normalizePoint(target.clippingPath, new fabric.Point(x, y), anchorOriginX, anchorOriginY);
    // const newPoint = fabric.controlsUtils.getLocalPoint(transform, transform.originX, transform.originY, x, y);
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var oldScaleX = target.clippingPath.scaleX;
    var oldScaleY = target.clippingPath.scaleY;
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var scaledRemainderY = remainderY / scaleChangeY;
    var newWidth = target.clippingPath.width / scaleChangeX;
    var newHeight = target.clippingPath.height / scaleChangeY;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = fullHeight - newHeight - scaledRemainderY;
    // if (newWidth + scaledRemainderX > fullWidth || newHeight + scaledRemainderY > fullHeight) {
    //   return false;
    // }
    target.clippingPath.scaleX = scale;
    target.clippingPath.scaleY = scale;
    // target.clippingPath.width = newWidth;
    // target.clippingPath.height = newHeight;
    target.cropX = newCropX;
    target.cropY = newCropY;
    // if (target.clippingPath) {
    //   target.clippingPath.scaleX /= scaleChangeX;
    //   target.clippingPath.scaleY /= scaleChangeY;
    // }
    var newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
    var newAnchorOriginY = 1 + (scaledRemainderY / newHeight);
    target.clippingPath.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
    // target.clippingPath.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
    return true;
}
function scaleObjectCropTL(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var newPoint, scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderX = fullWidth - target.width - target.cropX;
    var remainderY = fullHeight - target.height - target.cropY;
    var anchorOriginX = 1 + (remainderX / target.width);
    var anchorOriginY = 1 + (remainderY / target.height);
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, anchorOriginY);
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
        newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, anchorOriginY);
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
        dim = target._getOriginalTransformedDimensions();
        // missing detection of flip and logic to switch the origin
        if (scaleProportionally && !by) {
            // uniform scaling
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_1 = transform.original, originalDistance = Math.abs((dim.x * original_1.scaleX) / target.scaleX) +
                Math.abs((dim.y * original_1.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original_1.scaleX * scale;
            scaleY = original_1.scaleY * scale;
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
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleChangeX = scaleX / oldScaleX;
    var scaleChangeY = scaleY / oldScaleY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var scaledRemainderY = remainderY / scaleChangeY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = fullHeight - newHeight - scaledRemainderY;
    if (newWidth + scaledRemainderX > fullWidth || newHeight + scaledRemainderY > fullHeight) {
        return false;
    }
    target.scaleX = scaleX;
    target.scaleY = scaleY;
    target.width = newWidth;
    target.height = newHeight;
    target.cropX = newCropX;
    target.cropY = newCropY;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
        target.clippingPath.scaleY /= scaleChangeY;
    }
    var newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
    var newAnchorOriginY = 1 + (scaledRemainderY / newHeight);
    target.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
    return true;
}
function editClippingTextHandler(eventData, transform) {
    var target = transform.target;
    // target.isClipping = true;
    target.set('isClipping', true);
    fireClippingTextEvent(target, 'editClippingTextHandler');
    return true;
}
export { cornerTL, cornerTR, cornerML, cornerMR, cornerBR, cornerBL, scalingXCrop, scaleEquallyCrop, scaleEquallyCropTL, editClippingTextHandler, fireClippingTextEvent, };
