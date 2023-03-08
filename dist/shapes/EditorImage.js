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
import * as fabric from 'fabric';
import { extendWithCropping } from '../mixins/cropping.mixin';
var EditorImage = /** @class */ (function (_super) {
    __extends(EditorImage, _super);
    function EditorImage(element, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, element, __assign({ filters: [] }, options)) || this;
        _this.initEvent();
        return _this;
    }
    EditorImage.prototype.initEvent = function () {
        var _this = this;
        // this.eventListener = onClickCropHandler.bind(this);
        this.on('mousedblclick', function () {
            if (!_this.canvas) {
                return;
            }
            // if (this.canvas.disableObjectActions) {
            //   return;
            // }
            // if (!this.selectable
            //   || this.type === 'gif'
            //   || isFrozen(this.freeze)) {
            //   return;
            // }
            _this.canvas.forEachObject(function (object) {
                object.isClipping = false;
                object.isCropping = false;
            });
            _this.isCropping = true;
            _this.canvas.setActiveObject(_this);
            _this.canvas.requestRenderAll();
        });
    };
    EditorImage.prototype.getOriginalElementWidth = function () {
        // @ts-ignore
        return this._originalElement ? this._originalElement.naturalWidth || this._originalElement.width : 0;
    };
    EditorImage.prototype.getOriginalElementHeight = function () {
        // @ts-ignore
        return this._originalElement ? this._originalElement.naturalHeight || this._originalElement.height : 0;
    };
    EditorImage.prototype.getElementWidth = function () {
        // @ts-ignore
        return this._element ? this._element.naturalWidth || this._element.width : 0;
    };
    EditorImage.prototype.getElementHeight = function () {
        // @ts-ignore
        return this._element ? this._element.naturalHeight || this._element.height : 0;
    };
    EditorImage.prototype._getOriginalTransformedDimensions = function (options) {
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
    EditorImage.prototype._render = function (ctx) {
        // ctx can be either the cacheCtx or the main ctx.
        // we want to disable shadow on the main one since on the cache the shadow is never set.
        // this._setCStroke(ctx);
        // const originalstrokeWidth = this.strokeWidth;
        var width = this.width || 0;
        var height = this.height || 0;
        var elementToDraw = this._element;
        ctx.save();
        // @ts-ignore
        if (this.isCropping) {
            // this.strokeWidth = 0;
            // @ts-ignore
            this._removeShadow(ctx); // main context
            ctx.globalAlpha = 0.5;
            var elWidth = this.getElementWidth();
            var elHeight = this.getElementHeight();
            var imageCopyX = -(this.cropX || 0) - width / 2;
            var imageCopyY = -(this.cropY || 0) - height / 2;
            ctx.drawImage(elementToDraw, imageCopyX, imageCopyY, elWidth, elHeight);
            ctx.globalAlpha = 1;
            // @ts-ignore
        }
        _super.prototype._render.call(this, ctx);
        // @ts-ignore
        this._drawCroppingLines(ctx);
        ctx.restore();
        // this.strokeWidth = originalstrokeWidth;
    };
    EditorImage.prototype.drawBorders = function (ctx, options, styleOverride) {
        this._renderCroppingBorders(ctx);
        _super.prototype.drawBorders.call(this, ctx, options, styleOverride);
    };
    EditorImage.prototype._renderCroppingBorders = function (ctx) {
        var _a, _b;
        // @ts-ignore
        if (this.isCropping || this.isClipping) {
            ctx.save();
            var multX = ((_a = this.canvas) === null || _a === void 0 ? void 0 : _a.viewportTransform[0]) || 1;
            var multY = ((_b = this.canvas) === null || _b === void 0 ? void 0 : _b.viewportTransform[3]) || 1;
            var scaling = this.getObjectScaling();
            if (this.flipX) {
                scaling.x *= -1;
            }
            if (this.flipY) {
                scaling.y *= -1;
            }
            var elWidth = (this.getElementWidth()) * multX * scaling.x;
            var elHeight = (this.getElementHeight()) * multY * scaling.y;
            var _c = this, width = _c.width, height = _c.height;
            var imageCopyX = (-this.cropX - width / 2) * multX * scaling.x;
            var imageCopyY = (-this.cropY - height / 2) * multY * scaling.y;
            ctx.strokeStyle = fabric.Object.prototype.borderColor;
            ctx.strokeRect(imageCopyX, imageCopyY, elWidth, elHeight);
            ctx.restore();
        }
    };
    EditorImage.fromURL = function (url, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return fabric.util.loadImage(url, options).then(function (img) { return new _this(img, options); });
    };
    EditorImage.fromObject = function (_a, options) {
        var _this = this;
        var f = _a.filters, rf = _a.resizeFilter, src = _a.src, crossOrigin = _a.crossOrigin, object = __rest(_a, ["filters", "resizeFilter", "src", "crossOrigin"]);
        return Promise.all([
            fabric.util.loadImage(src, __assign(__assign({}, options), { crossOrigin: crossOrigin })),
            f && fabric.util.enlivenObjects(f, options),
            rf && fabric.util.enlivenObjects([rf], options),
            fabric.util.enlivenObjectEnlivables(object, options),
        ]).then(function (_a) {
            var el = _a[0], _b = _a[1], filters = _b === void 0 ? [] : _b, _c = _a[2], _d = _c === void 0 ? [] : _c, resizeFilter = _d[0], _e = _a[3], hydratedProps = _e === void 0 ? {} : _e;
            return new _this(el, __assign(__assign(__assign({}, object), { src: src, crossOrigin: crossOrigin, filters: filters, resizeFilter: resizeFilter }), hydratedProps));
        });
    };
    return EditorImage;
}(fabric.Image));
export { EditorImage };
var imageDefaultValues = {
    type: 'image',
    strokeWidth: 0,
    srcFromAttribute: false,
    minimumScaleTrigger: 0.5,
    cropX: 0,
    cropY: 0,
    imageSmoothing: true,
};
Object.assign(EditorImage.prototype, __assign(__assign({}, imageDefaultValues), { cacheProperties: __spreadArray(__spreadArray([], fabric.Object.prototype.cacheProperties, true), ['cropX', 'cropY'], false) }));
fabric.util.classRegistry.setClass(EditorImage);
fabric.util.classRegistry.setSVGClass(EditorImage);
if (typeof EditorImage.prototype.isCropping === 'undefined') {
    extendWithCropping(EditorImage);
}
