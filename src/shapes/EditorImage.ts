import * as fabric from 'fabric';
import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import { TClassProperties, TSize } from '../typedefs';
import { extendWithCropping } from '../mixins/cropping.mixin';

type ImageSource =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement;

export class EditorImage extends fabric.Image {
  isCropping?: boolean;

  constructor(element: ImageSource, options: any = {}) {
    super(element, { filters: [], ...options });
    this.initEvent();
  }

  initEvent() {
    // this.eventListener = onClickCropHandler.bind(this);
    this.on('mousedblclick', () => {
      if (!this.canvas) {
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
      this.canvas.forEachObject((object: any) => {
        object.isClipping = false;
        object.isCropping = false;
      });
      this.isCropping = true;
      this.canvas.setActiveObject(<fabric.Object>this);
      this.canvas.requestRenderAll();
    });
  }

  getOriginalElementWidth() {
    // @ts-ignore
    return this._originalElement ? this._originalElement.naturalWidth || this._originalElement.width : 0;
  }

  getOriginalElementHeight() {
     // @ts-ignore
    return this._originalElement ? this._originalElement.naturalHeight || this._originalElement.height : 0;
  }

  getElementWidth() {
    // @ts-ignore
    return this._element ? this._element.naturalWidth || this._element.width : 0;
  }

  getElementHeight() {
    // @ts-ignore
    return this._element ? this._element.naturalHeight || this._element.height : 0;
  }

  _render(ctx: CanvasRenderingContext2D) {
    // ctx can be either the cacheCtx or the main ctx.
    // we want to disable shadow on the main one since on the cache the shadow is never set.
    // this._setCStroke(ctx);
    // const originalstrokeWidth = this.strokeWidth;
    const width = this.width || 0;
    const height = this.height || 0;
    const elementToDraw = this._element;
    ctx.save();
     // @ts-ignore
    if (this.isCropping) {
      // this.strokeWidth = 0;
      // @ts-ignore
      this._removeShadow(ctx); // main context
      ctx.globalAlpha = 0.5;
      const elWidth = this.getElementWidth();
      const elHeight = this.getElementHeight();
      const imageCopyX = -(this.cropX || 0) - width / 2;
      const imageCopyY = -(this.cropY || 0) - height / 2;
      ctx.drawImage(
        elementToDraw,
        imageCopyX,
        imageCopyY,
        elWidth,
        elHeight,
      );
      ctx.globalAlpha = 1;
      // @ts-ignore
    }
    super._render(ctx);
    // @ts-ignore
    this._drawCroppingLines(ctx);
    ctx.restore();
    // this.strokeWidth = originalstrokeWidth;

  }

  drawBorders(ctx:CanvasRenderingContext2D, options:any, styleOverride:any) {
    this._renderCroppingBorders(ctx);
    super.drawBorders(ctx, options, styleOverride);
  }

  _renderCroppingBorders(ctx: CanvasRenderingContext2D) {
    // @ts-ignore
    if (this.isCropping || this.isClipping) {
      ctx.save();
      const multX = this.canvas?.viewportTransform[0] || 1;
      const multY = this.canvas?.viewportTransform[3] || 1;
      const scaling = this.getObjectScaling();
      if (this.flipX) {
        scaling.x *= -1;
      }
      if (this.flipY) {
        scaling.y *= -1;
      }
      const elWidth = (this.getElementWidth()) * multX * scaling.x;
      const elHeight = (this.getElementHeight()) * multY * scaling.y;
      const { width, height } = this;
      const imageCopyX = (-this.cropX - width / 2) * multX * scaling.x;
      const imageCopyY = (-this.cropY - height / 2) * multY * scaling.y;
      ctx.strokeStyle = fabric.Object.prototype.borderColor;
      ctx.strokeRect(imageCopyX, imageCopyY, elWidth, elHeight);
      ctx.restore();
    }
  }
  
  static fromURL(url: string, options: any = {}): Promise<EditorImage> {
    return fabric.util.loadImage(url, options).then((img) => new this(img, options));
  }

  static fromObject(
    { filters: f, resizeFilter: rf, src, crossOrigin, ...object }: any,
    options: { signal: AbortSignal }
  ): Promise<EditorImage> {
    return Promise.all([
      fabric.util.loadImage(src, { ...options, crossOrigin }),
      f && fabric.util.enlivenObjects(f, options),
      rf && fabric.util.enlivenObjects([rf], options),
      fabric.util.enlivenObjectEnlivables(object, options),
    ]).then(([el, filters = [], [resizeFilter] = [], hydratedProps = {}]) => {
      return new this(el, {
        ...object,
        src,
        crossOrigin,
        filters,
        resizeFilter,
        ...hydratedProps,
      });
    });
  }
}

const imageDefaultValues: Partial<TClassProperties<EditorImage>> = {
  type: 'image',
  strokeWidth: 0,
  srcFromAttribute: false,
  minimumScaleTrigger: 0.5,
  cropX: 0,
  cropY: 0,
  imageSmoothing: true,
};

Object.assign(EditorImage.prototype, {
  ...imageDefaultValues,
  cacheProperties: [...fabric.Object.prototype.cacheProperties, 'cropX', 'cropY'],
});

fabric.util.classRegistry.setClass(EditorImage);
fabric.util.classRegistry.setSVGClass(EditorImage);

if (typeof EditorImage.prototype.isCropping === 'undefined') {
  extendWithCropping(EditorImage);
}