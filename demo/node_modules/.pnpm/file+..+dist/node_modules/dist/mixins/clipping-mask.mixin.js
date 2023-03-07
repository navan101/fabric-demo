import * as fabric from 'fabric';
import extend from 'lodash/extend';
import { containsPoint } from '../shared/utility';
import { imageControls, cropControls, flipXCropControls, flipYCropControls, flipXYCropControls } from '../controls/clipping-mask/clipping-mask.controls';
import { fireClippingMaskEvent } from '../controls/clipping-mask/clipping-mask.controls.handlers';
import { isolateObjectForEdit, unisolateObjectForEdit } from './cropping.mixin';
function addClippingMaskInteractions(prototype) {
    var clippingMask = {
        bindCropModeHandlers: function () {
            this.unbindCropModeHandlers();
            this.on('moving', this.cropModeHandlerMoveImage);
            this.on('mousedown', this.resetCropModeAnchors);
            this.canvas.on('mouse:up', this.onMouseUp);
            this.canvas.on('mouse:down', this.onMouseDown);
            this.canvas.on('mouse:move', this.onMouseMove);
            // window.addEventListener('mousedown', this.eventListener);
        },
        unbindCropModeHandlers: function () {
            this.off('moving', this.cropModeHandlerMoveImage);
            this.off('mousedown', this.resetCropModeAnchors);
            this.canvas.off('mouse:up', this.onMouseUp);
            // this.canvas.off('mouse:down', this.onMouseDown);
            this.canvas.off('mouse:move', this.onMouseMove);
            // window.removeEventListener('mousedown', this.eventListener);
        },
        onMouseUp: function () {
            delete this.__targetlessCanvasDrag;
            this.defaultCursor = this.__defaultCursor;
            delete this.__defaultCursor;
        },
        // @ts-ignore
        onMouseDown: function (event) {
            var target = event.target;
            var activeObject = this.getActiveObject();
            if (!activeObject) {
                return;
            }
            if ((!target || activeObject.elementKey !== target.elementKey) && activeObject.type === 'clipping-mask' && activeObject.isClipping) {
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
                activeObject.isClipping = false;
                this.defaultCursor = 'default';
                this.requestRenderAll();
            }
        },
        // @ts-ignore
        onMouseMove: function (event) {
            var evt = event.e;
            var activeObject = this.getActiveObject();
            if (this.__targetlessCanvasDrag
                && evt.type === 'mousemove'
                && activeObject) {
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
                fabric.Canvas.prototype._setupCurrentTransform.call(this, event, activeObject, true);
                // this._setupCurrentTransform(e, target, alreadySelected);
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
                var width = this._element.naturalWidth || this._element.width;
                var height = this._element.naturalHeight || this._element.height;
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
                this.cropX = cropX;
                this.cropY = cropY;
                this.lastTop = this.top;
                this.lastLeft = this.left;
                this.top = this.lastEventTop;
                this.left = this.lastEventLeft;
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
export function extendWithClippingMask(EditorClippingMask) {
    // @ts-ignore
    Object.defineProperty(EditorClippingMask.prototype, 'isClipping', {
        get: function () {
            return !!this.__isClipping;
        },
        set: function (value) {
            var fabricCanvas = this.canvas;
            if (!fabricCanvas) {
                this.__isClipping = false;
                return;
            }
            var defaultCursor = fabricCanvas.defaultCursor;
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
                this.controls = imageControls;
                this.setCoords();
            }
            fireClippingMaskEvent(this);
        },
    });
    addClippingMaskInteractions(EditorClippingMask.prototype);
}
