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
import * as fabric from 'fabric';
import { extendWithClippingMask } from 'mixins/clipping-mask.mixin';
// const CorjlText: any = {
//   _measureText(font: any, text: string, fontSize: number) {
//     const { yMax,yMin, xMax, xMin } = font.tables.head;
//     const scale = 1 / font.unitsPerEm * fontSize;
//     return {
//         yMax: yMax * scale,
//         yMin: yMin * scale,
//         xMax: xMax * scale,
//         xMin: xMin * scale,
//     };
//   },
//   _getCacheCanvasDimensions() {
//     let fontHeight = 0;
//     let fontWidth = 0;
//     if (this.fontload) {
//       const font = this.fontload();
//       const metrics = this._measureText(font, this.text, this.fontSize);
//       fontHeight = metrics.yMax - metrics.yMin;
//       fontWidth = metrics.xMax - metrics.xMin;
//     }
//     const dims = fabric.Object.prototype._getCacheCanvasDimensions.call(this);
//     const extendSize = this.strokeWidth || 0;
//     const fontSize = this.fontSize;
//     dims.width += (fontSize + fontWidth) * dims.zoomX + extendSize;
//     dims.height += (fontSize + fontHeight) * dims.zoomY + extendSize;
//     return dims;
//   }
// }
// extend(fabric.Text.prototype, CorjlText);
var ClippingText = /** @class */ (function (_super) {
    __extends(ClippingText, _super);
    function ClippingText(text, options) {
        var _this = _super.call(this, text, options) || this;
        _this.cropX = 0;
        _this.cropY = 0;
        _this.cacheProperties = fabric.Textbox.prototype.cacheProperties.concat('clippingPath');
        return _this;
    }
    // render(ctx: CanvasRenderingContext2D) {
    //   super.render(ctx);
    //   this._renderClippingText(ctx);
    // }
    ClippingText.prototype._render = function (ctx) {
        _super.prototype._render.call(this, ctx);
        this._renderClippingText(ctx);
    };
    ClippingText.prototype._renderClippingText = function (ctx) {
        if (!this.clippingPath || this.isNotVisible()) {
            return;
        }
        console.log(this.clippingPath, 'this.clippingPath');
        // this.updatePatternRotateIfNeed();
        // this.updatePatternTopLeftIfNeed();
        // const orignalElement = this.pattern._element;
        // const originalStroke = this.stroke;
        // const originalShadow = this.shadow;
        // const originalOuterGlow = this.outerGlow;
        // if (this.tileImageOption.enabled) {
        //   this.pattern._element = this._getTileImagePatternCanvas();
        // }
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
        // ctxToDraw.save();
        // this.transform(ctxToDraw);
        // this._render(ctxToDraw);
        // ctxToDraw.restore();
        // ctxToDraw.save();
        // this.clippingPath.transform(ctxToDraw);
        // ctxToDraw.globalCompositeOperation = 'source-atop';
        // this.clippingPath._render(ctxToDraw);
        // ctxToDraw.restore();
        ctxToDraw.save();
        ctxToDraw.globalCompositeOperation = 'source-atop';
        var clipPathScaleFactorX = this.clippingPath.scaleX;
        var clipPathScaleFactorY = this.clippingPath.scaleY;
        ctxToDraw.scale(clipPathScaleFactorX, clipPathScaleFactorY);
        var elWidth = this.clippingPath.width;
        var elHeight = this.clippingPath.height;
        var xOffset = -this.cropX - elWidth / 2;
        var yOffset = -this.cropY - elHeight / 2;
        ctxToDraw.drawImage(this.clippingPath.getElement(), xOffset, yOffset, elWidth, elHeight);
        ctxToDraw.restore();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._setOpacity(ctx);
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctxToDraw.restore();
        console.log(ctxToDraw.canvas.toDataURL(), '1');
        // console.log(ctx.canvas.toDataURL(), '2');
        // if (this.isClipping) {
        //   ctx.save();
        //   ctx.globalAlpha = 0.5;
        //   this.pattern.render(ctx);
        //   ctx.restore();
        //   this.isEditing = false;
        // }
        // this.pattern._element = orignalElement;
        // console.log(this.isEditing, 'isEditing');
    };
    ClippingText.fromObject = function (object) {
        var item = this._fromObject(__assign({}, object), {
            extraParam: 'text',
        });
        return item;
    };
    return ClippingText;
}(fabric.Textbox));
export { ClippingText };
if (typeof ClippingText.prototype.isClipping === 'undefined') {
    extendWithClippingMask(ClippingText);
}
fabric.util.classRegistry.setClass(ClippingText);
