var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// @ts-nocheck
import * as fabric from 'fabric';
import { EditorImage } from './EditorImage';
import { extendWithClippingMask } from '../mixins/clipping-mask.mixin';
import { imageControls } from '../controls/clipping-mask/clipping-mask.controls';
fabric.Object.prototype.borderScaleFactor = 1;
fabric.Object.prototype.cornerSize = 12;
fabric.Object.prototype.touchCornerSize = 48;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.selectionBackgroundColor = 'rgba(255, 255, 255, 0.3)';
fabric.Object.prototype.borderOpacityWhenMoving = 1;
fabric.Group.prototype.noScaleCache = false; // refresh cache at scaling
fabric.Canvas.prototype.allowTouchScrolling = false;
var EditorClippingMask = /** @class */ (function (_super) {
    __extends(EditorClippingMask, _super);
    function EditorClippingMask(element, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, element, __assign({ filters: [] }, options)) || this;
        _this.cropOpacity = 0.5;
        _this.controls = imageControls;
        _this.initEvent();
        return _this;
    }
    EditorClippingMask.prototype.initEvent = function () {
        // this.on('mousedblclick', (e: any) => {
        //   debugger
        //   // const newSelection = this.getSelectionStartFromPointer(e);
        //   // this.setSelectionStart(newSelection);
        //   // this.setSelectionEnd(newSelection);
        //   this.clippingPath?.set('canvas', this.canvas);
        //   this.clippingPath?.set('editable', true);
        //   this.clippingPath?.enterEditing(e);
        // });
        var _this = this;
        function checkRelativePositionBetweenElementsClippingText(originalImage, originalClipPath) {
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
        function checkRelativePositionBetweenElements(originalImage, originalClipPath) {
            var ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
            var ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();
            originalImage.angle = 0;
            if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
                var scale = originalImage.scaleY / originalImage.scaleX;
                originalImage.scaleToWidth(originalClipPath.getScaledWidth());
                originalImage.scaleY = scale * originalImage.scaleX;
            }
            else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
                var scale = originalImage.scaleX / originalImage.scaleY;
                originalImage.scaleToHeight(originalClipPath.getScaledHeight());
                originalImage.scaleX = scale * originalImage.scaleY;
            }
            var imageLeft = originalClipPath.left - ((originalImage.getScaledWidth() - originalClipPath.getScaledWidth()) / 2);
            var imageTop = originalClipPath.top - ((originalImage.getScaledHeight() - originalClipPath.getScaledHeight()) / 2);
            return {
                imageLeft: imageLeft,
                imageTop: imageTop,
            };
        }
        function handleReleaseClippingMask(clippingMaskElementKey) {
            var _a;
            var section = masterPageData.state.selectedSection.value;
            var tmpOrderArray = __spreadArray([], masterPageData.getOrderArray(section).value, true);
            var index = tmpOrderArray.findIndex(function (elementKey) { return elementKey === clippingMaskElementKey; });
            var clippingMask = (_a = masterPageData.getElementByKey(clippingMaskElementKey)) === null || _a === void 0 ? void 0 : _a.value;
            if (!clippingMask.isClipping && clippingMask.originalImageObject && clippingMask.originalClipPathObject) {
                clippingMask.originalClipPathObject.sectionIndex = clippingMask.sectionIndex;
                clippingMask.originalClipPathObject.top = clippingMask.top;
                clippingMask.originalClipPathObject.left = clippingMask.left;
                clippingMask.originalClipPathObject.flipX = clippingMask.flipX;
                clippingMask.originalClipPathObject.flipY = clippingMask.flipY;
                clippingMask.originalClipPathObject.angle = clippingMask.angle;
                clippingMask.originalClipPathObject.scaleX *= clippingMask.scaleX || 1;
                clippingMask.originalClipPathObject.scaleY *= clippingMask.scaleY || 1;
                var cropX = (clippingMask.cropX || 0) * (clippingMask.scaleX || 1);
                var cropY = (clippingMask.cropY || 0) * (clippingMask.scaleY || 1);
                var point = fabric.util.rotateVector(new fabric.Point(cropX, cropY), fabric.util.degreesToRadians(clippingMask.angle || 0));
                // @ts-ignore
                clippingMask.originalImageObject.top = clippingMask.top - point.y;
                // @ts-ignore
                clippingMask.originalImageObject.left = clippingMask.left - point.x;
                clippingMask.originalImageObject.scaleX *= clippingMask.scaleX || 1;
                clippingMask.originalImageObject.scaleY *= clippingMask.scaleY || 1;
                clippingMask.originalImageObject.sectionIndex = clippingMask.sectionIndex;
                clippingMask.originalImageObject.angle = clippingMask.angle;
                if (clippingMask.alwaysOnTop) {
                    clippingMask.originalImageObject.alwaysOnTop = clippingMask.alwaysOnTop;
                    clippingMask.originalClipPathObject.alwaysOnTop = clippingMask.alwaysOnTop;
                }
                var items = [];
                if ((clippingMask.indexImage > clippingMask.indexClipPath && !clippingMask.alwaysOnTop)
                    || (clippingMask.indexImage < clippingMask.indexClipPath && clippingMask.alwaysOnTop)) {
                    items.push(clippingMask.originalImageObject);
                    items.push(clippingMask.originalClipPathObject);
                }
                if ((clippingMask.indexImage < clippingMask.indexClipPath && !clippingMask.alwaysOnTop)
                    || (clippingMask.indexImage > clippingMask.indexClipPath && clippingMask.alwaysOnTop)) {
                    items.push(clippingMask.originalClipPathObject);
                    items.push(clippingMask.originalImageObject);
                }
                if (clippingMask.originalImageObject.alwaysOnTop && !clippingMask.originalClipPathObject.alwaysOnTop) {
                    items = [];
                    items.push(clippingMask.originalImageObject);
                    items.push(clippingMask.originalClipPathObject);
                }
                addElements(items, section, index + 1, clippingMask.alwaysOnTop ? clippingMaskElementKey : undefined);
                var orderArray = __spreadArray([], masterPageData.getOrderArray(section).value, true);
                if (clippingMask.alwaysOnTop) {
                    orderArray.splice(index + 2, 1);
                }
                else {
                    orderArray.splice(index, 1);
                }
                masterPageData.getOrderArray().value = orderArray;
                changeCanvas();
            }
        }
        this.on('mousedblclick', function () {
            var _a;
            if (!_this.canvas) {
                return;
            }
            // if (this.canvas?.disableObjectActions) {
            //   return;
            // }
            // if (['frozen', 'frozenDeletable'].includes(this.freeze) || !this.selectable) {
            //   return;
            // }
            // @ts-ignore
            // this.canvas.off('mouse:down', this.onMouseDown);
            (_a = _this.canvas) === null || _a === void 0 ? void 0 : _a.forEachObject(function (object) {
                object.isClipping = false;
                object.isCropping = false;
            });
            _this.isClipping = true;
            _this.canvas.setActiveObject(_this);
            _this.canvas.requestRenderAll();
        });
        // this.on('resizing', (event: any) => {
        //   const { transform } = event;
        //   const { target: fabricObject } = transform;
        //   // fabricObject.clippingPath.set('width', fabricObject.width);
        //   const ratioWidthAndHeightClipPath = fabricObject.clippingPath.getScaledWidth() / fabricObject.clippingPath.getScaledHeight();
        //   const ratioWidthAndHeightImage = fabricObject.getScaledWidth() / fabricObject.getScaledHeight();
        //   // originalImage.angle = 0;
        //   if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
        //     console.log('if');
        //     const scale = fabricObject.scaleY / fabricObject.scaleX;
        //   //   // console.log(fabricObject.clippingPath.getScaledWidth(), 'fabricObject.clippingPath.getScaledWidth()');
        //     const scaleToWidth = fabricObject.clippingPath.getScaledWidth() / fabricObject.width;
        //   //   console.log(fabricObject.clippingPath.getScaledWidth(), 'fabricObject.clippingPath.getScaledWidth(')
        //   //   console.log(fabricObject.width, 'fabricObject.width')
        //     console.log(scaleToWidth, 'scaleToWidth');
        //     // fabricObject.scaleX = scaleToWidth;
        //     // fabricObject.scale(scaleToWidth);
        //   //   // fabricObject.clippingPath.scaleX /= scaleToWidth;
        //   //   // fabricObject.clippingPath.scaleY /= scaleToWidth;
        //   //   // originalImage.scaleY = scale * originalImage.scaleX;
        //   //   // fabricObject.scaleToWidth(fabricObject.clippingPath.width);
        //   //   // console.log(fabricObject.scaleX, 'scaleX');
        //   //   // console.log(fabricObject.scaleY, 'scaleY');
        //   //   // fabricObject.scaleY = scale * fabricObject.scaleX;
        //   } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
        //   //   console.log('else');
        //   //   const scale = fabricObject.scaleX / fabricObject.scaleY;
        //   //   const scaleToHeight = fabricObject.clippingPath.getScaledHeight() / fabricObject.height;
        //   //   console.log(scaleToHeight, 'scaleToHeight');
        //   //   // fabricObject.scale(scaleToHeight);
        //   //   // fabricObject.scaleX = scale * fabricObject.scaleY;
        //   }
        //   // if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
        //   //   const scale = originalImage.scaleY / originalImage.scaleX;
        //   //   originalImage.scaleToWidth(originalClipPath.getScaledWidth());
        //   //   originalImage.scaleY = scale * originalImage.scaleX;
        //   // } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
        //   //   const scale = originalImage.scaleX / originalImage.scaleY;
        //   //   originalImage.scaleToHeight(originalClipPath.getScaledHeight());
        //   //   originalImage.scaleX = scale * originalImage.scaleY;
        //   // }
        //   // const imageLeft = originalClipPath.left - ((originalImage.getScaledWidth() - originalClipPath.getScaledWidth()) / 2);
        //   // const imageTop = originalClipPath.top - ((originalImage.getScaledHeight() - originalClipPath.getScaledHeight()) / 2);
        //   // return {
        //   //   imageLeft,
        //   //   imageTop,
        //   // };
        // });
        // this.on('resizing', (event: any) => {
        //   const { transform } = event;
        //   const { target: fabricObject } = transform;
        //   // const { scaleFactor } = event.transform.original.clippingPath;
        //   // console.log(scaleFactor, 'scaleFactor');
        //   const ratioWidthAndHeightText = fabricObject.clippingPath.getScaledWidth() / fabricObject.clippingPath.getScaledHeight();
        //   const ratioWidthAndHeightImage = fabricObject.getScaledWidth() / fabricObject.getScaledHeight();
        //   if (ratioWidthAndHeightText >= ratioWidthAndHeightImage) {
        //     const scale = fabricObject.scaleY / fabricObject.scaleX;
        //     console.log(scale, 'scale if')
        //     const scaleToWidth = fabricObject.getScaledWidth() / fabricObject.clippingPath.width;
        //     console.log(scaleToWidth, 'scaleToWidth');
        //     fabricObject.scale(scaleToWidth);
        //   } else if (ratioWidthAndHeightText <= ratioWidthAndHeightImage) {
        //     const scale = fabricObject.scaleX / fabricObject.scaleY;
        //     console.log(scale, 'scale else')
        //     const scaleToHeight = fabricObject.getScaledHeight() / fabricObject.clippingPath.height;
        //     console.log(scaleToHeight, 'scaleToHeight')
        //   }
        //   // fabricObject.clippingPath.setCoords();
        //   // const ratioWidthAndHeightText = fabricObject.getScaledWidth() / fabricObject.getScaledHeight();
        //   // const ratioWidthAndHeightImage = fabricObject.clippingPath.getScaledWidth() / fabricObject.clippingPath.getScaledHeight();
        //   // if (ratioWidthAndHeightText >= ratioWidthAndHeightImage) {
        //   //   const scale = fabricObject.clippingPath.scaleY / fabricObject.clippingPath.scaleX;
        //   //   const scaleToWidth = fabricObject.getScaledWidth() / fabricObject.clippingPath.width;
        //   //   fabricObject.clippingPath.scale(scaleToWidth);
        //   //   fabricObject.clippingPath.scaleY = scale * fabricObject.clippingPath.scaleX;
        //   // } else if (ratioWidthAndHeightText <= ratioWidthAndHeightImage) {
        //   //   const scale = fabricObject.clippingPath.scaleX / fabricObject.clippingPath.scaleY;
        //   //   const scaleToHeight = fabricObject.getScaledHeight() / fabricObject.clippingPath.height;
        //   //   fabricObject.clippingPath.scale(scaleToHeight);
        //   //   fabricObject.clippingPath.scaleX = scale * fabricObject.clippingPath.scaleY;
        //   // }
        //   // fabricObject.pattern.scaleX *= scaleFactor;
        //   // fabricObject.pattern.scaleY *= scaleFactor;
        //   // const width = fabricObject.clippingPath.getScaledWidth();
        //   // const height = fabricObject.clippingPath.getScaledHeight();
        //   // const w = fabricObject.getScaledWidth();
        //   // const h = fabricObject.getScaledHeight();
        //   // const distanceX = (width - w) / 2;
        //   // const distanceY = (height - h) / 2;
        //   // let { cropX, cropY } = fabricObject;
        //   // // verify bounds
        //   // if (cropX < -distanceX) {
        //   //   cropX = -distanceX;
        //   // } else if (cropX > distanceX) {
        //   //   cropX = distanceX;
        //   // }
        //   // if (cropY < -distanceY) {
        //   //   cropY = -distanceY;
        //   // } else if (cropY > distanceY) {
        //   //   cropY = distanceY;
        //   // }
        //   // fabricObject.cropX = cropX;
        //   // fabricObject.cropY = cropY;
        //   // const center = fabricObject.getCenterPoint();
        //   // const centerPattern = fabricObject.clippingPath.getCenterPoint();
        //   // const pointCrop = new fabric.Point(cropX, cropY);
        //   // const point = fabric.util.rotateVector(pointCrop, fabric.util.degreesToRadians(this.angle));
        //   // fabricObject.clippingPath.left += (center.x - centerPattern.x) - point.x;
        //   // fabricObject.clippingPath.top += (center.y - centerPattern.y) - point.y;
        //   // fabricObject.clippingPath.setCoords();
        // });
    };
    EditorClippingMask.prototype.calcImageByClipPath = function () {
        var clippingPath = this.clippingPath;
        // @ts-ignore
        var point1 = this.getPointByOrigin(this.originX, this.originY);
        var point2 = clippingPath.getPointByOrigin(clippingPath.originX, clippingPath.originY);
        var cropX = (point2.x - point1.x) || 0;
        var cropY = (point2.y - point1.y) || 0;
        var width = clippingPath.getScaledWidth();
        var height = clippingPath.getScaledHeight();
        var tl = clippingPath.calcACoords().tl;
        this.setPositionByOrigin(tl, 'left', 'top');
        return {
            cropX: cropX,
            cropY: cropY,
            width: width,
            height: height,
        };
    };
    EditorClippingMask.prototype._render = function (ctx) {
        if (!this.canvas) {
            return;
        }
        this._elementToDraw = this._element;
        // ctx can be either the cacheCtx or the main ctx.
        this.canvas.contextContainer.save();
        this._removeShadow(this.canvas.contextContainer); // main context
        ctx.save(); // main or cache context
        this._renderClippingBackground(ctx);
        // this._renderClippingByShape(ctx);
        // this._renderClippingByImage(ctx);
        this._renderClippingByText(ctx);
        // if (!this.isPreviewClippingMask && !this.isCreateFirst) {
        //   this.isCreateFirst = true;
        //   fireClippingMaskEvent(this);
        // }
        // this._drawClippingLines(ctx);
        ctx.restore();
        this.canvas.contextContainer.restore();
        // this.cacheWidth = this.width + this.strokeWidth;
        // this.cacheHeight = this.height + this.strokeWidth;
    };
    EditorClippingMask.prototype._renderClippingBackground = function (ctx) {
        if (this.isClipping) {
            ctx.save();
            var width = this.width;
            var height = this.height;
            var elementToDraw = this._elementToDraw;
            ctx.globalAlpha = this.cropOpacity;
            // const padding = this.getElementPadding();
            var padding = 0;
            var elWidth = this.getElementWidth() - padding;
            var elHeight = this.getElementHeight() - padding;
            var imageCopyX = -this.cropX - width / 2;
            var imageCopyY = -this.cropY - height / 2;
            // const sX = (this.originalScaleX || this.scaleX);
            // const sY = (this.originalScaleX || this.scaleX);
            // ctx.scale(sX, sY);
            ctx.drawImage(elementToDraw, imageCopyX, imageCopyY, elWidth, elHeight);
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    };
    EditorClippingMask.prototype._renderClippingByText = function (ctx) {
        if (this.clippingPath) {
            var _a = this, width = _a.width, height = _a.height;
            var elementToDraw = this._elementToDraw;
            var clipPathScaleFactorX = this.clippingPath.scaleX;
            var clipPathScaleFactorY = this.clippingPath.scaleY;
            var canvasClippingPath = fabric.util.createCanvasElement();
            canvasClippingPath.width = this.clippingPath.getScaledWidth();
            canvasClippingPath.height = this.clippingPath.getScaledHeight();
            var ctxClippingPath = canvasClippingPath.getContext('2d');
            ctxClippingPath.save();
            ctxClippingPath.scale(clipPathScaleFactorX, clipPathScaleFactorY);
            ctxClippingPath.translate(this.clippingPath.width / 2, this.clippingPath.height / 2);
            this.clippingPath._render(ctxClippingPath);
            ctxClippingPath.restore();
            var canvasEl = fabric.util.createCanvasElement();
            canvasEl.width = this.clippingPath.getScaledWidth();
            canvasEl.height = this.clippingPath.getScaledHeight();
            var ctxEl = canvasEl.getContext('2d');
            ctxEl.save();
            // console.log(this.cropY, 'this.cropY')
            if (elementToDraw) {
                // const elWidth = elementToDraw.naturalWidth || elementToDraw.width;
                // const elHeight = elementToDraw.naturalHeight || elementToDraw.height;
                // ctxEl.scale((this.originalScaleX || this.scaleX), (this.originalScaleY || this.scaleY));
                // ctxEl.drawImage(
                //   elementToDraw,
                //   this.cropX,
                //   this.cropY,
                //   Math.max(1, Math.floor(elWidth)),
                //   Math.max(1, Math.floor(elHeight)),
                //   (canvasEl.width / 2 - width / 2),
                //   (canvasEl.height / 2 - height / 2),
                //   Math.max(0, Math.floor(elWidth)),
                //   Math.max(0, Math.floor(elHeight)),
                // );
                // ctxEl.restore();
                ctxEl.save();
                var scaleX = this._filterScalingX;
                var scaleY = this._filterScalingY;
                var w = this.width, h = this.height, 
                // crop values cannot be lesser than 0.
                cropX = Math.max(this.cropX, 0), cropY = Math.max(this.cropY, 0), elWidth = elementToDraw.naturalWidth || elementToDraw.width, elHeight = elementToDraw.naturalHeight || elementToDraw.height, sX = cropX * scaleX, sY = cropY * scaleY, 
                // the width height cannot exceed element width/height, starting from the crop offset.
                sW = Math.min(w * scaleX, elWidth - sX), sH = Math.min(h * scaleY, elHeight - sY), 
                // x = -w / 2,
                // y = -h / 2,
                x = canvasEl.width / 2 - w / 2, y = canvasEl.height / 2 - h / 2, maxDestW = Math.min(w, elWidth / scaleX - cropX), maxDestH = Math.min(h, elHeight / scaleY - cropY);
                //   ctxEl.scale(this.originalScaleX || this.scaleX, this.originalScaleY || this.scaleY);
                // ctxEl.drawImage(elementToDraw, sX, sY, sW, sH, x, y, maxDestW, maxDestH);
                ctxEl.scale(this.originalScaleX || this.scaleX, this.originalScaleY || this.scaleY);
                ctxEl.drawImage(elementToDraw, sX, sY, elWidth, elHeight, x, y, elWidth, elHeight);
                ctxEl.restore();
            }
            // ctxEl.globalCompositeOperation = 'destination-atop';
            ctxEl.drawImage(ctxClippingPath.canvas, 0, 0);
            ctxEl.restore();
            // console.log(ctxEl.canvas.toDataURL(), 'ctxEl.canvas');
            ctx.drawImage(ctxEl.canvas, -width / 2, -height / 2);
        }
    };
    EditorClippingMask.prototype._renderClippingByImage = function (ctx) {
        if (this.clippingPath && (this.clippingPath.type === 'image' || this.clippingPath.type === 'svg')) {
            var angl = this.clippingPath.angle;
            this.clippingPath.angle = 0;
            var _a = this, width = _a.width, height = _a.height;
            var elementToDraw = this._elementToDraw;
            var clipPathScaleFactorX = this.clippingPath.scaleX;
            var clipPathScaleFactorY = this.clippingPath.scaleY;
            // if (this.isClipping) {
            // if (!this._clippingCanvas) {
            //   this._createClippingCanvas();
            // }
            // if (this.isClippingDirty()) {
            //   const padding = this.getElementPadding() / 2;
            //   // eslint-disable-next-line no-unused-expressions
            //   this._clippingContext.drawImage(
            //     elementToDraw,
            //     this.cropX + padding,
            //     this.cropY + padding,
            //     Math.max(1, Math.floor(width)),
            //     Math.max(1, Math.floor(height)),
            //     -width / 2,
            //     -height / 2,
            //     Math.max(0, Math.floor(width)),
            //     Math.max(0, Math.floor(height)),
            //   );
            //   this.clippingPath.canvas = this.canvas;
            //   this.clippingPath._transformDone = true;
            //   if (!this.clippingPath._clippingCanvas) {
            //     this.clippingPath._createClippingCanvas();
            //   }
            //   if (this.clippingPath.isClippingDirty()) {
            //     const scaleX = this.clippingPath._filterScalingX; const scaleY = this.clippingPath._filterScalingY;
            //     const w = this.clippingPath.width; const h = this.clippingPath.height; const { min } = Math; const { max } = Math;
            //     // crop values cannot be lesser than 0.
            //     const cropX = max(this.clippingPath.cropX, 0); const cropY = max(this.clippingPath.cropY, 0);
            //     const elWidth = this.clippingPath._element.naturalWidth || this.clippingPath._element.width;
            //     const elHeight = this.clippingPath._element.naturalHeight || this.clippingPath._element.height;
            //     const sX = cropX * scaleX;
            //     const sY = cropY * scaleY;
            //     // the width height cannot exceed element width/height, starting from the crop offset.
            //     const sW = min(w * scaleX, elWidth - sX);
            //     const sH = min(h * scaleY, elHeight - sY);
            //     const x = -w / 2; const y = -h / 2;
            //     const maxDestW = min(w, elWidth / scaleX - cropX);
            //     const maxDestH = min(h, elHeight / scaleY - cropY);
            //     this.clippingPath._clippingContext.drawImage(this.clippingPath._element, sX, sY, sW, sH, x, y, maxDestW, maxDestH);
            //     this.clippingPath.clippingDirty = false;
            //   }
            //   this._clippingContext.save();
            //   this._clippingContext.globalCompositeOperation = 'destination-atop';
            //   this._clippingContext.scale(clipPathScaleFactorX / this.clippingPath.zoomX, clipPathScaleFactorY / this.clippingPath.zoomY);
            //   this._clippingContext.drawImage(
            //     this.clippingPath._clippingCanvas,
            //     -this.clippingPath.clippingTranslationX,
            //     -this.clippingPath.clippingTranslationY,
            //   );
            //   this._clippingContext.restore();
            //   this.clippingDirty = false;
            // }
            // ctx.scale(1 / this.zoomX, 1 / this.zoomY);
            // ctx.drawImage(this._clippingCanvas, -this.clippingTranslationX, -this.clippingTranslationY);
            // } else {
            // this._setCStroke(ctx, true);
            var canvas = fabric.util.createCanvasElement();
            canvas.width = this.clippingPath.getScaledWidth();
            canvas.height = this.clippingPath.getScaledHeight();
            var ctxEl = canvas.getContext('2d');
            ctxEl.save();
            if (elementToDraw) {
                // const padding = this.getElementPadding();
                var padding = 0;
                ctxEl.drawImage(elementToDraw, this.cropX + padding, this.cropY + padding, Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)), canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, Math.max(0, Math.floor(width)), Math.max(0, Math.floor(height)));
            }
            ctxEl.globalCompositeOperation = 'destination-atop';
            ctxEl.scale(clipPathScaleFactorX, clipPathScaleFactorY);
            ctxEl.drawImage(
            // @ts-ignore
            this.clippingPath._element, -this.clippingPath.cropX - (canvas.width / 2 - width / 2), -this.clippingPath.cropY - (canvas.height / 2 - height / 2));
            ctxEl.restore();
            ctx.drawImage(ctxEl.canvas, -width / 2, -height / 2);
            // }
            this.clippingPath.angle = angl;
        }
    };
    EditorClippingMask.prototype._getOriginalTransformedDimensions = function (options) {
        if (options === void 0) { options = {}; }
        var dimOptions = __assign({ scaleX: this.scaleX, scaleY: this.scaleY, skewX: this.skewX, skewY: this.skewY, width: this.getOriginalElementWidth(), height: this.getOriginalElementHeight(), strokeWidth: this.strokeWidth }, options);
        // stroke is applied before/after transformations are applied according to `strokeUniform`
        var strokeWidth = dimOptions.strokeWidth;
        var preScalingStrokeValue = strokeWidth, postScalingStrokeValue = 0;
        if (this.strokeUniform) {
            preScalingStrokeValue = 0;
            postScalingStrokeValue = strokeWidth;
        }
        var dimX = dimOptions.width + preScalingStrokeValue, dimY = dimOptions.height + preScalingStrokeValue, noSkew = dimOptions.skewX === 0 && dimOptions.skewY === 0;
        var finalDimensions;
        if (noSkew) {
            finalDimensions = new fabric.Point(dimX * dimOptions.scaleX, dimY * dimOptions.scaleY);
        }
        else {
            finalDimensions = fabric.util.sizeAfterTransform(dimX, dimY, dimOptions);
        }
        return finalDimensions.scalarAdd(postScalingStrokeValue);
    };
    EditorClippingMask.fromObject = function (_a, options) {
        var _this = this;
        var f = _a.filters, rf = _a.resizeFilter, src = _a.src, crossOrigin = _a.crossOrigin, object = __rest(_a, ["filters", "resizeFilter", "src", "crossOrigin"]);
        return Promise.all([
            fabric.util.loadImage(src, __assign(__assign({}, options), { crossOrigin: crossOrigin })),
            f && fabric.util.enlivenObjects(f, options),
            rf && fabric.util.enlivenObjects([rf], options),
            // fabric.util.enlivenObjectEnlivables(object, options),
        ]).then(function (_a) {
            var el = _a[0], _b = _a[1], filters = _b === void 0 ? [] : _b, _c = _a[2], _d = _c === void 0 ? [] : _c, resizeFilter = _d[0], _e = _a[3], hydratedProps = _e === void 0 ? {} : _e;
            var item = new _this(el, __assign(__assign(__assign({}, object), { src: src, crossOrigin: crossOrigin, filters: filters, resizeFilter: resizeFilter }), hydratedProps));
            var element = object.__element;
            if (element) {
                item.setElement(element);
                item._setWidthHeight();
            }
            return item;
        });
    };
    return EditorClippingMask;
}(EditorImage));
export { EditorClippingMask };
export var clippingMaskDefaultValues = {
    type: 'clipping-mask',
    _styleProperties: [
        'stroke',
        'strokeWidth',
        'fill',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'underline',
        'overline',
        'linethrough',
        'deltaY',
        'textBackgroundColor',
    ],
};
Object.assign(EditorClippingMask.prototype, __assign({}, clippingMaskDefaultValues));
if (typeof EditorClippingMask.prototype.isClipping === 'undefined') {
    extendWithClippingMask(EditorClippingMask);
}
fabric.util.classRegistry.setClass(EditorClippingMask);
fabric.util.classRegistry.setSVGClass(EditorClippingMask);
