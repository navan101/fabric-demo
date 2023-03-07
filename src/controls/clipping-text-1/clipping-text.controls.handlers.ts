import * as fabric from 'fabric';
import { invertOrigin, isLocked, isTransformCentered, normalizePoint } from '../util';
import { TAxis } from '../../typedefs';
import { TPointerEvent, Transform } from '../../EventTypeDefs';
import { calcScale } from '../cropping/cropping.controls.handlers';

// @ts-ignore
const { wrapWithFireEvent } = fabric.controlsUtils;

type ScaleTransform = Transform & {
  gestureScale?: number;
  signX?: number;
  signY?: number;
};

type ScaleBy = TAxis | 'equally' | '' | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fireClippingTextEvent(target: fabric.Object, fnName?: string) {
  // console.log(fnName, '====fireClippingTextEvent====');
  target.canvas?.fire(<any>'clippingtext:update', {
    action: 'clippingText',
    target,
  });
}

// @ts-ignore
function scaleIsProportional(eventData, fabricObject) {
  const { canvas } = fabricObject; const { uniScaleKey } = canvas;
  const uniformIsToggled = eventData[uniScaleKey];
  return (canvas.uniformScaling && !uniformIsToggled)
    || (!canvas.uniformScaling && uniformIsToggled);
}

// @ts-ignore
function scalingIsForbidden(fabricObject, by, scaleProportionally) {
  const lockX = fabricObject.lockScalingX; const
    lockY = fabricObject.lockScalingY;
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
  const { target } = transform;
  const control = target.controls[transform.corner];
  const zoom = target.canvas.getZoom();
  const padding = target.padding / zoom;
  // const localPoint = target.pattern.toLocalPoint(new fabric.Point(x, y), originX, originY);
  const localPoint = normalizePoint(target.clippingPath, new fabric.Point(x, y), originX, originY);
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

  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const point = {
    x: (fabricObject.cropX - fabricObject.width / 2),
    y: -(fabricObject.height / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerTR(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
  const point = {
    // eslint-disable-next-line max-len
    x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    y: (-fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
  }
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
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
  const point = {
    x: (-fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    // eslint-disable-next-line max-len
    y: (fullHeight * fabricObject.clippingPath.scaleY / 2 - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerMR(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
  const fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
  const point = {
    // eslint-disable-next-line max-len
    x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    // eslint-disable-next-line max-len
    y: (fullHeight * fabricObject.clippingPath.scaleY / 2 - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerBR(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.clippingPath.getOriginalElementWidth();
  const fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
  const point = {
    // eslint-disable-next-line max-len
    x: (fullWidth * fabricObject.clippingPath.scaleX - fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    // eslint-disable-next-line max-len
    y: (fullHeight * fabricObject.clippingPath.scaleY - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerBL(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullHeight = fabricObject.clippingPath.getOriginalElementHeight();
  const point = {
    x: (-fabricObject.clippingPath.width * fabricObject.clippingPath.scaleX / 2 - fabricObject.cropX),
    // eslint-disable-next-line max-len
    y: (fullHeight * fabricObject.clippingPath.scaleY - fabricObject.clippingPath.height * fabricObject.clippingPath.scaleY / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

function scaleEquallyCrop(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
) {
  return scaleObjectCrop(eventData, transform, x, y);
}

function scalingXCrop(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
) {
  return scaleObjectCrop(eventData, transform, x, y, { by: 'x' });
}

function scaleObjectCrop(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target),
    forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let newPoint, scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }
  const centerPoint = target.clippingPath.getRelativeCenterPoint();
  const constraint = target.clippingPath.translateToOriginPoint(centerPoint, transform.originX, transform.originY);
  const centerPointText = target.clippingPath.getRelativeCenterPoint();
  const constraintText = target.clippingPath.translateToOriginPoint(centerPointText, transform.originX, transform.originY);
  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
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

    if (
      isLocked(target, 'lockScalingFlip') &&
      (transform.signX !== signX || transform.signY !== signY)
    ) {
      return false;
    }

    dim = target.clippingPath._getTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        // { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.clippingPath?.scaleX) / target.clippingPath.scaleX) +
          Math.abs((dim.y * original.clippingPath?.scaleY) / target.clippingPath.scaleY),
        scale = distance / originalDistance;
      scaleX = original.clippingPath?.scaleX * scale;
      scaleY = original.clippingPath?.scaleY * scale;
    } else {
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
  const oldScaleX = target.clippingPath.scaleX;
  const oldScaleY = target.clippingPath.scaleY;

  const corner = target.__corner;
  const originPattern = transform.original.clippingPath;
  let lockMinScaleY = false;
  let lockMinScaleX = false;

  // @ts-ignore
  if (corner && originPattern && originPattern.minScale && originPattern.minScale[corner]) {
    // @ts-ignore
    const scale = originPattern.minScale[corner];
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
  } else {
    // forbidden cases already handled on top here.
    by === 'x' && target.clippingPath.set('scaleX', scaleX);
    by === 'y' && target.clippingPath.set('scaleY', scaleY);
  }

  target.clippingPath.setPositionByOrigin(constraint, transform.originX, transform.originY);
  // target.setPositionByOrigin(constraintText, transform.originX, transform.originY);
  const centerPattern = target.clippingPath.getRelativeCenterPoint();
  const center = {
    x: original.clippingPath?.center.x - centerPattern.x,
    y: original.clippingPath?.center.y - centerPattern.y,
  };
  const angleRadians = fabric.util.degreesToRadians(-target.angle);
  const pointCenter = new fabric.Point(center.x, center.y);
  const point = fabric.util.rotateVector(pointCenter, angleRadians);
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
  const { target } = transform;
  const fullWidth = target.clippingPath.getOriginalElementWidth();
  const fullHeight = target.clippingPath.getOriginalElementHeight();
  const remainderX = fullWidth - target.clippingPath.width - target.cropX;
  const remainderY = fullHeight - target.clippingPath.height - target.cropY;
  const anchorOriginX = 1 + (remainderX / target.clippingPath.width);
  const anchorOriginY = 1 + (remainderY / target.clippingPath.height);
  const centerPoint = target.clippingPath.getRelativeCenterPoint();
  const constraint = target.clippingPath.translateToOriginPoint(centerPoint, transform.originX, transform.originY);
  const newPoint = normalizePoint(target.clippingPath, new fabric.Point(x, y), transform.originX, transform.originY);
  // const newPoint = fabric.controlsUtils.getLocalPoint(transform, transform.originX, transform.originY, x, y);
  const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
  const oldScaleX = target.clippingPath.scaleX;
  const oldScaleY = target.clippingPath.scaleY;
  const scaleChangeX = scale / oldScaleX;
  const scaleChangeY = scale / oldScaleY;
  const scaledRemainderX = remainderX / scaleChangeX;
  const scaledRemainderY = remainderY / scaleChangeY;
  const newWidth = target.clippingPath.width / scaleChangeX;
  const newHeight = target.clippingPath.height / scaleChangeY;
  const newCropX = fullWidth - newWidth - scaledRemainderX;
  const newCropY = fullHeight - newHeight - scaledRemainderY;

  if (newWidth + scaledRemainderX > fullWidth || newHeight + scaledRemainderY > fullHeight) {
    return false;
  }

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
  // const newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
  // const newAnchorOriginY = 1 + (scaledRemainderY / newHeight);
  target.clippingPath.setPositionByOrigin(constraint, transform.originX, transform.originY);
  // target.clippingPath.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
  return true;
}

function editClippingTextHandler(eventData: any, transform: any) {
  const { target } = transform;
  // target.isClipping = true;
  target.set('isClipping', true);
  fireClippingTextEvent(target, 'editClippingTextHandler');
  return true;
}



export {
  cornerTL,
  cornerTR,
  cornerML,
  cornerMR,
  cornerBR,
  cornerBL,
  scalingXCrop,
  scaleEquallyCrop,
  scaleEquallyCropTL,
  editClippingTextHandler,
  fireClippingTextEvent,
};