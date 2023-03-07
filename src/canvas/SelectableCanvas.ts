import extend from 'lodash/extend';
import { Object as FabricObject, util, controlsUtils, Canvas } from 'fabric';
import { ModifierKey, TPointerEvent, Transform } from '../EventTypeDefs';
import { getActionFromCorner } from '../controls/util';
import { saveObjectTransform } from '../util/misc/objectTransforms';
import { TOriginX, TOriginY } from '../typedefs';

const { sendPointToPlane, degreesToRadians } = util;
const { dragHandler } = controlsUtils;

const SelectableCanvasCustom: any = {
  
  _getOriginFromCorner(
    target: FabricObject,
    controlName: string
  ): { x: TOriginX; y: TOriginY } {
    const origin = {
      x: target.originX,
      y: target.originY,
    };
    // is a left control ?
    if (['ml', 'tl', 'bl', 'mlS', 'tlS', 'blS'].includes(controlName)) {
      origin.x = 'right';
      // is a right control ?
    } else if (['mr', 'tr', 'br', 'mrS', 'trS', 'brS'].includes(controlName)) {
      origin.x = 'left';
    }
    // is a top control ?
    if (['tl', 'mt', 'tr', 'tlS', 'mtS', 'trS'].includes(controlName)) {
      origin.y = 'bottom';
      // is a bottom control ?
    } else if (['bl', 'mb', 'br', 'blS', 'mbS', 'brS'].includes(controlName)) {
      origin.y = 'top';
    }
    return origin;
  },

  _setupCurrentTransform(
    e: TPointerEvent,
    target: FabricObject,
    alreadySelected: boolean
  ): void {
    if (!target) {
      return;
    }
    const pointer = target.group
      ? // transform pointer to target's containing coordinate plane
        sendPointToPlane(
          this.getPointer(e),
          undefined,
          target.group.calcTransformMatrix()
        )
      : this.getPointer(e);
    const corner = target.__corner || '',
      control = !!corner && target.controls[corner],
      actionHandler =
        alreadySelected && control
          ? control.getActionHandler(e, target, control)
          : dragHandler,
      action = getActionFromCorner(alreadySelected, corner, e, target),
      origin = this._getOriginFromCorner(target, corner),
      altKey = e[this.centeredKey as ModifierKey],
      /**
       * relative to target's containing coordinate plane
       * both agree on every point
       **/
      transform: Transform = {
        target: target,
        action: action,
        // @ts-ignore
        actionHandler,
        actionPerformed: false,
        corner,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        skewX: target.skewX,
        skewY: target.skewY,
        offsetX: pointer.x - target.left,
        offsetY: pointer.y - target.top,
        originX: origin.x,
        originY: origin.y,
        ex: pointer.x,
        ey: pointer.y,
        lastX: pointer.x,
        lastY: pointer.y,
        // @ts-ignore
        theta: degreesToRadians(target.angle),
        width: target.width,
        height: target.height,
        shiftKey: e.shiftKey,
        altKey: altKey,
        original: {
          ...saveObjectTransform(target),
          originX: origin.x,
          originY: origin.y,
        },
      };

    if (this._shouldCenterTransform(target, action, altKey)) {
      transform.originX = 'center';
      transform.originY = 'center';
    }
    this._currentTransform = transform;
    // @ts-ignore
    this._beforeTransform(e);
  },
}

extend(Canvas.prototype, SelectableCanvasCustom);