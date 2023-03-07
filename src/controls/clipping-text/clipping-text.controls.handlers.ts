import * as fabric  from 'fabric';
import { normalizePoint } from '../../controls/util';

// @ts-ignore
const { wrapWithFireEvent } = fabric.controlsUtils;

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
  const localPoint = normalizePoint(target.pattern, new fabric.Point(x, y), originX, originY);
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
const sign = (Math.sign || function (x) { return ((x > 0) - (x < 0)) || +x; });

const CENTER = 'center';

// @ts-ignore
function isTransformCentered(transform) {
  return transform.originX === CENTER && transform.originY === CENTER;
}

// @ts-ignore
function scaleObject(eventData, transform, x, y, options) {
  const { target } = transform;
  // eslint-disable-next-line no-param-reassign
  options = options || {};
  const { lockScalingX } = target;
  const { lockScalingY } = target;
  const { by } = options;
  const scaleProportionally = scaleIsProportional(eventData, target);
  const forbidScaling = scalingIsForbidden(target, by, scaleProportionally);
  const { gestureScale } = transform;
  let newPoint; let scaleX; let scaleY; let dim;
  let signX;
  let signY = transform.gestureScale;
  if (forbidScaling) {
    return false;
  }
  if (gestureScale) {
    scaleX = transform.scaleX * gestureScale;
    scaleY = transform.scaleY * gestureScale;
  } else {
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
      const distance = Math.abs(newPoint.x) + Math.abs(newPoint.y);
      const { original } = transform;
      // eslint-disable-next-line max-len
      const originalDistance = Math.abs((dim.x * original.pattern.scaleX) / target.pattern.scaleX) + Math.abs((dim.y * original.pattern.scaleY) / target.pattern.scaleY);
      const scale = distance / originalDistance;
      scaleX = original.pattern.scaleX * scale;
      scaleY = original.pattern.scaleY * scale;
    } else {
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
  const oldScaleX = target.pattern.scaleX;
  const oldScaleY = target.pattern.scaleY;
  const corner = target.__corner;
  const originPattern = transform.original.pattern;
  let lockMinScaleY = false;
  let lockMinScaleX = false;

  if (corner && originPattern && originPattern.minScale && originPattern.minScale[corner]) {
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
    // eslint-disable-next-line no-unused-expressions
    !lockScalingX && !lockMinScaleY && target.pattern.set('scaleX', scaleX);
    // eslint-disable-next-line no-unused-expressions
    !lockScalingY && !lockMinScaleX && target.pattern.set('scaleY', scaleY);
  } else {
    // forbidden cases already handled on top here.
    // eslint-disable-next-line no-unused-expressions
    by === 'x' && target.pattern.set('scaleX', scaleX);
    // eslint-disable-next-line no-unused-expressions
    by === 'y' && target.pattern.set('scaleY', scaleY);
  }
  target.dirty = true;
  target.canvas.requestRenderAll();
  const change = oldScaleX !== target.pattern.scaleX || oldScaleY !== target.pattern.scaleY;
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
    const { target } = transform; const centerPoint = target.pattern.getCenterPoint();
    const constraint = target.pattern.translateToOriginPoint(centerPoint, transform.originX, transform.originY);
    const actionPerformed = actionHandler(eventData, transform, x, y);
    target.pattern.setPositionByOrigin(constraint, transform.originX, transform.originY);
    return actionPerformed;
  };
}
const scalingEqually = wrapWithFireEvent(<any>'scaling2', wrapWithFixedAnchor(scaleObjectFromCorner));
const scalingX = wrapWithFireEvent(<any>'scaling2', wrapWithFixedAnchor(scaleObjectX));
const scalingY = wrapWithFireEvent(<any>'scaling2', wrapWithFixedAnchor(scaleObjectY));

// @ts-ignore
function cornerTL(dim, finalMatrix, fabricObject) {
  const vpt = fabricObject.canvas.viewportTransform;
  const zoom = fabricObject.canvas.getZoom();
  const coords = fabricObject.pattern._getCoords(true, true);
  return {
    x: coords.tl.x * zoom + vpt[4],
    y: coords.tl.y * zoom + vpt[5],
  };
}

// @ts-ignore
function cornerTR(dim, finalMatrix, fabricObject) {
  const vpt = fabricObject.canvas.viewportTransform;
  const zoom = fabricObject.canvas.getZoom();
  const coords = fabricObject.pattern._getCoords(true, true);
  return {
    x: coords.tr.x * zoom + vpt[4],
    y: coords.tr.y * zoom + vpt[5],
  };
}

// @ts-ignore
function cornerML(dim, finalMatrix, fabricObject) {
  const vpt = fabricObject.canvas.viewportTransform;
  const zoom = fabricObject.canvas.getZoom();
  const coords = fabricObject.pattern._getCoords(true, true);
  return {
    x: ((coords.tl.x + coords.bl.x) * zoom) / 2 + vpt[4],
    y: ((coords.tl.y + coords.bl.y) * zoom) / 2 + vpt[5],
  };
}

// @ts-ignore
function cornerMR(dim, finalMatrix, fabricObject) {
  const vpt = fabricObject.canvas.viewportTransform;
  const zoom = fabricObject.canvas.getZoom();
  const coords = fabricObject.pattern._getCoords(true, true);
  return {
    x: ((coords.tr.x + coords.br.x) * zoom) / 2 + vpt[4],
    y: ((coords.tr.y + coords.br.y) * zoom) / 2 + vpt[5],
  };
}

// @ts-ignore
function cornerBR(dim, finalMatrix, fabricObject) {
  const vpt = fabricObject.canvas.viewportTransform;
  const zoom = fabricObject.canvas.getZoom();
  const coords = fabricObject.pattern._getCoords(true, true);
  return {
    x: coords.br.x * zoom + vpt[4],
    y: coords.br.y * zoom + vpt[5],
  };
}

// @ts-ignore
function cornerBL(dim, finalMatrix, fabricObject) {
  const vpt = fabricObject.canvas.viewportTransform;
  const zoom = fabricObject.canvas.getZoom();
  const coords = fabricObject.pattern._getCoords(true, true);
  return {
    x: coords.bl.x * zoom + vpt[4],
    y: coords.bl.y * zoom + vpt[5],
  };
}

function editClippingTextHandler(eventData: any, transform: any) {
  const { target } = transform;
  target.isClipping = true;
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
  scalingEqually,
  scalingX,
  scalingY,
  editClippingTextHandler,
  fireClippingTextEvent,
};
