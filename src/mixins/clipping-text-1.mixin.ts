import * as fabric from 'fabric';
import { Point } from 'fabric';
import { extend } from 'lodash';

import { cropControls, defaultControls } from '../controls/clipping-text-1/clipping-text.controls';
import { fireClippingTextEvent } from '../controls/clipping-text-1/clipping-text.controls.handlers';
import { containsPoint } from '../shared/utility';
import { isolateObjectForEdit, unisolateObjectForEdit } from './cropping.mixin';

// @ts-ignore
// function addClippingTextInteractions(prototype) {
//   const clippingTextCustom: any = {
//     cropBorderColor: '#43b9d3',
//     cropBorderScaleFactor: 2,
//     cropCornerStyle: 'default',
//     cropDarkLayer: '#16191e',
//     cropLinesColor: '#f6f7fa',
//     croppingBeforeVals: ['stroke', 'strokeWidth', 'cornerSize'],

//     bindCropModeHandlers() {
//       // Ensure no double-binding
//       this.unbindCropModeHandlers();
//       this.on('moving', this.cropModeHandlerMoveImage);
//       this.canvas.on('mouse:up', this.onMouseUp);
//       this.canvas.on('mouse:down', this.onMouseDown2);
//       this.canvas.on('mouse:move', this.onMouseMove);
//       window.addEventListener('mousedown', this.eventListener);
//     },

//     unbindCropModeHandlers() {
//       this.off('moving', this.cropModeHandlerMoveImage);
//       this.canvas.off('mouse:up', this.onMouseUp);
//       this.canvas.off('mouse:down', this.onMouseDown2);
//       this.canvas.off('mouse:move', this.onMouseMove);
//       window.removeEventListener('mousedown', this.eventListener);
//     },

//     onMouseUp() {
//       delete this.moveClipping;
//       this.defaultCursor = this.__defaultCursor;
//       delete this.__defaultCursor;
//       const activeObject = this.getActiveObject();
//       if (activeObject?.patternMoving) {
//         fireClippingTextEvent(activeObject, 'onMouseUp');
//         delete activeObject.patternMoving;
//       }
//     },

//     onMouseDown2(event: any) {
//       const activeObject = this.getActiveObject();
//       if (!activeObject || activeObject.__corner) {
//         return;
//       }
//       const {
//         tlS, trS, blS, brS,
//       } = activeObject.oCoords;

//       if (!tlS || !trS || !blS || !brS) {
//         return;
//       }
//       const points = [{ x: tlS.x, y: tlS.y }, { x: trS.x, y: trS.y }, { x: brS.x, y: brS.y }, { x: blS.x, y: blS.y }];
//       const pointer = this.getPointer(event, true);
//       const intersect = containsPoint(pointer, points);
//       if (intersect) {
//         this.moveClipping = true;
//         this.selectable = false;
//         this.evented = false;
//       } else {
//         activeObject.isClipping = false;
//         this.defaultCursor = 'default';
//         this.requestRenderAll();
//       }
//     },

//     onMouseMove(event: any) {
//       const { e } = event;
//       const activeObject = this.getActiveObject();
//       if (!activeObject || activeObject.__corner) {
//         return;
//       }
//       const {
//         tlS, trS, blS, brS,
//       } = activeObject.oCoords;

//       if (!tlS || !trS || !blS || !brS) {
//         return;
//       }
//       const pointer = this.getPointer(e, true);
//       const points = [{ x: tlS.x, y: tlS.y }, { x: trS.x, y: trS.y }, { x: brS.x, y: brS.y }, { x: blS.x, y: blS.y }];
//       const intersect = containsPoint(pointer, points);
//       this.defaultCursor = intersect ? 'move' : 'default';

//       if (!this.moveClipping) {
//         return;
//       }
//       const offset: any = {
//         x: e.movementX,
//         y: e.movementY,
//       };
//       const matrix = activeObject.calcTransformMatrix();
//       const newMatrix: any = [matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]];
//       if ((activeObject.flipX || activeObject.flipY) && activeObject.angle === 0) {
//         newMatrix[0] = Math.abs(matrix[0]);
//         newMatrix[3] = Math.abs(matrix[3]);
//       }
//       const vpt = this.viewportTransform;
//       const invertTransform = fabric.util.invertTransform(
//         fabric.util.multiplyTransformMatrices(vpt, newMatrix),
//       );
//       invertTransform[4] = 0;
//       invertTransform[5] = 0;
//       const newPoint = fabric.util.transformPoint(offset, invertTransform);
//       activeObject.cropX -= newPoint.x;
//       activeObject.cropY -= newPoint.y;
//       activeObject.pattern.setCoords();
//       activeObject.dirty = true;
//       // activeObject.fire('moving');
//       this.requestRenderAll();
//     },

//     cropModeHandlerMoveImage() {
//       if (!this.isClipping) {
//         return;
//       }
//       const width = this.pattern.getScaledWidth();
//       const height = this.pattern.getScaledHeight();
//       const w = this.getScaledWidth();
//       const h = this.getScaledHeight();
//       const distanceX = (width - w) / 2;
//       const distanceY = (height - h) / 2;
//       let { cropX } = this;
//       let { cropY } = this;
//       // verify bounds
//       if (cropX < -distanceX) {
//         cropX = -distanceX;
//       } else if (cropX > distanceX) {
//         cropX = distanceX;
//       }

//       if (cropY < -distanceY) {
//         cropY = -distanceY;
//       } else if (cropY > distanceY) {
//         cropY = distanceY;
//       }
//       const center = this.getCenterPoint();
//       const centerPattern = this.pattern.getCenterPoint();
//       const pointCrop = new Point(cropX, cropY);
//       const point = fabric.util.rotateVector(pointCrop, fabric.util.degreesToRadians(this.angle));
//       this.pattern.left += (center.x - centerPattern.x) - point.x;
//       this.pattern.top += (center.y - centerPattern.y) - point.y;
//       this.cropX = cropX;
//       this.cropY = cropY;
//       this.lastTop = this.pattern.top;
//       this.lastLeft = this.pattern.left;
//       this.patternMoving = true;
//     },
//   }
//   extend(prototype, clippingTextCustom);
// }

function addClippingMaskInteractions(prototype: any) {

  const clippingMask: any = {
    bindCropModeHandlers() {
      this.unbindCropModeHandlers();
      this.on('moving', this.cropModeHandlerMoveImage);
      this.on('mousedown', this.resetCropModeAnchors);
      this.canvas.on('mouse:up', this.onMouseUp);
      this.canvas.on('mouse:down', this.onMouseDown2);
      this.canvas.on('mouse:move', this.onMouseMove);
      window.addEventListener('mousedown', this.eventListener);
    },
    unbindCropModeHandlers() {
      this.off('moving', this.cropModeHandlerMoveImage);
      this.off('mousedown', this.resetCropModeAnchors);
      this.canvas.off('mouse:up', this.onMouseUp);
      this.canvas.off('mouse:down', this.onMouseDown2);
      this.canvas.off('mouse:move', this.onMouseMove);
      window.removeEventListener('mousedown', this.eventListener);
    },

    onMouseUp() {
      delete this.__targetlessCanvasDrag;
      this.defaultCursor = this.__defaultCursor;
      delete this.__defaultCursor;
    },

    // @ts-ignore
    onMouseDown2(event) {
      const { target } = event;
      const activeObject = this.getActiveObject();
      if (!activeObject) {
        return;
      }
      // && activeObject.type === 'clipping-text'
      if ((!target || activeObject.elementKey !== target.elementKey) && activeObject.isClipping) {
        activeObject.resetCropModeAnchors();
        this.__targetlessCanvasDrag = true;
        this.__defaultCursor = this.defaultCursor;
        this.defaultCursor = 'move';
        this.selectable = false;
        this.evented = false;
        // activeObject.isClipping = false;
        // activeObject.set('isClipping', false);
        this.defaultCursor = 'default';
        this.requestRenderAll();
      }
    },

    // @ts-ignore
    onMouseMove(event) {
      const evt = event.e;
      const activeObject = this.getActiveObject();
      // console.log(this.__targetlessCanvasDrag, 'this.__targetlessCanvasDrag');
      // console.log(evt.type, 'evt.type');
      // console.log(activeObject, 'activeObject');
      if (
        this.__targetlessCanvasDrag
        && evt.type === 'mousemove'
        &&
        activeObject
      ) {
        // console.log('onMouseMove');
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
      if (!this.isClipping) {
        return;
      }
      const width = this.clippingPath.getScaledWidth();
      const height = this.clippingPath.getScaledHeight();
      const w = this.getScaledWidth();
      const h = this.getScaledHeight();
      const distanceX = (width - w) / 2;
      const distanceY = (height - h) / 2;
      let { cropX } = this;
      let { cropY } = this;
      // verify bounds
      if (cropX < -distanceX) {
        cropX = -distanceX;
      } else if (cropX > distanceX) {
        cropX = distanceX;
      }
      if (cropY < -distanceY) {
        cropY = -distanceY;
      } else if (cropY > distanceY) {
        cropY = distanceY;
      }
      const center = this.getCenterPoint();
      const centerPattern = this.clippingPath.getCenterPoint();
      const pointCrop = new Point(cropX, cropY);
      const point = fabric.util.rotateVector(pointCrop, fabric.util.degreesToRadians(this.angle));
      // this.clippingPath.left += (center.x - centerPattern.x) - point.x;
      // this.clippingPath.top += (center.y - centerPattern.y) - point.y;
      this.cropX = cropX;
      this.cropY = cropY;
      // this.lastTop = this.clippingPath.top;
      // this.lastLeft = this.clippingPath.left;
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

export function extendWithClippingText(EditorClippingText: any) {
  // // @ts-ignore
  // Object.defineProperty(EditorClippingText.prototype, 'isClipping', {
  //   get() {
  //     return !!this.__isClipping;
  //   },
  //   set(value) {
  //     const fabricCanvas = this.canvas;
  //     if (!fabricCanvas) {
  //       this.__isClipping = false;
  //       return;
  //     }
  //     // eslint-disable-next-line no-param-reassign
  //     value = !!value;
  //     if (value === this.isClipping) {
  //       return;
  //     }
  //     this.__isClipping = value;
  //     if (value) {
  //       if (!this.clippingPath.canvas) {
  //         this.clippingPath.canvas = fabricCanvas;
  //       }
  //       // handle crop mode enter
  //       isolateObjectForEdit(this);
  //       // this.lockClippingMove();

  //       this.bindCropModeHandlers();
  //       // after changing padding we have to recalculate corner positions
  //       this.controls = cropControls;
  //       // if (this.tileImageOption.enabled) {
  //       //   this.setControlsVisibility({
  //       //     tlS: false,
  //       //     trS: false,
  //       //     blS: false,
  //       //     brS: false,
  //       //     mlS: false,
  //       //     mrS: false,
  //       //   });
  //       // } else if (this.resizeAsImage) {
  //       //   this.setControlsVisibility({
  //       //     tlS: true,
  //       //     trS: true,
  //       //     blS: true,
  //       //     brS: true,
  //       //     mlS: false,
  //       //     mrS: false,
  //       //   });
  //       // } else {
  //         this.setControlsVisibility({
  //           tlS: true,
  //           trS: true,
  //           blS: true,
  //           brS: true,
  //           mlS: true,
  //           mrS: true,
  //         });
  //       // }
  //       this.setCoords();
  //       fabricCanvas.centeredKey = 'none';
  //       fabricCanvas.altActionKey = 'none';
  //       fabricCanvas.selection = false;
  //     } else {
  //       // restore properties from before crop
  //       unisolateObjectForEdit(this);
  //       // this.resetClippingMove();

  //       this.unbindCropModeHandlers();
  //       fabricCanvas.centeredKey = fabric.Canvas.prototype.centeredKey;
  //       fabricCanvas.altActionKey = fabric.Canvas.prototype.altActionKey;
  //       fabricCanvas.selection = true;
  //       // after changing padding we have to recalculate corner positions
  //       this.controls = defaultControls;
  //       if (this.resizeAsImage) {
  //         this.setControlsVisibility({
  //           ml: false,
  //           mr: false,
  //         });
  //       } else {
  //         this.setControlsVisibility({
  //           ml: true,
  //           mr: true,
  //         });
  //       }
  //       this.setCoords();
  //       fireClippingTextEvent(this, 'isClipping');
  //     }
  //   },
  // });

  // // @ts-ignore
  // Object.defineProperty(EditorClippingText.prototype, 'tileImageOption', {
  //   get() {
  //     return this.__tileImageOption;
  //   },
  //   set(data) {
  //     this.__tileImageOption = data;
  //     if (this.__tileImageOption.enabled) {
  //       this.setControlsVisibility({
  //         tlS: false,
  //         trS: false,
  //         blS: false,
  //         brS: false,
  //         mlS: false,
  //         mrS: false,
  //       });
  //     } else {
  //       this.setControlsVisibility({
  //         tlS: true,
  //         trS: true,
  //         blS: true,
  //         brS: true,
  //         mlS: true,
  //         mrS: true,
  //       });
  //     }
  //     this.setCoords();
  //   },
  // });

  // @ts-ignore
  Object.defineProperty(EditorClippingText.prototype, 'isClipping', {
    get() {
      return !!this.__isClipping;
    },
    set(value) {
      const fabricCanvas = this.canvas;
      if (!fabricCanvas) {
        this.__isClipping = false;
        return;
      }
      // let { defaultCursor } = fabricCanvas;
      value = !!value;
      if (value === this.isClipping) {
        return;
      }
      this.__isClipping = value;

      if (value) {
        this.objectCaching = false;
        // defaultCursor = fabricCanvas.defaultCursor;
        // fabricCanvas.defaultCursor = 'move';
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
        // if (this.flipX && !this.flipY) {
        //   this.controls = flipXCropControls;
        // }
        // if (this.flipY && !this.flipX) {
        //   this.controls = flipYCropControls;
        // }
        // if (this.flipX && this.flipY) {
        //   this.controls = flipXYCropControls;
        // }
        // if (this.tileImageOption.enabled) {
        //   this.setControlsVisibility({
        //     tlS: false,
        //     trS: false,
        //     blS: false,
        //     brS: false,
        //   });
        // } else {
        // this.setControlsVisibility({
        //   tlS: true,
        //   trS: true,
        //   blS: true,
        //   brS: true,
        // });
        // }
        this.setCoords();
        fabricCanvas.centeredKey = 'none';
        fabricCanvas.altActionKey = 'none';
        fabricCanvas.selection = false;
      } else {
        this.objectCaching = true;
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
        // this.controls = imageControls;
        this.setCoords();
      }
      // fireClippingMaskEvent(this);
    },
  });

  // @ts-ignore
  addClippingMaskInteractions(EditorClippingText.prototype);
}

export function checkRelativePositionBetweenElementsClippingText(
  originalImage: any,
  originalClipPath: any,
) {
  const ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
  const ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();

  if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
    const scale = originalImage.scaleY / originalImage.scaleX;
    const scaleToWidth = originalClipPath.getScaledWidth() / originalImage.width;
    originalImage.scale(scaleToWidth);
    originalImage.scaleY = scale * originalImage.scaleX;
  } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
    const scale = originalImage.scaleX / originalImage.scaleY;
    const scaleToHeight = originalClipPath.getScaledHeight() / originalImage.height;
    originalImage.scale(scaleToHeight);
    originalImage.scaleX = scale * originalImage.scaleY;
  }

  const centerPoint = originalClipPath.getCenterPoint();
  const imageLeft = centerPoint.x - (originalImage.getScaledWidth()) / 2;
  const imageTop = centerPoint.y - (originalImage.getScaledHeight()) / 2;

  const rotationPoint = new fabric.Point(imageLeft, imageTop);
  const angleRadians = fabric.util.degreesToRadians(
    originalClipPath.angle,
  );
  const newCoords = fabric.util.rotatePoint(
    rotationPoint,
    centerPoint,
    angleRadians,
  );
  originalImage.set({
    left: newCoords.x,
    top: newCoords.y,
    angle: originalClipPath.angle,
  });
  originalImage.setCoords();
}
