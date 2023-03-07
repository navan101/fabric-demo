// import { CorjlObject } from '../types';
import * as fabric from 'fabric';
import { invertOrigin, isLocked, isTransformCentered, normalizePoint } from '../../controls/util';
function fireClippingMaskEvent(target) {
    var _a;
    (_a = target.canvas) === null || _a === void 0 ? void 0 : _a.fire('clipping:update', {
        action: 'clippingMask',
        target: target,
    });
}
function editClippingMaskHandler(eventData, transform) {
    var target = transform.target;
    target.isClipping = true;
    return true;
}
function uploadImageHandler(eventData, transform) {
    var target = transform.target;
    var input = document.createElement('input');
    input.style.display = 'none';
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    document.body.appendChild(input);
    input.onchange = function (event) {
        var _a;
        if (!((_a = input.files) === null || _a === void 0 ? void 0 : _a.length)) {
            return;
        }
        var src = URL.createObjectURL(event.target.files[0]);
        target.canvas.fire('object:upload', {
            e: eventData,
            target: target,
            transform: transform,
            src: src,
        });
        input.remove();
    };
    input.click();
    target.canvas.__onMouseUp(eventData);
    document.body.onfocus = function (event) {
        var _a;
        var elementTarget = event.target;
        if (input !== elementTarget || !((_a = input.files) === null || _a === void 0 ? void 0 : _a.length)) {
            input.remove();
        }
    };
    return false;
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
function scaleEquallyCrop(eventData, transform, x, y) {
    var corner = transform.corner;
    if (corner === 'tlS') {
        return scaleObjectCropTL(eventData, transform, x, y);
    }
    if (corner === 'trS') {
        return scaleObjectCropTR(eventData, transform, x, y);
    }
    if (corner === 'brS') {
        return scaleObjectCropBR(eventData, transform, x, y);
    }
    if (corner === 'blS') {
        return scaleObjectCropBL(eventData, transform, x, y);
    }
}
function scalingXCrop(eventData, transform, x, y) {
    var corner = transform.corner;
    if (corner === 'mlS') {
        return scaleObjectCropML(eventData, transform, x, y, { by: 'x' });
    }
    if (corner === 'mrS') {
        return scaleObjectCropMR(eventData, transform, x, y, { by: 'x' });
    }
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
function scaleObjectCropTL1(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target), forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
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
    // minScale is taken are in the setter.
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
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
    var scaleChangeX = scaleX / oldScaleX;
    var scaleChangeY = scaleY / oldScaleY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var scaledRemainderY = remainderY / scaleChangeY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = fullHeight - newHeight - scaledRemainderY;
    // if (!by) {
    //   !isLocked(target, 'lockScalingX') && !lockMinScaleY && target.set('scaleX', scaleX);
    //   !isLocked(target, 'lockScalingY') && !lockMinScaleX && target.set('scaleY', scaleY);
    // } else {
    //   // forbidden cases already handled on top here.
    //   by === 'x' && target.set('scaleX', scaleX);
    //   by === 'y' && target.set('scaleY', scaleY);
    // }
    !lockMinScaleY && target.set('scaleX', scaleX);
    !lockMinScaleX && target.set('scaleY', scaleY);
    // !lockMinScaleY && (target.scaleX = scaleX);
    // !lockMinScaleX && (target.scaleY = scaleY);
    !lockMinScaleY && (target.width = newWidth);
    !lockMinScaleX && (target.height = newHeight);
    !lockMinScaleY && (target.cropX = newCropX);
    !lockMinScaleX && (target.cropY = newCropY);
    if (target.clippingPath) {
        !lockMinScaleY && (target.clippingPath.scaleX /= scaleChangeX);
        !lockMinScaleX && (target.clippingPath.scaleY /= scaleChangeY);
    }
    var newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
    var newAnchorOriginY = 1 + (scaledRemainderY / newHeight);
    target.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
    return oldScaleX !== target.scaleX || oldScaleY !== target.scaleY;
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
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_2 = transform.original, originalDistance = Math.abs((dim.x * original_2.scaleX) / target.scaleX) +
                Math.abs((dim.y * original_2.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original_2.scaleX * scale;
            scaleY = original_2.scaleY * scale;
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
function scaleObjectCropTR(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderY = fullHeight - target.height - target.cropY;
    var anchorOriginX = target.cropX / target.width;
    var anchorOriginY = remainderY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, 1 + anchorOriginY);
    var newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, 1 + anchorOriginY);
    // const newPoint = fabric.controlsUtils.getLocalPoint(transform, -anchorOriginX, 1 + anchorOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleX, scaleY, signX, signY;
    var dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
        // uniform scaling
        var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_3 = transform.original, originalDistance = Math.abs((dim.x * original_3.scaleX) / target.scaleX) +
            Math.abs((dim.y * original_3.scaleY) / target.scaleY), scale = distance / originalDistance;
        scaleX = original_3.scaleX * scale;
        scaleY = original_3.scaleY * scale;
    }
    else {
        scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
        scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
    }
    // const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scaleX / oldScaleX;
    var scaleChangeY = scaleY / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newRemainderY = remainderY / scaleChangeY;
    var newCropX = target.cropX / scaleChangeX;
    var newCropY = fullHeight - newHeight - newRemainderY;
    if (newCropX + newWidth > fullWidth || newRemainderY + newHeight > fullHeight) {
        return false;
    }
    target.scaleX = scaleX;
    target.scaleY = scaleY;
    target.height = newHeight;
    target.width = newWidth;
    target.cropX = newCropX;
    target.cropY = newCropY;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
        target.clippingPath.scaleY /= scaleChangeY;
    }
    var newExtraAnchorY = newRemainderY / target.height;
    var newExtraAnchorX = target.cropX / target.width;
    target.setPositionByOrigin(constraint, -newExtraAnchorX, 1 + newExtraAnchorY);
    return true;
}
function scaleObjectCropBR(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var extraOriginX = target.cropX / target.width;
    var extraOriginY = target.cropY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -extraOriginX, -extraOriginY);
    var newPoint = normalizePoint(target, new fabric.Point(x, y), -extraOriginX, -extraOriginY);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleX, scaleY, signX, signY;
    var dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
        // uniform scaling
        var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_4 = transform.original, originalDistance = Math.abs((dim.x * original_4.scaleX) / target.scaleX) +
            Math.abs((dim.y * original_4.scaleY) / target.scaleY), scale = distance / originalDistance;
        scaleX = original_4.scaleX * scale;
        scaleY = original_4.scaleY * scale;
    }
    else {
        scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
        scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
    }
    // const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scaleX / oldScaleX;
    var scaleChangeY = scaleY / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = target.cropX / scaleChangeX;
    var newCropY = target.cropY / scaleChangeY;
    if (newCropX + newWidth > fullWidth || newCropY + newHeight > fullHeight) {
        return false;
    }
    target.scaleX = scaleX;
    target.scaleY = scaleY;
    target.height = newHeight;
    target.width = newWidth;
    target.cropX = newCropX;
    target.cropY = newCropY;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
        target.clippingPath.scaleY /= scaleChangeY;
    }
    var newExtraOriginX = target.cropX / target.width;
    var newExtraOriginY = target.cropY / target.height;
    target.setPositionByOrigin(constraint, -newExtraOriginX, -newExtraOriginY);
    return true;
}
function scaleObjectCropBL(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderX = fullWidth - target.width - target.cropX;
    var anchorOriginX = remainderX / target.width;
    var anchorOriginY = target.cropY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, 1 + anchorOriginX, -anchorOriginY);
    var newPoint = normalizePoint(target, new fabric.Point(x, y), 1 + anchorOriginX, -anchorOriginY);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleX, scaleY, signX, signY;
    var dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
        // uniform scaling
        var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_5 = transform.original, originalDistance = Math.abs((dim.x * original_5.scaleX) / target.scaleX) +
            Math.abs((dim.y * original_5.scaleY) / target.scaleY), scale = distance / originalDistance;
        scaleX = original_5.scaleX * scale;
        scaleY = original_5.scaleY * scale;
    }
    else {
        scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
        scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
    }
    // const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scaleX / oldScaleX;
    var scaleChangeY = scaleY / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = target.cropY / scaleChangeY;
    if (newWidth + remainderX > fullWidth || newHeight + newCropY > fullHeight) {
        return false;
    }
    target.scaleX = scaleX;
    target.scaleY = scaleY;
    target.height = newHeight;
    target.width = newWidth;
    target.cropX = newCropX;
    target.cropY = newCropY;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
        target.clippingPath.scaleY /= scaleChangeY;
    }
    var newAnchorOriginX = scaledRemainderX / newWidth;
    var newAnchorOriginY = newCropY / newHeight;
    target.setPositionByOrigin(constraint, 1 + newAnchorOriginX, -newAnchorOriginY);
    return true;
}
function scaleObjectCropML(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var newPoint, scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    var fullWidth = target.getOriginalElementWidth();
    var remainderX = fullWidth - target.width - target.cropX;
    var anchorOriginX = 1 + (remainderX / target.width);
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, transform.originY);
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
        newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, transform.originY);
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
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_6 = transform.original, originalDistance = Math.abs((dim.x * original_6.scaleX) / target.scaleX) +
                Math.abs((dim.y * original_6.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original_6.scaleX * scale;
            scaleY = original_6.scaleY * scale;
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
    var scaleChangeX = scaleX / oldScaleX;
    var scaledRemainderX = remainderX / scaleChangeX;
    var newWidth = target.width / scaleChangeX;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    if (newWidth + scaledRemainderX > fullWidth) {
        return false;
    }
    target.scaleX = scaleX;
    target.width = newWidth;
    target.cropX = newCropX;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
    }
    var newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
    target.setPositionByOrigin(constraint, newAnchorOriginX, transform.originY);
    return true;
}
function scaleObjectCropMR(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var newPoint, scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    var fullWidth = target.getOriginalElementWidth();
    var anchorOriginX = target.cropX / target.width;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, transform.originY);
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
        newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, transform.originY);
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
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_7 = transform.original, originalDistance = Math.abs((dim.x * original_7.scaleX) / target.scaleX) +
                Math.abs((dim.y * original_7.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original_7.scaleX * scale;
            scaleY = original_7.scaleY * scale;
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
    var scaleChangeX = scaleX / oldScaleX;
    var newWidth = target.width / scaleChangeX;
    var newCropX = target.cropX / scaleChangeX;
    if (newCropX + newWidth > fullWidth) {
        return false;
    }
    target.scaleX = scaleX;
    target.width = newWidth;
    target.cropX = newCropX;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
    }
    var newAnchorOriginX = target.cropX / target.width;
    target.setPositionByOrigin(constraint, -newAnchorOriginX, transform.originY);
    return true;
}
// @ts-ignore
function imageCornerML(dim, finalMatrix, fabricObject /* currentControl */) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullHeight = fabricObject.getOriginalElementHeight();
    var point = {
        x: (-fabricObject.width / 2 - fabricObject.cropX),
        y: (fullHeight / 2 - fabricObject.height / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function imageCornerMR(dim, finalMatrix, fabricObject /* currentControl */) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullWidth = fabricObject.getOriginalElementWidth();
    var fullHeight = fabricObject.getOriginalElementHeight();
    var sX = (fabricObject.originalScaleX || fabricObject.scaleX);
    var sY = (fabricObject.originalScaleX || fabricObject.scaleX);
    // (this.originalScaleX || this.scaleX)
    var point = {
        x: (fullWidth * sX - fabricObject.width / 2 - fabricObject.cropX),
        y: (fullHeight / 2 - fabricObject.height / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
function scaleObjectMR(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    var fullWidth = target.getOriginalElementWidth();
    var anchorOriginX = target.cropX / target.width;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, transform.originY);
    var newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, transform.originY);
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
        // newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, transform.originY);
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
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_8 = transform.original, originalDistance = Math.abs((dim.x * original_8.scaleX) / target.scaleX) +
                Math.abs((dim.y * original_8.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original_8.scaleX * scale;
            scaleY = original_8.scaleY * scale;
        }
        else {
            scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
            scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
            console.log(scaleX, 'scaleX');
            console.log(scaleY, 'scaleY');
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
    // console.log(scaleX, 'scaleX');
    // console.log(scaleY, 'scaleY');
    var oldScaleX = target.scaleX;
    var scaleChangeX = scaleX / oldScaleX;
    var newWidth = target.width / scaleChangeX;
    var newCropX = target.cropX / scaleChangeX;
    // if (newCropX + newWidth > fullWidth) {
    //   return false;
    // }
    if (transform.originX === 'center' ||
        (transform.originX === 'right' && newPoint.x < 0) ||
        (transform.originX === 'left' && newPoint.x > 0)) {
        var target_1 = transform.target, strokePadding = target_1.strokeWidth / (target_1.strokeUniform ? target_1.scaleX : 1), multiplier = isTransformCentered(transform) ? 2 : 1, 
        // @ts-ignore
        oldWidth = target_1.clippingPath.width, newWidth_1 = Math.ceil(Math.abs((newPoint.x * multiplier) / target_1.scaleX) - strokePadding);
        // @ts-ignore
        target_1.clippingPath.set('width', Math.max(newWidth_1, 0));
        // @ts-ignore
        if (target_1.clippingPath.dynamicMinWidth >= target_1.clippingPath.width) {
            // @ts-ignore
            target_1.set('width', target_1.clippingPath.dynamicMinWidth);
            // @ts-ignore
            target_1.set('height', target_1.clippingPath.height);
            return oldWidth !== target_1.width;
        }
        //  check against actual target width in case `newWidth` was rejected
        console.log(scaleX, '=== scaleX ===');
        target_1.set('originalScaleX', scaleX);
        target_1.set('originalScaleY', scaleX);
        target_1.set('width', Math.max(newWidth_1, 0));
        // @ts-ignore
        target_1.set('height', target_1.clippingPath.height);
        // @ts-ignore
        return oldWidth !== target_1.clippingPath.width;
    }
    // // target.scaleX = scaleX;
    // // target.width = newWidth;
    // target.cropX = newCropX;
    // // if (target.clippingPath) {
    // //   target.clippingPath.scaleX /= scaleChangeX;
    // // }
    // const newAnchorOriginX = target.cropX / target.width;
    // target.setPositionByOrigin(constraint, -newAnchorOriginX, transform.originY);
    return true;
}
function scaleObjectML(eventData, transform, x, y, options) {
    if (options === void 0) { options = {}; }
    var target = transform.target, by = options.by, original = transform.original, scaleProportionally = scaleIsProportional(eventData, target);
    var forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
    var scaleX, scaleY, dim, signX, signY;
    if (forbidScaling) {
        return false;
    }
    var fullWidth = target.getOriginalElementWidth();
    var remainderX = fullWidth - target.width - target.cropX;
    var anchorOriginX = 1 + (remainderX / target.width);
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, transform.originY);
    var newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, transform.originY);
    if (transform.gestureScale) {
        scaleX = transform.scaleX * transform.gestureScale;
        scaleY = transform.scaleY * transform.gestureScale;
    }
    else {
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
            var distance = Math.abs(newPoint.x) + Math.abs(newPoint.y), original_9 = transform.original, originalDistance = Math.abs((dim.x * original_9.scaleX) / target.scaleX) +
                Math.abs((dim.y * original_9.scaleY) / target.scaleY), scale = distance / originalDistance;
            scaleX = original_9.scaleX * scale;
            scaleY = original_9.scaleY * scale;
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
    var scaleChangeX = scaleX / oldScaleX;
    var scaledRemainderX = remainderX / scaleChangeX;
    var newWidth = target.width / scaleChangeX;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    // if (newWidth + scaledRemainderX > fullWidth) {
    //   return false;
    // }
    // target.scaleX = scaleX;
    // target.width = newWidth;
    // target.cropX = newCropX;
    // if (target.clippingPath) {
    //   target.clippingPath.scaleX /= scaleChangeX;
    // }
    // const newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
    // target.setPositionByOrigin(constraint, newAnchorOriginX, transform.originY);
    // return true;
    if (transform.originX === 'center' ||
        (transform.originX === 'right' && newPoint.x < 0) ||
        (transform.originX === 'left' && newPoint.x > 0)) {
        var target_2 = transform.target, strokePadding = target_2.strokeWidth / (target_2.strokeUniform ? target_2.scaleX : 1), multiplier = isTransformCentered(transform) ? 2 : 1, 
        // @ts-ignore
        oldWidth = target_2.width, newWidth_2 = Math.ceil(Math.abs((newPoint.x * multiplier) / target_2.scaleX) - strokePadding);
        // @ts-ignore
        // target.clippingPath.set('width', Math.max(newWidth, 0));
        // @ts-ignore
        // if (target.clippingPath.dynamicMinWidth >= target.clippingPath.width) {
        //   // @ts-ignore
        //   target.set('width', target.clippingPath.dynamicMinWidth);
        //   // @ts-ignore
        //   target.set('height', target.clippingPath.height);
        //   return oldWidth !== target.width;
        // }
        // //  check against actual target width in case `newWidth` was rejected
        // console.log(scaleX, 'scaleX');
        // target.set('originalScaleX', scaleX);
        // target.set('originalScaleY', scaleX);
        target_2.set('width', Math.max(newWidth_2, 0));
        // // @ts-ignore
        // target.set('height', target.clippingPath.height);
        return oldWidth !== target_2.width;
    }
    // // target.scaleX = scaleX;
    // // target.width = newWidth;
    // target.cropX = newCropX;
    // // if (target.clippingPath) {
    // //   target.clippingPath.scaleX /= scaleChangeX;
    // // }
    // const newAnchorOriginX = target.cropX / target.width;
    // target.setPositionByOrigin(constraint, -newAnchorOriginX, transform.originY);
    return true;
}
var scaleObjectFromCorner = function (eventData, transform, x, y) {
    console.log(transform, 'transform');
    var corner = transform.corner;
    if (corner === 'mr') {
        return scaleObjectMR(eventData, transform, x, y, { by: 'x' });
    }
    else {
        return scaleObjectML(eventData, transform, x, y, { by: 'x' });
    }
};
var scalingEqually = fabric.controlsUtils.wrapWithFireEvent('resizing', 
// @ts-ignore
fabric.controlsUtils.wrapWithFixedAnchor(scaleObjectFromCorner));
export { fireClippingMaskEvent, editClippingMaskHandler, uploadImageHandler, scaleEquallyCrop, imageCornerML, imageCornerMR, scalingXCrop, scalingEqually, };
