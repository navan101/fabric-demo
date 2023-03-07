import * as fabric from 'fabric';
import { extend } from 'lodash';
import { fireCropImageEvent } from '../controls/cropping/cropping.controls.handlers';
import {
  croppingControlSet,
  flipXCropControls,
  flipXYCropControls,
  flipYCropControls,
  standardControlSet
} from '../controls/cropping/cropping.controls';
import { containsPoint } from '../shared/utility';

// @ts-ignore
export function isolateObjectForEdit(context) {
  const { canvas } = context;
  context.hoverCursor = fabric.Object.prototype.hoverCursor;
  canvas.requestRenderAll();
  const deselect = context.onDeselect;
  // eslint-disable-next-line func-names
  context.onDeselect = function (...args: any) {
    const index = canvas.getObjects().indexOf(context);
    // if (index < 0) {
    //   if (context.isCropping) {
    //     context.isCropping = false;
    //   }
    //   if (context.isClipping) {
    //     context.isClipping = false;
    //   }
    //   return false;
    // }
    // @ts-ignore
    deselect.call(context, ...args);
    return true;
  };
}
  
// @ts-ignore
export function unisolateObjectForEdit(context) {
  const fabricCanvas = context.canvas;
  fabricCanvas.requestRenderAll();
  const deselect = context.onDeselect;
  // eslint-disable-next-line func-names
  context.onDeselect = function (...args: any) {
    // @ts-ignore
    deselect.call(context, ...args);
    return false;
  };
}

function canvasMouseUp() {
  // @ts-ignore
  delete this.__targetlessCanvasDrag;
   // @ts-ignore
  this.defaultCursor = this.__defaultCursor;
   // @ts-ignore
  delete this.__defaultCursor;
}

// @ts-ignore
function canvasMouseDown(e: any) {
  console.log('canvasMouseDown')
  const target = e.target;
  // @ts-ignore
  const activeObject = this.getActiveObject();
  if (!activeObject) {
    return;
  }
  if ((!target || (activeObject.elementKey !== target.elementKey)) && activeObject.isCropping) {
    const { tlS, trS, blS, brS } = activeObject.oCoords;
    const vs = [
      { x: tlS.x, y: tlS.y },
      { x: trS.x, y: trS.y },
      { x: brS.x, y: brS.y },
      { x: blS.x, y: blS.y }
    ];
    if (activeObject.__corner) {
      return;
    }
    // @ts-ignore
    const pointer = this.getPointer(e, true);
    const checkClickInside = containsPoint(pointer, vs);
    if (checkClickInside) {
      activeObject.resetCropModeAnchors();
      // @ts-ignore
      this.__targetlessCanvasDrag = true;
      // @ts-ignore
      this.__defaultCursor = this.defaultCursor;
      // @ts-ignore
      this.defaultCursor = 'move';
      // @ts-ignore
      this.selectable = false;
      // @ts-ignore
      this.evented = false;
      return;
    }
    activeObject.isCropping = false;
    // @ts-ignore
    this.defaultCursor = 'default';
    // @ts-ignore
    this.requestRenderAll();
  }
}

 // @ts-ignore
export function canvasMouseMove({ e } = {}) {
   // @ts-ignore
  const fabricObject = this.getActiveObject();
   // @ts-ignore
  if (!this.__targetlessCanvasDrag || e.type !== 'mousemove' || !fabricObject) {
    return;
  }
  const point = {
    x: e.movementX,
    y: e.movementY,
  };
  const objM = fabricObject.calcTransformMatrix();
   // @ts-ignore
  const canvasM = this.viewportTransform;
  const totalM = fabric.util.invertTransform(fabric.util.multiplyTransformMatrices(canvasM, objM));
  totalM[4] = 0;
  totalM[5] = 0;
   // @ts-ignore
  const transformedMovement = fabric.util.transformPoint(point, totalM);
  fabricObject.cropX -= transformedMovement.x;
  fabricObject.cropY -= transformedMovement.y;
  fabricObject.fire('moving');
   // @ts-ignore
  this.requestRenderAll();
}

function addCroppingInteractions(prototype: any) {

  const cropping: any = {
    cropBorderColor: '#43b9d3',
    cropBorderScaleFactor: 2,
    cropCornerStyle: 'default',
    cropDarkLayer: '#16191e',
    cropLinesColor: '#f6f7fa',
    croppingBeforeVals: ['stroke', 'strokeWidth', 'cornerSize'], 
    bindCropModeHandlers() {
      // Ensure no double-binding
      this.unbindCropModeHandlers();
      this.on('moving', this.cropModeHandlerMoveImage);
      this.on('mousedown', this.resetCropModeAnchors);

      this.canvas.on('before:transform', this.cropBeforeHelper);
      this.canvas.on('mouse:up', canvasMouseUp);
      this.canvas.on('mouse:down', canvasMouseDown);
      this.canvas.on('mouse:move', canvasMouseMove);
      window.addEventListener('mousedown', this.eventListener);
    },

    unbindCropModeHandlers() {
      this.off('moving', this.cropModeHandlerMoveImage);
      this.off('mousedown', this.resetCropModeAnchors);
      this.canvas.off('before:transform', this.cropBeforeHelper);
      this.canvas.off('mouse:up', canvasMouseUp);
      this.canvas.off('mouse:down', canvasMouseDown);
      this.canvas.off('mouse:move', canvasMouseMove);
      window.removeEventListener('mousedown', this.eventListener);
    },

    _drawDarkLayer(ctx: CanvasRenderingContext2D) {
      const shouldNotDraw = !this.isCropping && !this.isInPerspectiveMode;
      if (shouldNotDraw || this === this.canvas.backgroundImage) {
        return;
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = this.cropDarkLayer;
      ctx.fillRect(0, 0, this.canvas.lowerCanvasEl.width, this.canvas.lowerCanvasEl.height);
      ctx.restore();
    },

    _drawCroppingLines(ctx: CanvasRenderingContext2D) {
      if (
        !this.isCropping
        || (this.canvas && (this.canvas.isCropping))
      ) {
        return;
      }
      const w = this.width;
      const h = this.height;
      // @ts-ignore
      const zoom = this.canvas.getZoom() * fabric.devicePixelRatio;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = this.cropLinesColor;
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

    resetCropModeAnchors() {
      this.lastEventTop = this.top;
      this.lastEventLeft = this.left;
      this.lastTop = undefined;
      this.lastLeft = undefined;
    },

    setupDragMatrix() {
      this.moveTransformationMatrix = fabric.util.invertTransform(this.calcTransformMatrix());
      this.changeToPositionMatrix = this.calcTransformMatrix().concat();
      this.moveTransformationMatrix[4] = 0;
      this.moveTransformationMatrix[5] = 0;
      this.changeToPositionMatrix[4] = 0;
      this.changeToPositionMatrix[5] = 0;
    },

    // this is a canvas level event. so `THIS` is the canvas
    // @ts-ignore
    cropBeforeHelper({ transform }) {
      // the idea here is to see how the image is positioned
      // and fix the corner that should not move.
      const { action, target } = transform;
      if (action.substring(0, 5) === 'scale') {
        // give us the current position of the opposite corner
        target.cropAnchorPoint = target.translateToOriginPoint(
          target.getCenterPoint(),
          transform.originX,
          transform.originY,
        );
      }
    },

    cropModeHandlerMoveImage() {
      if (!this.isCropping) {
        return;
      }
      const lastTop = this.lastTop === undefined ? this.lastEventTop : this.lastTop;
      const lastLeft = this.lastLeft === undefined ? this.lastEventLeft : this.lastLeft;
      const changeVector = new fabric.Point(lastLeft - this.left, lastTop - this.top);
      const correctMovement = fabric.util.transformPoint(
        changeVector, this.moveTransformationMatrix,
      );
      const width = this._element.naturalWidth || this._element.width;
      const height = this._element.naturalHeight || this._element.height;
      const changeX = correctMovement.x;
      const changeY = correctMovement.y;
      let cropX = this.cropX + changeX;
      let cropY = this.cropY + changeY;
      const limitChangeVector = {
        x: changeX,
        y: changeY,
      };
      // verify bounds
      if (cropX < 0) {
        limitChangeVector.x = -this.cropX;
        cropX = 0;
      } else if (cropX + this.width > width) {
        cropX = width - this.width;
        limitChangeVector.x = width - this.cropX - this.width;
      }
      if (cropY < 0) {
        limitChangeVector.y = -this.cropY;
        cropY = 0;
      } else if (cropY + this.height > height) {
        cropY = height - this.height;
        limitChangeVector.y = height - this.cropY - this.height;
      }
      this.cropX = cropX;
      this.cropY = cropY;
      this.lastTop = this.top;
      this.lastLeft = this.left;
      this.top = this.lastEventTop;
      this.left = this.lastEventLeft;
    },
  }
  
  extend(prototype, cropping);
}

export function extendWithCropping(EditorImage: any) {
  Object.defineProperty(EditorImage.prototype, 'isCropping', {
    get() {
      return !!this.__isCropping;
    },
    set(value: boolean) {
      const fabricCanvas = this.canvas;
      if (!fabricCanvas) {
        this.__isCropping = false;
        return;
      }
      let { defaultCursor } = fabricCanvas;
      value = !!value;
      if (value === this.isCropping) return;
      this.__isCropping = value;

      if (value) {
        defaultCursor = fabricCanvas.defaultCursor;
        fabricCanvas.defaultCursor = 'move';
        // handle crop mode enter
        isolateObjectForEdit(this);
        this.lastEventTop = this.top;
        this.lastEventLeft = this.left;
        this.setupDragMatrix();
        // this.cropHandler = this.cropModeHandlerMoveImage;
        this.bindCropModeHandlers();
        // after changing padding we have to recalculate corner positions
        this.controls = croppingControlSet;
        if (this.flipX && !this.flipY) {
          this.controls = flipXCropControls;
        }
        if (this.flipY && !this.flipX) {
          this.controls = flipYCropControls;
        }
        if (this.flipX && this.flipY) {
          this.controls = flipXYCropControls;
        }
        if (this.scaleX != this.scaleY) {
          this.setControlsVisibility({
            tlS: false,
            trS: false,
            blS: false,
            brS: false,
          });
        } else {
          this.setControlsVisibility({
            tlS: true,
            trS: true,
            blS: true,
            brS: true,
          });
        }
        this.setCoords();
        fabricCanvas.centeredKey = 'none';
        fabricCanvas.altActionKey = 'none';
        fabricCanvas.selection = false;
      } else {
        fabricCanvas.defaultCursor = defaultCursor;
        // restore properties from before crop
        unisolateObjectForEdit(this);
        delete this.lastEventTop;
        delete this.lastEventLeft;
        this.unbindCropModeHandlers();
        fabricCanvas.centeredKey = fabric.Canvas.prototype.centeredKey;
        fabricCanvas.altActionKey = fabric.Canvas.prototype.altActionKey;
        fabricCanvas.selection = true;
        // after changing padding we have to recalculate corner positions
        this.controls = standardControlSet;
        this.setCoords();
        fireCropImageEvent(this);
      }
    },
  });

  addCroppingInteractions(EditorImage.prototype);
}