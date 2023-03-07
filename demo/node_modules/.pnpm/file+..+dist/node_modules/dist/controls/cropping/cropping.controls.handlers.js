import * as fabric from 'fabric';
import { normalizePoint } from '../../controls/util';
export function fireCropImageEvent(target) {
    var _a;
    (_a = target.canvas) === null || _a === void 0 ? void 0 : _a.fire('object:modified', {
        action: 'cropImage',
        target: target,
    });
}
export function calcScale(newPoint, height, width, flipX, flipY) {
    var scaleX = Math.abs(newPoint.x / width);
    var scaleY = Math.abs(newPoint.y / height);
    if (flipX || flipY) {
        return Math.max(scaleX, scaleY);
    }
    return Math.min(scaleX, scaleY);
}
/**
* Crops image dragging left to right.
* @private
* @param {Object} eventData
* @param {Number} x pointer's x coordinate
* @param {Number} y pointer's y coordinate
* @return {Boolean} true if the cropping occurred
*/
// @ts-ignore
function cropFromLeft(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'right';
    var width = t.target.width;
    var left = -(width / 2);
    var centerPoint = t.target.getRelativeCenterPoint();
    var newLeft = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    // const newLeft = fabric.controlsUtils.getLocalPoint(transform, 'center', 'center', x, y);
    var constraint = t.target.translateToOriginPoint(centerPoint, anchorPoint, t.originY);
    var changeX = newLeft.x / t.target.scaleX - left;
    var newWidth = width - changeX;
    if ((t.target.cropX + changeX) < 0) {
        changeX = -(t.target.cropX);
        newWidth = width + t.target.cropX;
    }
    if (newWidth <= 0) {
        changeX += newWidth;
        newWidth = 0;
    }
    t.target.width = newWidth;
    t.target.setPositionByOrigin(constraint, anchorPoint, t.originY);
    t.target.cropX += changeX; // this can only be between 0 and naturalWidth;
    return true;
}
// @ts-ignore
function cropFromLeftFlig(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'right';
    var width = t.target.width;
    var naturalWidth = t.target.getOriginalElementWidth();
    var left = -(width / 2);
    var centerPoint = t.target.getRelativeCenterPoint();
    var newLeft = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var constraint = t.target.translateToOriginPoint(centerPoint, anchorPoint, t.originY);
    var newWidth = width - (newLeft.x / t.target.scaleX - left);
    if (newWidth + t.target.cropX > naturalWidth) {
        newWidth = naturalWidth - t.target.cropX;
    }
    if (newWidth < 0) {
        newWidth = 0;
    }
    t.target.width = newWidth;
    t.target.setPositionByOrigin(constraint, anchorPoint, t.originY);
    return true;
}
/**
 * Crops image dragging right to left.
 * @private
 * @param {Object} eventData
 * @param {Number} x pointer's x coordinate
 * @param {Number} y pointer's y coordinate
 * @return {Boolean} true if the cropping occurred
 */
// @ts-ignore
function cropFromRight(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'left';
    var width = t.target.width;
    var naturalWidth = t.target.getOriginalElementWidth();
    var right = width / 2;
    var centerPoint = t.target.getRelativeCenterPoint();
    var newRight = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var constraint = t.target.translateToOriginPoint(centerPoint, anchorPoint, t.originY);
    var newWidth = width - (right - newRight.x / t.target.scaleX);
    if (newWidth + t.target.cropX > naturalWidth) {
        newWidth = naturalWidth - t.target.cropX;
    }
    if (newWidth < 0) {
        newWidth = 0;
    }
    t.target.width = newWidth;
    t.target.setPositionByOrigin(constraint, anchorPoint, t.originY);
    return true;
}
// @ts-ignore
function cropFromRightFlig(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'left';
    var width = t.target.width;
    var right = width / 2;
    var centerPoint = t.target.getRelativeCenterPoint();
    // const newRight = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var newRight = fabric.controlsUtils.getLocalPoint(transform, 'center', 'center', x, y);
    var constraint = t.target.translateToOriginPoint(centerPoint, anchorPoint, t.originY);
    var changeX = right - newRight.x / t.target.scaleX;
    var newWidth = width - changeX;
    if ((t.target.cropX + changeX) < 0) {
        changeX = -(t.target.cropX);
        newWidth = width + t.target.cropX;
    }
    if (newWidth <= 0) {
        changeX += newWidth;
        newWidth = 0;
    }
    t.target.width = newWidth;
    t.target.setPositionByOrigin(constraint, anchorPoint, t.originY);
    t.target.cropX += changeX; // this can only be between 0 and naturalWidth;
    return true;
}
/**
 * Crops image dragging top to bottom.
 * @private
 * @param {Object} eventData
 * @param {Number} x pointer's x coordinate
 * @param {Number} y pointer's y coordinate
 * @return {Boolean} true if the scaling occurred
 */
// @ts-ignore
function cropFromTop(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'bottom';
    var height = t.target.height;
    var top = -(height / 2);
    var centerPoint = t.target.getRelativeCenterPoint();
    // const newTop = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var newTop = fabric.controlsUtils.getLocalPoint(transform, 'center', 'center', x, y);
    var constraint = t.target.translateToOriginPoint(centerPoint, t.originX, anchorPoint);
    var changeY = newTop.y / t.target.scaleY - top;
    var newHeight = height - changeY;
    if ((t.target.cropY + changeY) < 0) {
        changeY = -(t.target.cropY);
        newHeight = height + t.target.cropY;
    }
    if (newHeight <= 0) {
        changeY += newHeight;
        newHeight = 0;
    }
    t.target.height = newHeight;
    t.target.setPositionByOrigin(constraint, t.originX, anchorPoint);
    t.target.cropY += changeY;
    return true;
}
// @ts-ignore
function cropFromTopFlig(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'bottom';
    var height = t.target.height;
    var naturalHeight = t.target.getOriginalElementHeight();
    var top = -(height / 2);
    var centerPoint = t.target.getRelativeCenterPoint();
    // const newTop = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var newTop = fabric.controlsUtils.getLocalPoint(transform, 'center', 'center', x, y);
    var constraint = t.target.translateToOriginPoint(centerPoint, t.originX, anchorPoint);
    var newHeight = height - (newTop.y / t.target.scaleY - top);
    if (newHeight + t.target.cropY > naturalHeight) {
        newHeight = naturalHeight - t.target.cropY;
    }
    if (newHeight < 0) {
        newHeight = 0;
    }
    t.target.height = newHeight;
    t.target.setPositionByOrigin(constraint, t.originX, anchorPoint);
    return true;
}
/**
 * Crops image dragging bottom to top.
 * @private
 * @param {Object} eventData
 * @param {Number} x pointer's x coordinate
 * @param {Number} y pointer's y coordinate
 * @return {Boolean} true if the scaling occurred
 */
// @ts-ignore
function cropFromBottom(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'top';
    var height = t.target.height;
    var naturalHeight = t.target.getOriginalElementHeight();
    var bottom = height / 2;
    var centerPoint = t.target.getRelativeCenterPoint();
    // const newBottom = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var newBottom = fabric.controlsUtils.getLocalPoint(transform, 'center', 'center', x, y);
    var constraint = t.target.translateToOriginPoint(centerPoint, t.originX, anchorPoint);
    var newHeight = height - (bottom - newBottom.y / t.target.scaleY);
    if (newHeight + t.target.cropY > naturalHeight) {
        newHeight = naturalHeight - t.target.cropY;
    }
    if (newHeight < 0) {
        newHeight = 0;
    }
    t.target.height = newHeight;
    t.target.setPositionByOrigin(constraint, t.originX, anchorPoint);
    return true;
}
// @ts-ignore
function cropFromBottomFlig(eventData, transform, x, y) {
    var t = transform;
    var anchorPoint = 'top';
    var height = t.target.height;
    var bottom = height / 2;
    var centerPoint = t.target.getRelativeCenterPoint();
    // const newBottom = normalizePoint(t.target, new fabric.Point(x, y), 'center', 'center');
    var newBottom = fabric.controlsUtils.getLocalPoint(transform, 'center', 'center', x, y);
    var constraint = t.target.translateToOriginPoint(centerPoint, t.originX, anchorPoint);
    var changeY = bottom - newBottom.y / t.target.scaleY;
    var newHeight = height - changeY;
    if ((t.target.cropY + changeY) < 0) {
        changeY = -(t.target.cropY);
        newHeight = height + t.target.cropY;
    }
    if (newHeight <= 0) {
        changeY += newHeight;
        newHeight = 0;
    }
    t.target.height = newHeight;
    t.target.setPositionByOrigin(constraint, t.originX, anchorPoint);
    t.target.cropY += changeY;
    return true;
}
// @ts-ignore
var withReadapatingTheShape = function (handler) { return function (eventData, transform, x, y) {
    var returned = handler(eventData, transform, x, y);
    return returned;
}; };
// @ts-ignore
var cropFromTopLeft = withReadapatingTheShape(function (eventData, transform, x, y) {
    var target = transform.target;
    var left = target.flipX ? cropFromLeftFlig(eventData, transform, x, y) : cropFromLeft(eventData, transform, x, y);
    var top = target.flipY ? cropFromTopFlig(eventData, transform, x, y) : cropFromTop(eventData, transform, x, y);
    return left || top;
});
// @ts-ignore
var cropFromBottomRight = withReadapatingTheShape(function (eventData, transform, x, y) {
    var target = transform.target;
    var right = target.flipX ? cropFromRightFlig(eventData, transform, x, y) : cropFromRight(eventData, transform, x, y);
    var bottom = target.flipY ? cropFromBottomFlig(eventData, transform, x, y) : cropFromBottom(eventData, transform, x, y);
    return right || bottom;
});
// @ts-ignore
var cropFromBottomLeft = withReadapatingTheShape(function (eventData, transform, x, y) {
    var target = transform.target;
    var left = target.flipX ? cropFromLeftFlig(eventData, transform, x, y) : cropFromLeft(eventData, transform, x, y);
    var bottom = target.flipY ? cropFromBottomFlig(eventData, transform, x, y) : cropFromBottom(eventData, transform, x, y);
    return left || bottom;
});
// @ts-ignore
var cropFromTopRight = withReadapatingTheShape(function (eventData, transform, x, y) {
    var target = transform.target;
    var right = target.flipX ? cropFromRightFlig(eventData, transform, x, y) : cropFromRight(eventData, transform, x, y);
    var top = target.flipY ? cropFromTopFlig(eventData, transform, x, y) : cropFromTop(eventData, transform, x, y);
    return right || top;
});
// @ts-ignore
function imageCornerTL(dim, finalMatrix, fabricObject /* currentControl */) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var point = {
        x: (-fabricObject.width / 2 - fabricObject.cropX),
        y: (-fabricObject.height / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function imageCornerTR(dim, finalMatrix, fabricObject /* currentControl */) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullWidth = fabricObject.getOriginalElementWidth();
    var point = {
        x: (fullWidth - fabricObject.width / 2 - fabricObject.cropX),
        y: (-fabricObject.height / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function imageCornerBR(dim, finalMatrix, fabricObject /* currentControl */) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullWidth = fabricObject.getOriginalElementWidth();
    var fullHeight = fabricObject.getOriginalElementHeight();
    var point = {
        x: (fullWidth - fabricObject.width / 2 - fabricObject.cropX),
        y: (fullHeight - fabricObject.height / 2 - fabricObject.cropY),
    };
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function imageCornerBL(dim, finalMatrix, fabricObject /* currentControl */) {
    var matrix = fabricObject.calcTransformMatrix();
    var vpt = fabricObject.getViewportTransform();
    var _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
    var fullHeight = fabricObject.getOriginalElementHeight();
    var point = {
        x: (-fabricObject.width / 2 - fabricObject.cropX),
        y: (fullHeight - fabricObject.height / 2 - fabricObject.cropY),
    };
    // @ts-ignore
    return fabric.util.transformPoint(point, _finalMatrix);
}
// @ts-ignore
function scaleEquallyCropTR(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderY = fullHeight - target.height - target.cropY;
    var anchorOriginX = target.cropX / target.width;
    var anchorOriginY = remainderY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, 1 + anchorOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, 1 + anchorOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, -anchorOriginX, 1 + anchorOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newRemainderY = remainderY / scaleChangeY;
    var newCropX = target.cropX / scaleChangeX;
    var newCropY = fullHeight - newHeight - newRemainderY;
    if (newCropX + newWidth > fullWidth || newRemainderY + newHeight > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
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
// @ts-ignore
function scaleEquallyCropTRFlig(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderX = fullWidth - target.width - target.cropX;
    var anchorOriginX = remainderX / target.width;
    var anchorOriginY = target.cropY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, 1 + anchorOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, 1 + anchorOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, -anchorOriginX, 1 + anchorOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = target.cropY / scaleChangeY;
    if (newWidth + remainderX > fullWidth || newHeight + newCropY > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
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
    target.setPositionByOrigin(constraint, -newAnchorOriginX, 1 + newAnchorOriginY);
    return true;
}
// @ts-ignore
function scaleEquallyCropBR(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var extraOriginX = target.cropX / target.width;
    var extraOriginY = target.cropY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -extraOriginX, -extraOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), -extraOriginX, -extraOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, -extraOriginX, -extraOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = target.cropX / scaleChangeX;
    var newCropY = target.cropY / scaleChangeY;
    if (newCropX + newWidth > fullWidth || newCropY + newHeight > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
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
// @ts-ignore
function scaleEquallyCropBRFlig(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderX = fullWidth - target.width - target.cropX;
    var remainderY = fullHeight - target.height - target.cropY;
    var anchorOriginX = remainderX / target.width;
    var anchorOriginY = remainderY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, -anchorOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, -anchorOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, -anchorOriginX, -anchorOriginY, x, y);
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var scaledRemainderY = remainderY / scaleChangeY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = fullHeight - newHeight - scaledRemainderY;
    if (newWidth + scaledRemainderX > fullWidth || newHeight + scaledRemainderY > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
    target.width = newWidth;
    target.height = newHeight;
    target.cropX = newCropX;
    target.cropY = newCropY;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
        target.clippingPath.scaleY /= scaleChangeY;
    }
    var newAnchorOriginX = scaledRemainderX / newWidth;
    var newAnchorOriginY = scaledRemainderY / newHeight;
    target.setPositionByOrigin(constraint, -newAnchorOriginX, -newAnchorOriginY);
    return true;
}
// @ts-ignore
function scaleEquallyCropBL(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderX = fullWidth - target.width - target.cropX;
    var anchorOriginX = remainderX / target.width;
    var anchorOriginY = target.cropY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, 1 + anchorOriginX, -anchorOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), 1 + anchorOriginX, -anchorOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, 1 + anchorOriginX, -anchorOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = target.cropY / scaleChangeY;
    if (newWidth + remainderX > fullWidth || newHeight + newCropY > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
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
// @ts-ignore
function scaleEquallyCropBLFlig(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderY = fullHeight - target.height - target.cropY;
    var anchorOriginX = target.cropX / target.width;
    var anchorOriginY = remainderY / target.height;
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, 1 + anchorOriginX, -anchorOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), 1 + anchorOriginX, -anchorOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, 1 + anchorOriginX, -anchorOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newRemainderY = remainderY / scaleChangeY;
    var newCropX = target.cropX / scaleChangeX;
    var newCropY = fullHeight - newHeight - newRemainderY;
    if (newCropX + newWidth > fullWidth || newRemainderY + newHeight > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
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
    target.setPositionByOrigin(constraint, 1 + newExtraAnchorX, -newExtraAnchorY);
    return true;
}
// @ts-ignore
function scaleEquallyCropTL(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var remainderX = fullWidth - target.width - target.cropX;
    var remainderY = fullHeight - target.height - target.cropY;
    var anchorOriginX = 1 + (remainderX / target.width);
    var anchorOriginY = 1 + (remainderY / target.height);
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, anchorOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, anchorOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, anchorOriginX, anchorOriginY, x, y);
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var scaledRemainderX = remainderX / scaleChangeX;
    var scaledRemainderY = remainderY / scaleChangeY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = fullWidth - newWidth - scaledRemainderX;
    var newCropY = fullHeight - newHeight - scaledRemainderY;
    if (newWidth + scaledRemainderX > fullWidth || newHeight + scaledRemainderY > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
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
    console.log(target, 'target');
    return true;
}
// @ts-ignore
function scaleEquallyCropTLFlig(eventData, transform, x, y) {
    var target = transform.target;
    var fullWidth = target.getOriginalElementWidth();
    var fullHeight = target.getOriginalElementHeight();
    var extraOriginX = 1 + (target.cropX / target.width);
    var extraOriginY = 1 + (target.cropY / target.height);
    var centerPoint = target.getRelativeCenterPoint();
    var constraint = target.translateToOriginPoint(centerPoint, extraOriginX, extraOriginY);
    // const newPoint = normalizePoint(target, new fabric.Point(x, y), extraOriginX, extraOriginY);
    var newPoint = fabric.controlsUtils.getLocalPoint(transform, extraOriginX, extraOriginY, x, y);
    var oldScaleX = target.scaleX;
    var oldScaleY = target.scaleY;
    var scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
    var scaleChangeX = scale / oldScaleX;
    var scaleChangeY = scale / oldScaleY;
    var newWidth = target.width / scaleChangeX;
    var newHeight = target.height / scaleChangeY;
    var newCropX = target.cropX / scaleChangeX;
    var newCropY = target.cropY / scaleChangeY;
    if (newCropX + newWidth > fullWidth || newCropY + newHeight > fullHeight) {
        return false;
    }
    target.scaleX = scale;
    target.scaleY = scale;
    target.height = newHeight;
    target.width = newWidth;
    target.cropX = newCropX;
    target.cropY = newCropY;
    if (target.clippingPath) {
        target.clippingPath.scaleX /= scaleChangeX;
        target.clippingPath.scaleY /= scaleChangeY;
    }
    var newExtraOriginX = 1 + (target.cropX / target.width);
    var newExtraOriginY = 1 + (target.cropY / target.height);
    target.setPositionByOrigin(constraint, newExtraOriginX, newExtraOriginY);
    return true;
}
export { cropFromTopRight, cropFromBottomLeft, cropFromBottomRight, cropFromTopLeft, cropFromLeft, cropFromLeftFlig, cropFromRight, cropFromRightFlig, cropFromTop, cropFromTopFlig, cropFromBottom, cropFromBottomFlig, imageCornerTL, imageCornerBR, imageCornerBL, imageCornerTR, scaleEquallyCropTR, scaleEquallyCropBR, scaleEquallyCropBL, scaleEquallyCropTL, scaleEquallyCropTLFlig, scaleEquallyCropBRFlig, scaleEquallyCropTRFlig, scaleEquallyCropBLFlig, };
