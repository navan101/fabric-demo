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
import { extendWithClippingText } from '../mixins/clipping-text.mixin';
import { defaultControls } from '../controls/clipping-text/clipping-text.controls';
var EditorClippingText = /** @class */ (function (_super) {
    __extends(EditorClippingText, _super);
    function EditorClippingText(text, options) {
        var _this = _super.call(this, text, options) || this;
        _this.cropX = 0;
        _this.cropY = 0;
        _this.controls = defaultControls;
        _this.initEvent();
        return _this;
    }
    EditorClippingText.prototype.initEvent = function () {
        // this.on('moving', (event: any) => {
        //   if (!event.transform) {
        //     return;
        //   }
        //   const { original, target } = event.transform;
        //   target.pattern.left = original.pattern.left - (original.left - target.left);
        //   target.pattern.top = original.pattern.top - (original.top - target.top);
        // });
    };
    // render(ctx: CanvasRenderingContext2D) {
    //   // const originalOpacity = this.opacity;
    //   // if (this.strokeWidth === 0 && !this.shadow && !this.outerGlow) {
    //   //   this.opacity = 0.0001;
    //   // }
    //   // this.callSuper('render', ctx);
    //   // this.opacity = originalOpacity;
    //   // this._renderClippingText(ctx);
    //   super.render(ctx);
    //   this._renderClippingText(ctx);
    // }
    EditorClippingText.prototype._render = function (ctx) {
        // this.callSuper('_render', ctx);
        // if (!this.isPreviewClippingMask && (!this.isCreateFirst || this.isEditing)) {
        //   this.isCreateFirst = true;
        //   fireClippingTextEvent(this, '_render');
        // }
        _super.prototype._render.call(this, ctx);
        // this._renderClippingText(ctx);
    };
    EditorClippingText.prototype._renderClippingText = function (ctx) {
        if (!this.pattern || this.isNotVisible()) {
            return;
        }
        // this.updatePatternRotateIfNeed();
        // this.updatePatternTopLeftIfNeed();
        var orignalElement = this.pattern._element;
        // const originalStroke = this.stroke;
        // const originalShadow = this.shadow;
        // const originalOuterGlow = this.outerGlow;
        // if (this.tileImageOption.enabled) {
        //   this.pattern._element = this._getTileImagePatternCanvas();
        // }
        if (!this._cachePatternCanvas) {
            this._cachePatternCanvas = fabric.util.createCanvasElement();
        }
        var canvas = this._cachePatternCanvas;
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
        this.transform(ctxToDraw);
        // this.stroke = 'transparent';
        // this.shadow = null;
        // this.outerGlow = null;
        this._render(ctxToDraw);
        // this.stroke = originalStroke;
        // this.shadow = originalShadow;
        // this.outerGlow = originalOuterGlow;
        ctxToDraw.restore();
        ctxToDraw.save();
        this.pattern.transform(ctxToDraw);
        ctxToDraw.globalCompositeOperation = 'source-atop';
        this.pattern._render(ctxToDraw);
        ctxToDraw.restore();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._setOpacity(ctx);
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctxToDraw.restore();
        // if (this.isClipping) {
        //   ctx.save();
        //   ctx.globalAlpha = 0.5;
        //   this.pattern._render(ctx);
        //   ctx.restore();
        //   this.isEditing = false;
        // }
        this.pattern._element = orignalElement;
        console.log(this.isEditing, 'isEditing');
    };
    // calcImageByClipPath() {
    //   const { clippingPath } = this;
    //   // @ts-ignore
    //   const point1 = this.getPointByOrigin(this.originX, this.originY);
    //   const point2 = clippingPath.getPointByOrigin(clippingPath.originX, clippingPath.originY);
    //   const cropX = (point2.x - point1.x) || 0;
    //   const cropY = (point2.y - point1.y) || 0;
    //   const width = clippingPath.getScaledWidth();
    //   const height = clippingPath.getScaledHeight();
    //   const { tl } = clippingPath.calcACoords();
    //   this.setPositionByOrigin(tl, 'left', 'top');
    //   return {
    //     cropX,
    //     cropY,
    //     width,
    //     height,
    //   };
    // }
    EditorClippingText.prototype.drawBorders = function (ctx, styleOverride) {
        // this.callSuper('drawBorders', ctx, styleOverride);
        this._renderClippingBorders(ctx, styleOverride);
        _super.prototype.drawBorders.call(this, ctx, {
            angle: this.angle,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            skewX: this.skewX,
            skewY: this.skewY,
            translateX: this.left,
            translateY: this.top,
        }, styleOverride);
    };
    EditorClippingText.prototype._renderClippingBorders = function (ctx, styleOverride) {
        if (styleOverride === void 0) { styleOverride = {}; }
        if (!this.canvas || !this.pattern || !this.isClipping) {
            return;
        }
        // const coords = this.pattern._getCoords(true, true);
        var _a = this.pattern.getCoords(true, true), tl = _a[0], tr = _a[1], br = _a[2], bl = _a[3];
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
    EditorClippingText.prototype.lockClippingMove = function () {
        this._originalLockMovementX = this.lockMovementX;
        this._originalLockMovementY = this.lockMovementY;
        this.lockMovementX = true;
        this.lockMovementY = true;
    };
    EditorClippingText.prototype.resetClippingMove = function () {
        this.lockMovementX = this._originalLockMovementX;
        this.lockMovementY = this._originalLockMovementY;
    };
    EditorClippingText.fromObject = function (object) {
        var item = this._fromObject(__assign(__assign({}, object), { styles: fabric.util.stylesFromArray(object.styles || {}, object.text) }), {
            extraParam: 'text',
        });
        return item;
    };
    return EditorClippingText;
}(fabric.Textbox));
export { EditorClippingText };
if (typeof EditorClippingText.prototype.isClipping === 'undefined') {
    extendWithClippingText(EditorClippingText);
}
fabric.util.classRegistry.setClass(EditorClippingText);
