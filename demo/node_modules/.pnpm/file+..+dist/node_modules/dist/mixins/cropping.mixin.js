var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as fabric from 'fabric';
import { extend } from 'lodash';
import { fireCropImageEvent } from '../controls/cropping/cropping.controls.handlers';
import { croppingControlSet, flipXCropControls, flipXYCropControls, flipYCropControls, standardControlSet } from '../controls/cropping/cropping.controls';
import { containsPoint } from '../shared/utility';
// @ts-ignore
export function isolateObjectForEdit(context) {
    var canvas = context.canvas;
    context.hoverCursor = fabric.Object.prototype.hoverCursor;
    canvas.requestRenderAll();
    var deselect = context.onDeselect;
    // eslint-disable-next-line func-names
    context.onDeselect = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var index = canvas.getObjects().indexOf(context);
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
        deselect.call.apply(deselect, __spreadArray([context], args, false));
        return true;
    };
}
// @ts-ignore
export function unisolateObjectForEdit(context) {
    var fabricCanvas = context.canvas;
    fabricCanvas.requestRenderAll();
    var deselect = context.onDeselect;
    // eslint-disable-next-line func-names
    context.onDeselect = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // @ts-ignore
        deselect.call.apply(deselect, __spreadArray([context], args, false));
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
function canvasMouseDown(e) {
    console.log('canvasMouseDown');
    var target = e.target;
    // @ts-ignore
    var activeObject = this.getActiveObject();
    if (!activeObject) {
        return;
    }
    if ((!target || (activeObject.elementKey !== target.elementKey)) && activeObject.isCropping) {
        var _a = activeObject.oCoords, tlS = _a.tlS, trS = _a.trS, blS = _a.blS, brS = _a.brS;
        var vs = [
            { x: tlS.x, y: tlS.y },
            { x: trS.x, y: trS.y },
            { x: brS.x, y: brS.y },
            { x: blS.x, y: blS.y }
        ];
        if (activeObject.__corner) {
            return;
        }
        // @ts-ignore
        var pointer = this.getPointer(e, true);
        var checkClickInside = containsPoint(pointer, vs);
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
export function canvasMouseMove(_a) {
    var _b = _a === void 0 ? {} : _a, e = _b.e;
    // @ts-ignore
    var fabricObject = this.getActiveObject();
    // @ts-ignore
    if (!this.__targetlessCanvasDrag || e.type !== 'mousemove' || !fabricObject) {
        return;
    }
    var point = {
        x: e.movementX,
        y: e.movementY,
    };
    var objM = fabricObject.calcTransformMatrix();
    // @ts-ignore
    var canvasM = this.viewportTransform;
    var totalM = fabric.util.invertTransform(fabric.util.multiplyTransformMatrices(canvasM, objM));
    totalM[4] = 0;
    totalM[5] = 0;
    // @ts-ignore
    var transformedMovement = fabric.util.transformPoint(point, totalM);
    fabricObject.cropX -= transformedMovement.x;
    fabricObject.cropY -= transformedMovement.y;
    fabricObject.fire('moving');
    // @ts-ignore
    this.requestRenderAll();
}
function addCroppingInteractions(prototype) {
    var cropping = {
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
            this.on('mousedown', this.resetCropModeAnchors);
            this.canvas.on('before:transform', this.cropBeforeHelper);
            this.canvas.on('mouse:up', canvasMouseUp);
            this.canvas.on('mouse:down', canvasMouseDown);
            this.canvas.on('mouse:move', canvasMouseMove);
            window.addEventListener('mousedown', this.eventListener);
        },
        unbindCropModeHandlers: function () {
            this.off('moving', this.cropModeHandlerMoveImage);
            this.off('mousedown', this.resetCropModeAnchors);
            this.canvas.off('before:transform', this.cropBeforeHelper);
            this.canvas.off('mouse:up', canvasMouseUp);
            this.canvas.off('mouse:down', canvasMouseDown);
            this.canvas.off('mouse:move', canvasMouseMove);
            window.removeEventListener('mousedown', this.eventListener);
        },
        _drawDarkLayer: function (ctx) {
            var shouldNotDraw = !this.isCropping && !this.isInPerspectiveMode;
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
        _drawCroppingLines: function (ctx) {
            if (!this.isCropping
                || (this.canvas && (this.canvas.isCropping))) {
                return;
            }
            var w = this.width;
            var h = this.height;
            // @ts-ignore
            var zoom = this.canvas.getZoom() * fabric.devicePixelRatio;
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
        // this is a canvas level event. so `THIS` is the canvas
        // @ts-ignore
        cropBeforeHelper: function (_a) {
            var transform = _a.transform;
            // the idea here is to see how the image is positioned
            // and fix the corner that should not move.
            var action = transform.action, target = transform.target;
            if (action.substring(0, 5) === 'scale') {
                // give us the current position of the opposite corner
                target.cropAnchorPoint = target.translateToOriginPoint(target.getCenterPoint(), transform.originX, transform.originY);
            }
        },
        cropModeHandlerMoveImage: function () {
            if (!this.isCropping) {
                return;
            }
            var lastTop = this.lastTop === undefined ? this.lastEventTop : this.lastTop;
            var lastLeft = this.lastLeft === undefined ? this.lastEventLeft : this.lastLeft;
            var changeVector = new fabric.Point(lastLeft - this.left, lastTop - this.top);
            var correctMovement = fabric.util.transformPoint(changeVector, this.moveTransformationMatrix);
            var width = this._element.naturalWidth || this._element.width;
            var height = this._element.naturalHeight || this._element.height;
            var changeX = correctMovement.x;
            var changeY = correctMovement.y;
            var cropX = this.cropX + changeX;
            var cropY = this.cropY + changeY;
            var limitChangeVector = {
                x: changeX,
                y: changeY,
            };
            // verify bounds
            if (cropX < 0) {
                limitChangeVector.x = -this.cropX;
                cropX = 0;
            }
            else if (cropX + this.width > width) {
                cropX = width - this.width;
                limitChangeVector.x = width - this.cropX - this.width;
            }
            if (cropY < 0) {
                limitChangeVector.y = -this.cropY;
                cropY = 0;
            }
            else if (cropY + this.height > height) {
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
    };
    extend(prototype, cropping);
}
export function extendWithCropping(EditorImage) {
    Object.defineProperty(EditorImage.prototype, 'isCropping', {
        get: function () {
            return !!this.__isCropping;
        },
        set: function (value) {
            var fabricCanvas = this.canvas;
            if (!fabricCanvas) {
                this.__isCropping = false;
                return;
            }
            var defaultCursor = fabricCanvas.defaultCursor;
            value = !!value;
            if (value === this.isCropping)
                return;
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
                }
                else {
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
            }
            else {
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
