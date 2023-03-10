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
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const { clippingPath } = fabricObject;
  const dx = (-clippingPath.width * clippingPath.scaleX  / 2 - fabricObject.cropX);
  const dy = (-clippingPath.height * clippingPath.scaleY / 2 - fabricObject.cropY);
  const point = {
    x: dx,
    y: dy,
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerTR(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.getOriginalElementWidth();
  const { clippingPath } = fabricObject;
  const dx = (fullWidth * clippingPath.scaleX - clippingPath.width * clippingPath.scaleX / 2 - fabricObject.cropX);
  const dy = (-clippingPath.height * clippingPath.scaleY / 2 - fabricObject.cropY);
  const point = {
    x: dx,
    y: dy,
  }
  return fabric.util.transformPoint(point, _finalMatrix);

}

// @ts-ignore
function cornerML(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullHeight = fabricObject.getOriginalElementHeight();
  const { clippingPath } = fabricObject;
  const dx = (-clippingPath.width * clippingPath.scaleX / 2 - fabricObject.cropX);
  const dy = (fullHeight * clippingPath.scaleY / 2 - clippingPath.height * clippingPath.scaleY / 2 - fabricObject.cropY);
  const point = {
    x: dx,
    y: dy,
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerMR(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.getOriginalElementWidth();
  const fullHeight = fabricObject.getOriginalElementHeight();
  const { clippingPath } = fabricObject;
  const dx = (fullWidth * clippingPath.scaleX - clippingPath.width * clippingPath.scaleX / 2 - fabricObject.cropX);
  const dy = (fullHeight * clippingPath.scaleY / 2 - clippingPath.height * clippingPath.scaleY / 2 - fabricObject.cropY);
  const point = {
    x: dx,
    y: dy,
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerBR(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.getOriginalElementWidth();
  const fullHeight = fabricObject.getOriginalElementHeight();
  const { clippingPath } = fabricObject;
  const dx = (fullWidth * clippingPath.scaleX - clippingPath.width * clippingPath.scaleX / 2 - fabricObject.cropX);
  const dy = (fullHeight * clippingPath.scaleY - clippingPath.height * clippingPath.scaleY / 2 - fabricObject.cropY);
  const point = {
    x: dx,
    y: dy,
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function cornerBL(dim, finalMatrix, fabricObject) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullHeight = fabricObject.getOriginalElementHeight();
  const { clippingPath } = fabricObject;
  const dx = (-clippingPath.width * clippingPath.scaleX / 2 - fabricObject.cropX);
  const dy = (fullHeight * clippingPath.scaleY - clippingPath.height * clippingPath.scaleY / 2 - fabricObject.cropY);
  const point = {
    x: dx,
    y: dy,
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
  const target = transform.target,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target),
    forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let newPoint, scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }

  // @ts-ignore
  const centerPoint = target.clippingPath.getRelativeCenterPoint();
  // @ts-ignore
  const constraint = target.clippingPath.translateToOriginPoint(centerPoint, transform.originX, transform.originY);
  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
    // newPoint = normalizePoint(target.pattern, new fabric.Point(x, y), transform.originX, transform.originY);
    // newPoint = getPatternLocalPoint(transform, transform.originX, transform.originY, x, y);
    // @ts-ignore
    newPoint = normalizePoint(target.clippingPath, new fabric.Point(x, y), transform.originX, transform.originY);
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
    // @ts-ignore
    dim = target.clippingPath._getTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        // { original } = transform,
        originalDistance =
          // @ts-ignore
          Math.abs((dim.x * original.clippingPath.scaleX) / target.clippingPath.scaleX) +
          // @ts-ignore
          Math.abs((dim.y * original.clippingPath.scaleY) / target.clippingPath.scaleY),
        scale = distance / originalDistance;
      // @ts-ignore
      scaleX = original.clippingPath.scaleX * scale;
      // @ts-ignore
      scaleY = original.clippingPath.scaleY * scale;
    } else {
      // @ts-ignore
      scaleX = Math.abs((newPoint.x * target.clippingPath.scaleX) / dim.x);
      // @ts-ignore
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
  // @ts-ignore
  const oldScaleX = target.clippingPath.scaleX;
  // @ts-ignore
  const oldScaleY = target.clippingPath.scaleY;

  const corner = target.__corner;
  const originClippingPath = transform.original.clippingPath;
  let lockMinScaleY = false;
  let lockMinScaleX = false;

  // @ts-ignore
  if (corner && originClippingPath && originClippingPath.minScale && originClippingPath.minScale[corner]) {
    // @ts-ignore
    const scale = originClippingPath.minScale[corner];
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
    // @ts-ignore
    !isLocked(target, 'lockScalingX') && !lockMinScaleY && target.clippingPath.set('scaleX', scaleX);
    // @ts-ignore
    !isLocked(target, 'lockScalingY') && !lockMinScaleX && target.clippingPath.set('scaleY', scaleY);
  } else {
    // forbidden cases already handled on top here.
    // @ts-ignore
    by === 'x' && target.clippingPath.set('scaleX', scaleX);
    // @ts-ignore
    by === 'y' && target.clippingPath.set('scaleY', scaleY);
  }

  const scaleChangeX = scaleX - oldScaleX;
  const scaleChangeY = scaleY - oldScaleY;
  // @ts-ignore
  const w = target.clippingPath.width * scaleChangeX *2;
  // @ts-ignore
  const h = target.clippingPath.height * scaleChangeY * 2;

  // @ts-ignore
  target.clippingPath.setPositionByOrigin(constraint, transform.originX, transform.originY);
  // @ts-ignore
  const centerClippingPath = target.clippingPath.getRelativeCenterPoint();
  const center = {
    // @ts-ignore
    x: original.clippingPath.center.x - centerClippingPath.x,
    // @ts-ignore
    y: original.clippingPath.center.y - centerClippingPath.y,
  };
  const angleRadians = fabric.util.degreesToRadians(-target.angle);
  const pointCenter = new fabric.Point(center.x, center.y);
  const point = fabric.util.rotateVector(pointCenter, angleRadians);
  // @ts-ignore
  target.cropX = original.cropX + point.x;
  // @ts-ignore
  target.cropY = original.cropY + point.y;

  // const widthPattern = target.pattern.getScaledWidth();
  // const heightPattern = target.pattern.getScaledHeight();
  // const widthText = target.getScaledWidth();
  // const heightText = target.getScaledHeight();
  // if (widthText >= heightText) {
  //   target.pattern.scaleFactor = widthPattern / widthText;
  // } else {
  //   target.pattern.scaleFactor = heightPattern / heightText;
  // }

  // @ts-ignore
  return oldScaleX !== target.clippingPath.scaleX || oldScaleY !== target.clippingPath.scaleY;
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
  editClippingTextHandler,
  fireClippingTextEvent,
};
