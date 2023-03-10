import * as fabric from 'fabric';
import extend from 'lodash/extend';
import { containsPoint } from '../shared/utility';

import {
  imageControls, cropControls, flipXCropControls, flipYCropControls, flipXYCropControls
} from '../controls/clipping-mask/clipping-mask.controls';
import { fireClippingMaskEvent } from '../controls/clipping-mask/clipping-mask.controls.handlers';
import { isolateObjectForEdit, unisolateObjectForEdit } from './cropping.mixin';


function addClippingMaskInteractions(prototype: any) {

  const clippingMask: any = {
    bindCropModeHandlers() {
      this.unbindCropModeHandlers();
      this.on('moving', this.cropModeHandlerMoveImage);
      this.on('mousedown', this.resetCropModeAnchors);
      this.canvas.on('mouse:up', this.onMouseUp);
      this.canvas.on('mouse:down', this.onMouseDown);
      this.canvas.on('mouse:move', this.onMouseMove);
      // window.addEventListener('mousedown', this.eventListener);
    },
    unbindCropModeHandlers() {
      this.off('moving', this.cropModeHandlerMoveImage);
      this.off('mousedown', this.resetCropModeAnchors);
      this.canvas.off('mouse:up', this.onMouseUp);
      // this.canvas.off('mouse:down', this.onMouseDown);
      this.canvas.off('mouse:move', this.onMouseMove);
      // window.removeEventListener('mousedown', this.eventListener);
    },

    onMouseUp() {
      delete this.__targetlessCanvasDrag;
      this.defaultCursor = this.__defaultCursor;
      delete this.__defaultCursor;
    },

    // @ts-ignore
    onMouseDown(event) {
      const { target } = event;
      const activeObject = this.getActiveObject();
      if (!activeObject) {
        return;
      }
      if ((!target || activeObject.elementKey !== target.elementKey) && activeObject.type === 'clipping-mask' && activeObject.isClipping) {
        const { tlS, trS, blS, brS } = activeObject.oCoords;
        const vs = [{ x: tlS.x, y: tlS.y },
        { x: trS.x, y: trS.y },
        { x: brS.x, y: brS.y },
        { x: blS.x, y: blS.y }];
        if (activeObject.__corner) {
          return;
        }
        const pointer = this.getPointer(event, true);
        const checkClickInside = containsPoint(pointer, vs);
        if (checkClickInside) {
          activeObject.resetCropModeAnchors();
          this.__targetlessCanvasDrag = true;
          this.__defaultCursor = this.defaultCursor;
          this.defaultCursor = 'move';
          this.selectable = false;
          this.evented = false;
          return;
        }
        activeObject.isClipping = false;
        this.defaultCursor = 'default';
        this.requestRenderAll();
      }
    },

    // @ts-ignore
    onMouseMove(event) {
      const evt = event.e;
      const activeObject = this.getActiveObject();
      if (
        this.__targetlessCanvasDrag
        && evt.type === 'mousemove'
        && activeObject
      ) {
        const point = {
          x: evt.movementX,
          y: evt.movementY,
        };
        const matrix = activeObject.calcTransformMatrix();
        const vpt = this.viewportTransform;
        const transf = fabric.util.invertTransform(
          fabric.util.multiplyTransformMatrices(vpt, matrix),
        );
        transf[4] = 0;
        transf[5] = 0;
        // @ts-ignore
        const newPoint = fabric.util.transformPoint(point, transf);
        activeObject.cropX -= newPoint.x;
        activeObject.cropY -= newPoint.y;
        fabric.Canvas.prototype._setupCurrentTransform.call(this, event, activeObject, true)
        // this._setupCurrentTransform(e, target, alreadySelected);
        activeObject.fire('moving');
        this.requestRenderAll();
      }
    },

    resetCropModeAnchors() {
      this.lastEventTop = this.top;
      this.lastEventLeft = this.left;
      this.lastTop = undefined;
      this.lastLeft = undefined;
    },

    setupDragMatrix() {
      this.moveTransformationMatrix = fabric.util.invertTransform(
        this.calcTransformMatrix(),
      );
      this.changeToPositionMatrix = this.calcTransformMatrix().concat();
      this.moveTransformationMatrix[4] = 0;
      this.moveTransformationMatrix[5] = 0;
      this.changeToPositionMatrix[4] = 0;
      this.changeToPositionMatrix[5] = 0;
    },

    cropModeHandlerMoveImage() {
      if (this.isClipping) {
        const top = this.lastTop === undefined ? this.lastEventTop : this.lastTop;
        const left = this.lastLeft === undefined ? this.lastEventLeft : this.lastLeft;
        const pt = new fabric.Point(left - this.left, top - this.top);
        const point = fabric.util.transformPoint(
          pt,
          this.moveTransformationMatrix,
        );
        const width = this._element.naturalWidth || this._element.width;
        const height = this._element.naturalHeight || this._element.height;
        const { x, y } = point;
        let cropX = this.cropX + x;
        let cropY = this.cropY + y;
        const newPoint = {
          x,
          y,
        };
        if (cropX < 0) {
          newPoint.x = -this.cropX;
          cropX = 0;
        } else if (cropX + this.width > width) {
          cropX = width - this.width;
          newPoint.x = width - this.cropX - this.width;
        }
        if (cropY < 0) {
          newPoint.y = -this.cropY;
          cropY = 0;
        } else if (cropY + this.height > height) {
          cropY = height - this.height;
          newPoint.y = height - this.cropY - this.height;
        }
        this.cropX = cropX;
        this.cropY = cropY;
        this.lastTop = this.top;
        this.lastLeft = this.left;
        this.top = this.lastEventTop;
        this.left = this.lastEventLeft;
        // fireClippingMaskEvent(this);
      }
    },

    _drawClippingLines(ctx: CanvasRenderingContext2D) {
      if (!this.isClipping) {
        return;
      }
      const w = this.width;
      const h = this.height;
      // @ts-ignore
      const zoom = this.canvas.getZoom() * fabric.devicePixelRatio;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.moveTo(-w / 2 + w / 3, -h / 2);
      ctx.lineTo(-w / 2 + w / 3, h / 2);
      ctx.moveTo(-w / 2 + 2 * w / 3, -h / 2);
      ctx.lineTo(-w / 2 + 2 * w / 3, h / 2);
      ctx.moveTo(-w / 2, -h / 2 + h / 3);
      ctx.lineTo(w / 2, -h / 2 + h / 3);
      ctx.moveTo(-w / 2, -h / 2 + 2 * h / 3);
      ctx.lineTo(w / 2, -h / 2 + 2 * h / 3);
      ctx.scale(1 / (this.scaleX * zoom), 1 / (this.scaleY * zoom));
      ctx.stroke();
      ctx.restore();
    },

  }

  extend(prototype, clippingMask);

}

export function extendWithClippingMask(EditorClippingMask: any) {
  // @ts-ignore
  Object.defineProperty(EditorClippingMask.prototype, 'isClipping', {
    get() {
      return !!this.__isClipping;
    },
    set(value) {
      const fabricCanvas = this.canvas;
      if (!fabricCanvas) {
        this.__isClipping = false;
        return;
      }
      let { defaultCursor } = fabricCanvas;
      value = !!value;
      if (value === this.isClipping) {
        return;
      }
      this.__isClipping = value;

      if (value) {
        defaultCursor = fabricCanvas.defaultCursor;
        fabricCanvas.defaultCursor = 'move';
        // handle crop mode enter
        isolateObjectForEdit(this);
        this.lastEventTop = this.top;
        this.lastEventLeft = this.left;
        // The strokeWidth value set at isolateObjectForEdit(this, this.croppingBeforeVals)
        // will be restored when we exit crop mode.
        // this.strokeWidth = 0;

        this.setupDragMatrix();
        this.bindCropModeHandlers();
        // after changing padding we have to recalculate corner positions
        this.controls = cropControls;
        if (this.flipX && !this.flipY) {
          this.controls = flipXCropControls;
        }
        if (this.flipY && !this.flipX) {
          this.controls = flipYCropControls;
        }
        if (this.flipX && this.flipY) {
          this.controls = flipXYCropControls;
        }
        // if (this.tileImageOption.enabled) {
        //   this.setControlsVisibility({
        //     tlS: false,
        //     trS: false,
        //     blS: false,
        //     brS: false,
        //   });
        // } else {
        this.setControlsVisibility({
          tlS: true,
          trS: true,
          blS: true,
          brS: true,
        });
        // }
        this.setCoords();
        fabricCanvas.centeredKey = 'none';
        fabricCanvas.altActionKey = 'none';
        fabricCanvas.selection = false;
      } else {
        // fabricCanvas.defaultCursor = defaultCursor;
        // restore properties from before crop
        unisolateObjectForEdit(this);
        delete this.lastEventTop;
        delete this.lastEventLeft;

        this.unbindCropModeHandlers();
        fabricCanvas.centeredKey = fabric.Canvas.prototype.centeredKey;
        fabricCanvas.altActionKey = fabric.Canvas.prototype.altActionKey;
        fabricCanvas.selection = true;
        // after changing padding we have to recalculate corner positions
        this.controls = imageControls;
        this.setCoords();
      }
      fireClippingMaskEvent(this);
    },
  });

  addClippingMaskInteractions(EditorClippingMask.prototype);
}