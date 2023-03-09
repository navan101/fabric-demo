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
import { defaultControls } from '../controls/clipping-text-1/clipping-text.controls';
import * as fabric from 'fabric';
import { extendWithClippingText } from '../mixins/clipping-text-1.mixin';
// fabric.Object.prototype._getTransformedDimensions = function(options: any = {}): fabric.Point {
//   const dimOptions = {
//     scaleX: this.scaleX,
//     scaleY: this.scaleY,
//     skewX: this.skewX,
//     skewY: this.skewY,
//     // @ts-ignore
//     width: this.isClipping ? this.clippingPath.getScaledWidth() :  this.width,
//     // @ts-ignore
//     height: this.isClipping ? this.clippingPath.getScaledHeight() : this.height,
//     strokeWidth: this.strokeWidth,
//     ...options,
//   };
//   // stroke is applied before/after transformations are applied according to `strokeUniform`
//   const strokeWidth = dimOptions.strokeWidth;
//   let preScalingStrokeValue = strokeWidth,
//     postScalingStrokeValue = 0;
//   if (this.strokeUniform) {
//     preScalingStrokeValue = 0;
//     postScalingStrokeValue = strokeWidth;
//   }
//   const dimX = dimOptions.width + preScalingStrokeValue,
//     dimY = dimOptions.height + preScalingStrokeValue,
//     noSkew = dimOptions.skewX === 0 && dimOptions.skewY === 0;
//   let finalDimensions;
//   if (noSkew) {
//     finalDimensions = new fabric.Point(
//       dimX * dimOptions.scaleX,
//       dimY * dimOptions.scaleY
//     );
//   } else {
//     finalDimensions = fabric.util.sizeAfterTransform(dimX, dimY, dimOptions);
//   }
//   return finalDimensions.scalarAdd(postScalingStrokeValue);
// }
var EditorTextbox = /** @class */ (function (_super) {
    __extends(EditorTextbox, _super);
    function EditorTextbox(text, options) {
        var _this = this;
        var _a;
        _this = _super.call(this, text, options) || this;
        _this.cropOpacity = 0.5;
        _this.stateProperties = (_a = fabric.Textbox.prototype.stateProperties) === null || _a === void 0 ? void 0 : _a.concat('clippingPath', 'isClipping', 'cropX', 'cropY');
        _this.cacheProperties = fabric.Textbox.prototype.cacheProperties.concat('clippingPath', 'isClipping', 'cropX', 'cropY');
        _this.controls = defaultControls;
        _this.objectCaching = true;
        return _this;
        // this.on('resizing', (event: any) => {
        //   const { transform } = event;
        //   const { target: fabricObject } = transform;
        //   // const { scaleFactor } = event.transform.original.pattern;
        //   fabricObject.clippingPath.setCoords();
        //   const ratioWidthAndHeightText = fabricObject.getScaledWidth() / fabricObject.getScaledHeight();
        //   const ratioWidthAndHeightImage = fabricObject.clippingPath.getScaledWidth() / fabricObject.clippingPath.getScaledHeight();
        //   if (ratioWidthAndHeightText >= ratioWidthAndHeightImage) {
        //     const scale = fabricObject.clippingPath.scaleY / fabricObject.clippingPath.scaleX;
        //     const scaleToWidth = fabricObject.getScaledWidth() / fabricObject.clippingPath.width;
        //     fabricObject.clippingPath.scale(scaleToWidth);
        //     fabricObject.clippingPath.scaleY = scale * fabricObject.clippingPath.scaleX;
        //   } else if (ratioWidthAndHeightText <= ratioWidthAndHeightImage) {
        //     const scale = fabricObject.clippingPath.scaleX / fabricObject.clippingPath.scaleY;
        //     const scaleToHeight = fabricObject.getScaledHeight() / fabricObject.clippingPath.height;
        //     fabricObject.clippingPath.scale(scaleToHeight);
        //     fabricObject.clippingPath.scaleX = scale * fabricObject.clippingPath.scaleY;
        //   }
        //   // fabricObject.pattern.scaleX *= scaleFactor;
        //   // fabricObject.pattern.scaleY *= scaleFactor;
        //   const width = fabricObject.clippingPath.getScaledWidth();
        //   const height = fabricObject.clippingPath.getScaledHeight();
        //   const w = fabricObject.getScaledWidth();
        //   const h = fabricObject.getScaledHeight();
        //   const distanceX = (width - w) / 2;
        //   const distanceY = (height - h) / 2;
        //   let { cropX, cropY } = fabricObject;
        //   // verify bounds
        //   if (cropX < -distanceX) {
        //     cropX = -distanceX;
        //   } else if (cropX > distanceX) {
        //     cropX = distanceX;
        //   }
        //   if (cropY < -distanceY) {
        //     cropY = -distanceY;
        //   } else if (cropY > distanceY) {
        //     cropY = distanceY;
        //   }
        //   fabricObject.cropX = cropX;
        //   fabricObject.cropY = cropY;
        //   const center = fabricObject.getCenterPoint();
        //   const centerPattern = fabricObject.clippingPath.getCenterPoint();
        //   const pointCrop = new fabric.Point(cropX, cropY);
        //   const point = fabric.util.rotateVector(pointCrop, fabric.util.degreesToRadians(this.angle));
        //   fabricObject.clippingPath.left += (center.x - centerPattern.x) - point.x;
        //   fabricObject.clippingPath.top += (center.y - centerPattern.y) - point.y;
        //   fabricObject.clippingPath.setCoords();
        // });
    }
    // render(ctx: CanvasRenderingContext2D) {
    //   super.render(ctx);
    // }
    EditorTextbox.prototype._render = function (ctx) {
        _super.prototype._render.call(this, ctx);
        this._renderClippingText(ctx);
        this._renderClippingBackground(ctx);
    };
    EditorTextbox.prototype._renderClippingBackground = function (ctx) {
        if (this.isClipping) {
            ctx.save();
            var clipPathScaleFactorX = this.clippingPath.scaleX;
            var clipPathScaleFactorY = this.clippingPath.scaleY;
            var width = this.width;
            var height = this.height;
            var elementToDraw = this.clippingPath.getElement();
            ctx.globalAlpha = this.cropOpacity;
            // const padding = this.getElementPadding();
            var padding = 0;
            // const width = this.clippingPath.width;
            // const height = this.clippingPath.height;
            // @ts-ignore
            // const elWidth = this.clippingPath.getElementWidth();
            var elWidth = elementToDraw.naturalWidth || elementToDraw.width;
            // @ts-ignore
            var elHeight = elementToDraw.naturalHeight || elementToDraw.height;
            // @ts-ignore
            // const elHeight = this.clippingPath.getElementHeight();
            var imageCopyX = -this.cropX - width / 2;
            var imageCopyY = -this.cropY - height / 2;
            // const dx = -this.cropX + this.clippingPath.width - this.width / 2;
            // const dy = -this.cropY + this.clippingPath.height - this.height / 2;
            ctx.drawImage(elementToDraw, imageCopyX, imageCopyY, elWidth, elHeight);
            ctx.restore();
            ctx.globalAlpha = 1;
            // ctx.save();
            // ctx.globalAlpha = 0.5;
            // // ctxToDraw.globalCompositeOperation = 'source-atop';
            // ctx.scale(clipPathScaleFactorX, clipPathScaleFactorY);
            // this.clippingPath._render(ctx);
            // ctx.restore();
            // ctx.globalAlpha = 1;
        }
    };
    EditorTextbox.prototype._renderClippingText = function (ctx) {
        // console.log(this.clippingPath, 'this.clippingPath');
        if (!this.clippingPath || this.isNotVisible()) {
            return;
        }
        var clipPathScaleFactorX = this.clippingPath.scaleX;
        var clipPathScaleFactorY = this.clippingPath.scaleY;
        if (!this._cacheClippingPathCanvas) {
            this._cacheClippingPathCanvas = fabric.util.createCanvasElement();
        }
        var canvas = this._cacheClippingPathCanvas;
        var ctxToDraw = canvas.getContext('2d');
        ctxToDraw.save();
        if (canvas.width !== ctx.canvas.width
            || canvas.height !== ctx.canvas.height) {
            canvas.width = ctx.canvas.width;
            canvas.height = ctx.canvas.height;
        }
        else {
            ctxToDraw.setTransform(1, 0, 0, 1, 0, 0);
            ctxToDraw.clearRect(0, 0, canvas.width, canvas.height);
        }
        var transform = ctx.getTransform();
        ctxToDraw.setTransform(transform);
        ctxToDraw.save();
        // const path = this.path;
        // path && !path.isNotVisible() && path._render(ctx);
        // this._setTextStyles(ctx);
        // this._renderTextLinesBackground(ctx);
        // this._renderTextDecoration(ctx, 'underline');
        this._renderText(ctxToDraw);
        // this._renderTextDecoration(ctx, 'overline');
        // this._renderTextDecoration(ctx, 'linethrough');
        ctxToDraw.restore();
        ctxToDraw.save();
        // ctxToDraw.globalCompositeOperation = 'source-atop';
        ctxToDraw.scale(clipPathScaleFactorX, clipPathScaleFactorY);
        this.clippingPath._render(ctxToDraw);
        ctxToDraw.restore();
        // if (this.isClipping) {
        //   console.log(this.cropX, 'this.cropX')
        //   console.log(this.cropY, 'this.cropY');
        //   ctx.save();
        //   ctx.globalAlpha = 0.5;
        //   const dx = -this.cropX + this.clippingPath.width - this.width / 2;
        //   const dy = -this.cropY + this.clippingPath.height - this.height / 2;
        //   console.log(dx, 'dx')
        //   console.log(dy, 'dy')
        //   // ctx.translate(-this.cropX, -this.cropY);
        //   ctx.scale(clipPathScaleFactorX, clipPathScaleFactorY);
        //   this.clippingPath._render(ctx);
        //   ctx.restore()
        // }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._setOpacity(ctx);
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctxToDraw.restore();
    };
    EditorTextbox.prototype.calcTextByClipPath = function () {
        var clippingPath = this.clippingPath;
        // @ts-ignore
        var point1 = this.getPointByOrigin(this.originX, this.originY);
        var point2 = clippingPath.getPointByOrigin(clippingPath.originX, clippingPath.originY);
        var cropX = (point1.x - point2.x) || 0;
        var cropY = (point1.y - point2.y) || 0;
        // const width = clippingPath.getScaledWidth();
        // const height = clippingPath.getScaledHeight();
        // const { tl } = clippingPath.calcACoords();
        // this.setPositionByOrigin(tl, 'left', 'top');
        return {
            cropX: cropX,
            cropY: cropY,
            // width,
            // height,
        };
    };
    // drawBorders(ctx: CanvasRenderingContext2D, styleOverride: any) {
    //   // this.callSuper('drawBorders', ctx, styleOverride);
    //   this._renderClippingBorders(ctx, styleOverride);
    //   super.drawBorders(ctx, {
    //     angle: this.angle,
    //     scaleX: this.scaleX,
    //     scaleY: this.scaleY,
    //     skewX: this.skewX,
    //     skewY: this.skewY,
    //     translateX: this.left,
    //     translateY: this.top,
    //   }, styleOverride)
    // }
    EditorTextbox.prototype._renderClippingBorders = function (ctx, styleOverride) {
        if (styleOverride === void 0) { styleOverride = {}; }
        if (!this.canvas || !this.clippingPath || !this.isClipping) {
            return;
        }
        // const coords = this.pattern._getCoords(true, true);
        var _a = this.clippingPath.getCoords(true, true), tl = _a[0], tr = _a[1], br = _a[2], bl = _a[3];
        var vpt = this.canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        var vpt4 = vpt[4];
        var vpt5 = vpt[5];
        // @ts-ignore
        var devicePixelRatio = fabric.devicePixelRatio;
        var zoom = this.canvas.getZoom();
        if (this.canvas && this.canvas._isRetinaScaling()) {
            vpt4 *= devicePixelRatio;
            vpt5 *= devicePixelRatio;
            zoom *= devicePixelRatio;
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tl.x * zoom + vpt4, tl.y * zoom + vpt5);
        ctx.lineTo(tr.x * zoom + vpt4, tr.y * zoom + vpt5);
        ctx.lineTo(br.x * zoom + vpt4, br.y * zoom + vpt5);
        ctx.lineTo(bl.x * zoom + vpt4, bl.y * zoom + vpt5);
        ctx.lineTo(tl.x * zoom + vpt4, tl.y * zoom + vpt5);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    };
    EditorTextbox.fromObject = function (object) {
        var item = this._fromObject(__assign({}, object), {
            extraParam: 'text',
        });
        return item;
    };
    return EditorTextbox;
}(fabric.Textbox));
export { EditorTextbox };
export var textboxDefaultValues = {
    cropX: 0,
    cropY: 0,
};
Object.assign(EditorTextbox.prototype, textboxDefaultValues);
if (typeof EditorTextbox.prototype.isClipping === 'undefined') {
    extendWithClippingText(EditorTextbox);
}
fabric.util.classRegistry.setClass(EditorTextbox);
