import * as fabric from 'fabric';
import { Point } from 'fabric';
import { extend } from 'lodash';
import { cropControls, defaultControls } from '../controls/clipping-text/clipping-text.controls';
import { fireClippingTextEvent } from '../controls/clipping-text/clipping-text.controls.handlers';
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
export function extendWithClippingText(EditorClippingText) {
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
            // eslint-disable-next-line no-param-reassign
            value = !!value;
            if (value === this.isClipping) {
                return;
            }
            this.__isClipping = value;
            if (value) {
                if (!this.pattern.canvas) {
                    this.pattern.canvas = fabricCanvas;
                }
                // handle crop mode enter
                isolateObjectForEdit(this);
                console.log(this.isEditing, 'isEditing');
                // this.lockClippingMove();
                this.bindCropModeHandlers();
                // after changing padding we have to recalculate corner positions
                this.controls = cropControls;
                // if (this.tileImageOption.enabled) {
                //   this.setControlsVisibility({
                //     tlS: false,
                //     trS: false,
                //     blS: false,
                //     brS: false,
                //     mlS: false,
                //     mrS: false,
                //   });
                // } else if (this.resizeAsImage) {
                //   this.setControlsVisibility({
                //     tlS: true,
                //     trS: true,
                //     blS: true,
                //     brS: true,
                //     mlS: false,
                //     mrS: false,
                //   });
                // } else {
                this.setControlsVisibility({
                    tlS: true,
                    trS: true,
                    blS: true,
                    brS: true,
                    mlS: true,
                    mrS: true,
                });
                // }
                this.setCoords();
                fabricCanvas.centeredKey = 'none';
                fabricCanvas.altActionKey = 'none';
                fabricCanvas.selection = false;
            }
            else {
                // restore properties from before crop
                unisolateObjectForEdit(this);
                // this.resetClippingMove();
                this.unbindCropModeHandlers();
                fabricCanvas.centeredKey = fabric.Canvas.prototype.centeredKey;
                fabricCanvas.altActionKey = fabric.Canvas.prototype.altActionKey;
                fabricCanvas.selection = true;
                // after changing padding we have to recalculate corner positions
                this.controls = defaultControls;
                if (this.resizeAsImage) {
                    this.setControlsVisibility({
                        ml: false,
                        mr: false,
                    });
                }
                else {
                    this.setControlsVisibility({
                        ml: true,
                        mr: true,
                    });
                }
                this.setCoords();
                fireClippingTextEvent(this, 'isClipping');
            }
        },
    });
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
    addClippingTextInteractions(EditorClippingText.prototype);
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
