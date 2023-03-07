import * as fabric from 'fabric';
import { Point } from 'fabric';
import { extend } from 'lodash';
import { cropControls } from '../controls/clipping-text-1/clipping-text.controls';
import { fireClippingTextEvent } from '../controls/clipping-text-1/clipping-text.controls.handlers';
import { containsPoint } from '../shared/utility';
import { isolateObjectForEdit, unisolateObjectForEdit } from './cropping.mixin';
// @ts-ignore
function addClippingTextInteractions(prototype) {
    var clippingTextCustom = {
        cropBorderColor: '#43b9d3',
        cropBorderScaleFactor: 2,
        cropCornerStyle: 'default',
        cropDarkLayer: '#16191e',
        cropLinesColor: '#f6f7fa',
        croppingBeforeVals: ['stroke', 'strokeWidth', 'cornerSize'],
        bindCropModeHandlers: function () {
            // Ensure no double-binding
            this.unbindCropModeHandlers();
            this.on('moving', this.cropModeHandlerMoveImage);
            this.canvas.on('mouse:up', this.onMouseUp);
            this.canvas.on('mouse:down', this.onMouseDown2);
            this.canvas.on('mouse:move', this.onMouseMove);
            window.addEventListener('mousedown', this.eventListener);
        },
        unbindCropModeHandlers: function () {
            this.off('moving', this.cropModeHandlerMoveImage);
            this.canvas.off('mouse:up', this.onMouseUp);
            this.canvas.off('mouse:down', this.onMouseDown2);
            this.canvas.off('mouse:move', this.onMouseMove);
            window.removeEventListener('mousedown', this.eventListener);
        },
        onMouseUp: function () {
            delete this.moveClipping;
            this.defaultCursor = this.__defaultCursor;
            delete this.__defaultCursor;
            var activeObject = this.getActiveObject();
            if (activeObject === null || activeObject === void 0 ? void 0 : activeObject.patternMoving) {
                fireClippingTextEvent(activeObject, 'onMouseUp');
                delete activeObject.patternMoving;
            }
        },
        onMouseDown2: function (event) {
            var activeObject = this.getActiveObject();
            if (!activeObject || activeObject.__corner) {
                return;
            }
            var _a = activeObject.oCoords, tlS = _a.tlS, trS = _a.trS, blS = _a.blS, brS = _a.brS;
            if (!tlS || !trS || !blS || !brS) {
                return;
            }
            var points = [{ x: tlS.x, y: tlS.y }, { x: trS.x, y: trS.y }, { x: brS.x, y: brS.y }, { x: blS.x, y: blS.y }];
            var pointer = this.getPointer(event, true);
            var intersect = containsPoint(pointer, points);
            if (intersect) {
                this.moveClipping = true;
                this.selectable = false;
                this.evented = false;
            }
            else {
                activeObject.isClipping = false;
                this.defaultCursor = 'default';
                this.requestRenderAll();
            }
        },
        onMouseMove: function (event) {
            var e = event.e;
            var activeObject = this.getActiveObject();
            if (!activeObject || activeObject.__corner) {
                return;
            }
            var _a = activeObject.oCoords, tlS = _a.tlS, trS = _a.trS, blS = _a.blS, brS = _a.brS;
            if (!tlS || !trS || !blS || !brS) {
                return;
            }
            var pointer = this.getPointer(e, true);
            var points = [{ x: tlS.x, y: tlS.y }, { x: trS.x, y: trS.y }, { x: brS.x, y: brS.y }, { x: blS.x, y: blS.y }];
            var intersect = containsPoint(pointer, points);
            this.defaultCursor = intersect ? 'move' : 'default';
            if (!this.moveClipping) {
                return;
            }
            var offset = {
                x: e.movementX,
                y: e.movementY,
            };
            var matrix = activeObject.calcTransformMatrix();
            var newMatrix = [matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]];
            if ((activeObject.flipX || activeObject.flipY) && activeObject.angle === 0) {
                newMatrix[0] = Math.abs(matrix[0]);
                newMatrix[3] = Math.abs(matrix[3]);
            }
            var vpt = this.viewportTransform;
            var invertTransform = fabric.util.invertTransform(fabric.util.multiplyTransformMatrices(vpt, newMatrix));
            invertTransform[4] = 0;
            invertTransform[5] = 0;
            var newPoint = fabric.util.transformPoint(offset, invertTransform);
            activeObject.cropX -= newPoint.x;
            activeObject.cropY -= newPoint.y;
            activeObject.pattern.setCoords();
            activeObject.dirty = true;
            activeObject.fire('moving');
            this.requestRenderAll();
        },
        cropModeHandlerMoveImage: function () {
            if (!this.isClipping) {
                return;
            }
            var width = this.pattern.getScaledWidth();
            var height = this.pattern.getScaledHeight();
            var w = this.getScaledWidth();
            var h = this.getScaledHeight();
            var distanceX = (width - w) / 2;
            var distanceY = (height - h) / 2;
            var cropX = this.cropX;
            var cropY = this.cropY;
            // verify bounds
            if (cropX < -distanceX) {
                cropX = -distanceX;
            }
            else if (cropX > distanceX) {
                cropX = distanceX;
            }
            if (cropY < -distanceY) {
                cropY = -distanceY;
            }
            else if (cropY > distanceY) {
                cropY = distanceY;
            }
            var center = this.getCenterPoint();
            var centerPattern = this.pattern.getCenterPoint();
            var pointCrop = new Point(cropX, cropY);
            var point = fabric.util.rotateVector(pointCrop, fabric.util.degreesToRadians(this.angle));
            this.pattern.left += (center.x - centerPattern.x) - point.x;
            this.pattern.top += (center.y - centerPattern.y) - point.y;
            this.cropX = cropX;
            this.cropY = cropY;
            this.lastTop = this.pattern.top;
            this.lastLeft = this.pattern.left;
            this.patternMoving = true;
        },
    };
    extend(prototype, clippingTextCustom);
}
function addClippingMaskInteractions(prototype) {
    var clippingMask = {
        bindCropModeHandlers: function () {
            // this.unbindCropModeHandlers();
            // this.on('moving', this.cropModeHandlerMoveImage);
            // this.on('mousedown', this.resetCropModeAnchors);
            // this.canvas.on('mouse:up', this.onMouseUp);
            // this.canvas.on('mouse:down', this.onMouseDown2);
            // this.canvas.on('mouse:move', this.onMouseMove);
            // window.addEventListener('mousedown', this.eventListener);
        },
        unbindCropModeHandlers: function () {
            // this.off('moving', this.cropModeHandlerMoveImage);
            // this.off('mousedown', this.resetCropModeAnchors);
            // this.canvas.off('mouse:up', this.onMouseUp);
            // this.canvas.off('mouse:down', this.onMouseDown2);
            // this.canvas.off('mouse:move', this.onMouseMove);
            // window.removeEventListener('mousedown', this.eventListener);
        },
        onMouseUp: function () {
            delete this.__targetlessCanvasDrag;
            this.defaultCursor = this.__defaultCursor;
            delete this.__defaultCursor;
        },
        // @ts-ignore
        onMouseDown2: function (event) {
            var target = event.target;
            var activeObject = this.getActiveObject();
            if (!activeObject) {
                return;
            }
            // && activeObject.type === 'clipping-text'
            if ((!target || activeObject.elementKey !== target.elementKey) && activeObject.isClipping) {
                var _a = activeObject.oCoords, tlS = _a.tlS, trS = _a.trS, blS = _a.blS, brS = _a.brS;
                var vs = [{ x: tlS.x, y: tlS.y },
                    { x: trS.x, y: trS.y },
                    { x: brS.x, y: brS.y },
                    { x: blS.x, y: blS.y }];
                if (activeObject.__corner) {
                    return;
                }
                var pointer = this.getPointer(event, true);
                var checkClickInside = containsPoint(pointer, vs);
                if (checkClickInside) {
                    activeObject.resetCropModeAnchors();
                    this.__targetlessCanvasDrag = true;
                    this.__defaultCursor = this.defaultCursor;
                    this.defaultCursor = 'move';
                    this.selectable = false;
                    this.evented = false;
                    return;
                }
                // activeObject.isClipping = false;
                // activeObject.set('isClipping', false);
                this.defaultCursor = 'default';
                this.requestRenderAll();
            }
        },
        // @ts-ignore
        onMouseMove: function (event) {
            var evt = event.e;
            var activeObject = this.getActiveObject();
            // console.log(this.__targetlessCanvasDrag, 'this.__targetlessCanvasDrag');
            // console.log(evt.type, 'evt.type');
            // console.log(activeObject, 'activeObject');
            if (
            // this.__targetlessCanvasDrag
            // && evt.type === 'mousemove'
            // && 
            activeObject) {
                // console.log('onMouseMove');
                var point = {
                    x: evt.movementX,
                    y: evt.movementY,
                };
                var matrix = activeObject.calcTransformMatrix();
                var vpt = this.viewportTransform;
                var transf = fabric.util.invertTransform(fabric.util.multiplyTransformMatrices(vpt, matrix));
                transf[4] = 0;
                transf[5] = 0;
                // @ts-ignore
                var newPoint = fabric.util.transformPoint(point, transf);
                activeObject.cropX -= newPoint.x;
                activeObject.cropY -= newPoint.y;
                activeObject.fire('moving');
                this.requestRenderAll();
            }
        },
        resetCropModeAnchors: function () {
            this.lastEventTop = this.top;
            this.lastEventLeft = this.left;
            this.lastTop = undefined;
            this.lastLeft = undefined;
        },
        setupDragMatrix: function () {
            this.moveTransformationMatrix = fabric.util.invertTransform(this.calcTransformMatrix());
            this.changeToPositionMatrix = this.calcTransformMatrix().concat();
            this.moveTransformationMatrix[4] = 0;
            this.moveTransformationMatrix[5] = 0;
            this.changeToPositionMatrix[4] = 0;
            this.changeToPositionMatrix[5] = 0;
        },
        cropModeHandlerMoveImage: function () {
            if (this.isClipping) {
                var top_1 = this.lastTop === undefined ? this.lastEventTop : this.lastTop;
                var left = this.lastLeft === undefined ? this.lastEventLeft : this.lastLeft;
                var pt = new fabric.Point(left - this.left, top_1 - this.top);
                var point = fabric.util.transformPoint(pt, this.moveTransformationMatrix);
                var width = this.clippingPath._element.naturalWidth || this.clippingPath._element.width;
                var height = this.clippingPath._element.naturalHeight || this.clippingPath._element.height;
                var x = point.x, y = point.y;
                var cropX = this.cropX + x;
                var cropY = this.cropY + y;
                var newPoint = {
                    x: x,
                    y: y,
                };
                if (cropX < 0) {
                    newPoint.x = -this.cropX;
                    cropX = 0;
                }
                else if (cropX + this.width > width) {
                    cropX = width - this.width;
                    newPoint.x = width - this.cropX - this.width;
                }
                if (cropY < 0) {
                    newPoint.y = -this.cropY;
                    cropY = 0;
                }
                else if (cropY + this.height > height) {
                    cropY = height - this.height;
                    newPoint.y = height - this.cropY - this.height;
                }
                // this.cropX = cropX;
                // this.cropY = cropY;
                this.lastTop = this.top;
                this.lastLeft = this.left;
                this.top = this.lastEventTop;
                this.left = this.lastEventLeft;
                this.set({
                    cropX: cropX,
                    cropY: cropY
                });
                // fireClippingMaskEvent(this);
            }
        },
        _drawClippingLines: function (ctx) {
            if (!this.isClipping) {
                return;
            }
            var w = this.width;
            var h = this.height;
            // @ts-ignore
            var zoom = this.canvas.getZoom() * fabric.devicePixelRatio;
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
    };
    extend(prototype, clippingMask);
}
export function extendWithClippingText(EditorClippingText) {
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
        get: function () {
            return !!this.__isClipping;
        },
        set: function (value) {
            var fabricCanvas = this.canvas;
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
                // this.bindCropModeHandlers();
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
            }
            else {
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
export function checkRelativePositionBetweenElementsClippingText(originalImage, originalClipPath) {
    var ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
    var ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();
    if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
        var scale = originalImage.scaleY / originalImage.scaleX;
        var scaleToWidth = originalClipPath.getScaledWidth() / originalImage.width;
        originalImage.scale(scaleToWidth);
        originalImage.scaleY = scale * originalImage.scaleX;
    }
    else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
        var scale = originalImage.scaleX / originalImage.scaleY;
        var scaleToHeight = originalClipPath.getScaledHeight() / originalImage.height;
        originalImage.scale(scaleToHeight);
        originalImage.scaleX = scale * originalImage.scaleY;
    }
    var centerPoint = originalClipPath.getCenterPoint();
    var imageLeft = centerPoint.x - (originalImage.getScaledWidth()) / 2;
    var imageTop = centerPoint.y - (originalImage.getScaledHeight()) / 2;
    var rotationPoint = new fabric.Point(imageLeft, imageTop);
    var angleRadians = fabric.util.degreesToRadians(originalClipPath.angle);
    var newCoords = fabric.util.rotatePoint(rotationPoint, centerPoint, angleRadians);
    originalImage.set({
        left: newCoords.x,
        top: newCoords.y,
        angle: originalClipPath.angle,
    });
    originalImage.setCoords();
}
