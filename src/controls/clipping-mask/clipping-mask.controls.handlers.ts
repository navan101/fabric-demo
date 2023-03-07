// import { CorjlObject } from '../types';

import * as fabric from 'fabric';
import { TAxis } from '../../typedefs';
import { TPointerEvent, Transform, TransformActionHandler } from '../../EventTypeDefs';
import { invertOrigin, isLocked, isTransformCentered, normalizePoint } from '../../controls/util';
import { calcScale } from '../../controls/cropping/cropping.controls.handlers';

function fireClippingMaskEvent(target: fabric.Object) {
  target.canvas?.fire(<any>'clipping:update', {
    action: 'clippingMask',
    target,
  });
}

function editClippingMaskHandler(eventData: any, transform: any) {
  const { target } = transform;
  target.isClipping = true;
  return true;
}

function uploadImageHandler(eventData: any, transform: any) {
  const { target } = transform;
  const input = document.createElement('input');
  input.style.display = 'none';
  input.type = 'file';
  input.accept = 'image/jpeg,image/png';
  document.body.appendChild(input);
  input.onchange = (event: any) => {
    if (!input.files?.length) {
      return;
    }
    const src = URL.createObjectURL(event.target.files[0]);
    target.canvas.fire('object:upload', {
      e: eventData, target, transform, src,
    });
    input.remove();
  };
  input.click();
  target.canvas.__onMouseUp(eventData);
  document.body.onfocus = (event) => {
    const elementTarget = event.target;
    if (input !== elementTarget || !input.files?.length) {
      input.remove();
    }
  };
  return false;
}

type ScaleTransform = Transform & {
  gestureScale?: number;
  signX?: number;
  signY?: number;
};

type ScaleBy = TAxis | 'equally' | '' | undefined;

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

function scaleEquallyCrop(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
) {
  const corner = transform.corner;
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

function scalingXCrop(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
) {
  const corner = transform.corner;
  if (corner === 'mlS') {
    return scaleObjectCropML(eventData, transform, x, y, { by: 'x' });
  }
  if (corner === 'mrS') {
    return scaleObjectCropMR(eventData, transform, x, y, { by: 'x' });
  }
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

function scaleObjectCropTL1(
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

  const fullWidth = target.getOriginalElementWidth();
  const fullHeight = target.getOriginalElementHeight();
  const remainderX = fullWidth - target.width - target.cropX;
  const remainderY = fullHeight - target.height - target.cropY;
  const anchorOriginX = 1 + (remainderX / target.width);
  const anchorOriginY = 1 + (remainderY / target.height);

  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, anchorOriginY);

  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
    newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, anchorOriginY);
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

    dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.scaleX) / target.scaleX) +
          Math.abs((dim.y * original.scaleY) / target.scaleY),
        scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
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
  const oldScaleX = target.scaleX;
  const oldScaleY = target.scaleY;

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

  const scaleChangeX = scaleX / oldScaleX;
  const scaleChangeY = scaleY / oldScaleY;
  const scaledRemainderX = remainderX / scaleChangeX;
  const scaledRemainderY = remainderY / scaleChangeY;
  const newWidth = target.width / scaleChangeX;
  const newHeight = target.height / scaleChangeY;
  const newCropX = fullWidth - newWidth - scaledRemainderX;
  const newCropY = fullHeight - newHeight - scaledRemainderY;

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

  const newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
  const newAnchorOriginY = 1 + (scaledRemainderY / newHeight);

  target.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
  return oldScaleX !== target.scaleX || oldScaleY !== target.scaleY;
}

function scaleObjectCropTL(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);
  const forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let newPoint, scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }

  const fullWidth = target.getOriginalElementWidth();
  const fullHeight = target.getOriginalElementHeight();
  const remainderX = fullWidth - target.width - target.cropX;
  const remainderY = fullHeight - target.height - target.cropY;
  const anchorOriginX = 1 + (remainderX / target.width);
  const anchorOriginY = 1 + (remainderY / target.height);
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, anchorOriginY);

  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
    newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, anchorOriginY);
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

    dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.scaleX) / target.scaleX) +
          Math.abs((dim.y * original.scaleY) / target.scaleY),
        scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
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

  const oldScaleX = target.scaleX;
  const oldScaleY = target.scaleY;
  const scaleChangeX = scaleX / oldScaleX;
  const scaleChangeY = scaleY / oldScaleY;
  const scaledRemainderX = remainderX / scaleChangeX;
  const scaledRemainderY = remainderY / scaleChangeY;
  const newWidth = target.width / scaleChangeX;
  const newHeight = target.height / scaleChangeY;
  const newCropX = fullWidth - newWidth - scaledRemainderX;
  const newCropY = fullHeight - newHeight - scaledRemainderY;

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
  const newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
  const newAnchorOriginY = 1 + (scaledRemainderY / newHeight);
  target.setPositionByOrigin(constraint, newAnchorOriginX, newAnchorOriginY);
  return true;
}

function scaleObjectCropTR(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);

  const fullWidth = target.getOriginalElementWidth();
  const fullHeight = target.getOriginalElementHeight();
  const remainderY = fullHeight - target.height - target.cropY;
  const anchorOriginX = target.cropX / target.width;
  const anchorOriginY = remainderY / target.height;
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, 1 + anchorOriginY);
  const newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, 1 + anchorOriginY);
  // const newPoint = fabric.controlsUtils.getLocalPoint(transform, -anchorOriginX, 1 + anchorOriginY, x, y);
  const oldScaleX = target.scaleX;
  const oldScaleY = target.scaleY;
  let scaleX, scaleY, signX, signY;
  const dim = target._getOriginalTransformedDimensions();
  // missing detection of flip and logic to switch the origin
  if (scaleProportionally && !by) {
    // uniform scaling
    const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
      { original } = transform,
      originalDistance =
        Math.abs((dim.x * original.scaleX) / target.scaleX) +
        Math.abs((dim.y * original.scaleY) / target.scaleY),
      scale = distance / originalDistance;
    scaleX = original.scaleX * scale;
    scaleY = original.scaleY * scale;
  } else {
    scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
    scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
  }
  // const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
  const scaleChangeX = scaleX / oldScaleX;
  const scaleChangeY = scaleY / oldScaleY;
  const newWidth = target.width / scaleChangeX;
  const newHeight = target.height / scaleChangeY;
  const newRemainderY = remainderY / scaleChangeY;
  const newCropX = target.cropX / scaleChangeX;
  const newCropY = fullHeight - newHeight - newRemainderY;

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
  const newExtraAnchorY = newRemainderY / target.height;
  const newExtraAnchorX = target.cropX / target.width;
  target.setPositionByOrigin(constraint, -newExtraAnchorX, 1 + newExtraAnchorY);

  return true;
}

function scaleObjectCropBR(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);

  const fullWidth = target.getOriginalElementWidth();
  const fullHeight = target.getOriginalElementHeight();
  const extraOriginX = target.cropX / target.width;
  const extraOriginY = target.cropY / target.height;
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, -extraOriginX, -extraOriginY);
  const newPoint = normalizePoint(target, new fabric.Point(x, y), -extraOriginX, -extraOriginY);

  const oldScaleX = target.scaleX;
  const oldScaleY = target.scaleY;
  let scaleX, scaleY, signX, signY;
  const dim = target._getOriginalTransformedDimensions();
  // missing detection of flip and logic to switch the origin
  if (scaleProportionally && !by) {
    // uniform scaling
    const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
      { original } = transform,
      originalDistance =
        Math.abs((dim.x * original.scaleX) / target.scaleX) +
        Math.abs((dim.y * original.scaleY) / target.scaleY),
      scale = distance / originalDistance;
    scaleX = original.scaleX * scale;
    scaleY = original.scaleY * scale;
  } else {
    scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
    scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
  }
  // const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
  const scaleChangeX = scaleX / oldScaleX;
  const scaleChangeY = scaleY / oldScaleY;
  const newWidth = target.width / scaleChangeX;
  const newHeight = target.height / scaleChangeY;
  const newCropX = target.cropX / scaleChangeX;
  const newCropY = target.cropY / scaleChangeY;

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
  const newExtraOriginX = target.cropX / target.width;
  const newExtraOriginY = target.cropY / target.height;
  target.setPositionByOrigin(constraint, -newExtraOriginX, -newExtraOriginY);
  return true;
}

function scaleObjectCropBL(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);

  const fullWidth = target.getOriginalElementWidth();
  const fullHeight = target.getOriginalElementHeight();
  const remainderX = fullWidth - target.width - target.cropX;
  const anchorOriginX = remainderX / target.width;
  const anchorOriginY = target.cropY / target.height;
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, 1 + anchorOriginX, -anchorOriginY);
  const newPoint = normalizePoint(target, new fabric.Point(x, y), 1 + anchorOriginX, -anchorOriginY);

  const oldScaleX = target.scaleX;
  const oldScaleY = target.scaleY;
  let scaleX, scaleY, signX, signY;
  const dim = target._getOriginalTransformedDimensions();
  // missing detection of flip and logic to switch the origin
  if (scaleProportionally && !by) {
    // uniform scaling
    const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
      { original } = transform,
      originalDistance =
        Math.abs((dim.x * original.scaleX) / target.scaleX) +
        Math.abs((dim.y * original.scaleY) / target.scaleY),
      scale = distance / originalDistance;
    scaleX = original.scaleX * scale;
    scaleY = original.scaleY * scale;
  } else {
    scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
    scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
  }
  // const scale = calcScale(newPoint, fullHeight, fullWidth, target.flipX, target.flipY);
  const scaleChangeX = scaleX / oldScaleX;
  const scaleChangeY = scaleY / oldScaleY;
  const newWidth = target.width / scaleChangeX;
  const newHeight = target.height / scaleChangeY;
  const scaledRemainderX = remainderX / scaleChangeX;
  const newCropX = fullWidth - newWidth - scaledRemainderX;
  const newCropY = target.cropY / scaleChangeY;

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
  const newAnchorOriginX = scaledRemainderX / newWidth;
  const newAnchorOriginY = newCropY / newHeight;

  target.setPositionByOrigin(constraint, 1 + newAnchorOriginX, -newAnchorOriginY);
  return true;
}

function scaleObjectCropML(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);
  const forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let newPoint, scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }

  const fullWidth = target.getOriginalElementWidth();
  const remainderX = fullWidth - target.width - target.cropX;
  const anchorOriginX = 1 + (remainderX / target.width);
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, transform.originY);

  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
    newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, transform.originY);
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

    dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.scaleX) / target.scaleX) +
          Math.abs((dim.y * original.scaleY) / target.scaleY),
        scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
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

  const oldScaleX = target.scaleX;
  const scaleChangeX = scaleX / oldScaleX;
  const scaledRemainderX = remainderX / scaleChangeX;
  const newWidth = target.width / scaleChangeX;
  const newCropX = fullWidth - newWidth - scaledRemainderX;

  if (newWidth + scaledRemainderX > fullWidth) {
    return false;
  }

  target.scaleX = scaleX;
  target.width = newWidth;
  target.cropX = newCropX;
  if (target.clippingPath) {
    target.clippingPath.scaleX /= scaleChangeX;
  }
  const newAnchorOriginX = 1 + (scaledRemainderX / newWidth);
  target.setPositionByOrigin(constraint, newAnchorOriginX, transform.originY);
  return true;
}

function scaleObjectCropMR(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);
  const forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let newPoint, scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }

  const fullWidth = target.getOriginalElementWidth();
  const anchorOriginX = target.cropX / target.width;
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, transform.originY);

  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
    newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, transform.originY);
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

    dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.scaleX) / target.scaleX) +
          Math.abs((dim.y * original.scaleY) / target.scaleY),
        scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
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

  const oldScaleX = target.scaleX;
  const scaleChangeX = scaleX / oldScaleX;
  const newWidth = target.width / scaleChangeX;
  const newCropX = target.cropX / scaleChangeX;

  if (newCropX + newWidth > fullWidth) {
    return false;
  }

  target.scaleX = scaleX;
  target.width = newWidth;
  target.cropX = newCropX;
  if (target.clippingPath) {
    target.clippingPath.scaleX /= scaleChangeX;
  }
  const newAnchorOriginX = target.cropX / target.width;
  target.setPositionByOrigin(constraint, -newAnchorOriginX, transform.originY);
  return true;
}

// @ts-ignore
function imageCornerML(dim, finalMatrix, fabricObject /* currentControl */) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullHeight = fabricObject.getOriginalElementHeight();
  const point = {
    x: (-fabricObject.width / 2 - fabricObject.cropX),
    y: (fullHeight / 2 - fabricObject.height / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

// @ts-ignore
function imageCornerMR(dim, finalMatrix, fabricObject /* currentControl */) {
  const matrix = fabricObject.calcTransformMatrix();
  const vpt = fabricObject.getViewportTransform();
  const _finalMatrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
  const fullWidth = fabricObject.getOriginalElementWidth();
  const fullHeight = fabricObject.getOriginalElementHeight();
  const sX = (fabricObject.originalScaleX || fabricObject.scaleX);
  const sY = (fabricObject.originalScaleX || fabricObject.scaleX);

  // (this.originalScaleX || this.scaleX)
  const point = {
    x: (fullWidth * sX - fabricObject.width / 2 - fabricObject.cropX),
    y: (fullHeight / 2 - fabricObject.height / 2 - fabricObject.cropY),
  }
  return fabric.util.transformPoint(point, _finalMatrix);
}

function scaleObjectMR(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);
  const forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }

  const fullWidth = target.getOriginalElementWidth();
  const anchorOriginX = target.cropX / target.width;
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, -anchorOriginX, transform.originY);
  const newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, transform.originY);
  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
    // newPoint = normalizePoint(target, new fabric.Point(x, y), -anchorOriginX, transform.originY);
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

    dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.scaleX) / target.scaleX) +
          Math.abs((dim.y * original.scaleY) / target.scaleY),
        scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
      scaleX = Math.abs((newPoint.x * target.scaleX) / dim.x);
      scaleY = Math.abs((newPoint.y * target.scaleY) / dim.y);
      console.log(scaleX, 'scaleX')
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

  const oldScaleX = target.scaleX;
  const scaleChangeX = scaleX / oldScaleX;
  const newWidth = target.width / scaleChangeX;
  const newCropX = target.cropX / scaleChangeX;

  // if (newCropX + newWidth > fullWidth) {
  //   return false;
  // }

  if (
    transform.originX === 'center' ||
    (transform.originX === 'right' && newPoint.x < 0) ||
    (transform.originX === 'left' && newPoint.x > 0)
  ) {
    const { target } = transform,
      strokePadding =
        target.strokeWidth / (target.strokeUniform ? target.scaleX : 1),
      multiplier = isTransformCentered(transform) ? 2 : 1,
      // @ts-ignore
      oldWidth = target.clippingPath.width,
      newWidth = Math.ceil(
        Math.abs((newPoint.x * multiplier) / target.scaleX) - strokePadding
      );

    // @ts-ignore
    target.clippingPath.set('width', Math.max(newWidth, 0));
    // @ts-ignore
    if (target.clippingPath.dynamicMinWidth >= target.clippingPath.width) {
      // @ts-ignore
      target.set('width', target.clippingPath.dynamicMinWidth);
      // @ts-ignore
      target.set('height', target.clippingPath.height);
      return oldWidth !== target.width;
    }
    //  check against actual target width in case `newWidth` was rejected
    console.log(scaleX, '=== scaleX ===');
    target.set('originalScaleX', scaleX);
    target.set('originalScaleY', scaleX);
    target.set('width', Math.max(newWidth, 0));
    // @ts-ignore
    target.set('height', target.clippingPath.height);
     // @ts-ignore
    return oldWidth !== target.clippingPath.width;
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

function scaleObjectML(
  eventData: TPointerEvent,
  transform: ScaleTransform,
  x: number,
  y: number,
  options: { by?: ScaleBy } = {}
) {
  const target = transform.target as any,
    by = options.by,
    original = transform.original,
    scaleProportionally = scaleIsProportional(eventData, target);
  const forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  let scaleX, scaleY, dim, signX, signY;
  if (forbidScaling) {
    return false;
  }

  const fullWidth = target.getOriginalElementWidth();
  const remainderX = fullWidth - target.width - target.cropX;
  const anchorOriginX = 1 + (remainderX / target.width);
  const centerPoint = target.getRelativeCenterPoint();
  const constraint = target.translateToOriginPoint(centerPoint, anchorOriginX, transform.originY);
  const newPoint = normalizePoint(target, new fabric.Point(x, y), anchorOriginX, transform.originY);

  if (transform.gestureScale) {
    scaleX = transform.scaleX * transform.gestureScale;
    scaleY = transform.scaleY * transform.gestureScale;
  } else {
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

    dim = target._getOriginalTransformedDimensions();
    // missing detection of flip and logic to switch the origin
    if (scaleProportionally && !by) {
      // uniform scaling
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y),
        { original } = transform,
        originalDistance =
          Math.abs((dim.x * original.scaleX) / target.scaleX) +
          Math.abs((dim.y * original.scaleY) / target.scaleY),
        scale = distance / originalDistance;
      scaleX = original.scaleX * scale;
      scaleY = original.scaleY * scale;
    } else {
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

  const oldScaleX = target.scaleX;
  const scaleChangeX = scaleX / oldScaleX;
  const scaledRemainderX = remainderX / scaleChangeX;
  const newWidth = target.width / scaleChangeX;
  const newCropX = fullWidth - newWidth - scaledRemainderX;

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

  if (
    transform.originX === 'center' ||
    (transform.originX === 'right' && newPoint.x < 0) ||
    (transform.originX === 'left' && newPoint.x > 0)
  ) {
    const { target } = transform,
      strokePadding =
        target.strokeWidth / (target.strokeUniform ? target.scaleX : 1),
      multiplier = isTransformCentered(transform) ? 2 : 1,
      // @ts-ignore
      oldWidth = target.width,
      newWidth = Math.ceil(
        Math.abs((newPoint.x * multiplier) / target.scaleX) - strokePadding
      );

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
    target.set('width', Math.max(newWidth, 0));
    // // @ts-ignore
    // target.set('height', target.clippingPath.height);
    return oldWidth !== target.width;
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

const scaleObjectFromCorner: TransformActionHandler<ScaleTransform> = (
  eventData,
  transform,
  x,
  y
) => {
  console.log(transform, 'transform')
  const corner = transform.corner;
  if (corner === 'mr') {
    return scaleObjectMR(eventData, transform, x, y, { by: 'x' });
  } else {
    return scaleObjectML(eventData, transform, x, y, { by: 'x' });
  }
};

const scalingEqually = fabric.controlsUtils.wrapWithFireEvent(
  'resizing',
  // @ts-ignore
  fabric.controlsUtils.wrapWithFixedAnchor(scaleObjectFromCorner)
);

export {
  fireClippingMaskEvent,
  editClippingMaskHandler,
  uploadImageHandler,
  scaleEquallyCrop,
  imageCornerML,
  imageCornerMR,
  scalingXCrop,
  scalingEqually,
};
