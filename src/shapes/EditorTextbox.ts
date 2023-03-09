import { defaultControls } from '../controls/clipping-text-1/clipping-text.controls';
import * as fabric from 'fabric';
import { extend } from 'lodash';
import { extendWithClippingText } from '../mixins/clipping-text-1.mixin';
import { TClassProperties } from '../typedefs';

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

export class EditorTextbox extends fabric.Textbox {

  isClipping?: boolean;

  declare cropX: number;

  declare cropY: number;

  cropOpacity = 0.5;

  originalText?: string;

  placeholder?: string;

  uppercase?: boolean;

  declare clippingPath: fabric.Image;

  declare _cacheClippingPathCanvas: any;

  stateProperties = fabric.Textbox.prototype.stateProperties?.concat(
    'clippingPath',
    'isClipping',
    'cropX',
    'cropY'
  );

  cacheProperties = fabric.Textbox.prototype.cacheProperties.concat(
    'clippingPath',
    'isClipping',
    'cropX',
    'cropY'
  );

  controls = defaultControls;

  objectCaching = true;


  constructor(text: string, options?: any) {
    super(text, options);
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

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this._renderClippingText(ctx);
    // this._renderClippingBackground(ctx);
  }
  _renderClippingBackground(ctx: CanvasRenderingContext2D) {
    if (this.isClipping) {
      ctx.save()
      const clipPathScaleFactorX = this.clippingPath.scaleX;
      const clipPathScaleFactorY = this.clippingPath.scaleY;
      const { width } = this;
      const { height } = this;
      const elementToDraw = this.clippingPath.getElement();
      ctx.globalAlpha = this.cropOpacity;
      // const padding = this.getElementPadding();
      const padding = 0;
      // const width = this.clippingPath.width;
      // const height = this.clippingPath.height;
      // @ts-ignore
      // const elWidth = this.clippingPath.getElementWidth();
      const elWidth = elementToDraw.naturalWidth || elementToDraw.width;
      // @ts-ignore
      const elHeight = elementToDraw.naturalHeight || elementToDraw.height;
      // @ts-ignore
      // const elHeight = this.clippingPath.getElementHeight();
      // const imageCopyX = -this.cropX - width / 2;
      // const imageCopyY = -this.cropY - height / 2;
      // const dx = -this.cropX + this.clippingPath.width - this.width / 2;
      // const dy = -this.cropY + this.clippingPath.height - this.height / 2;
      const imageCopyX = -this.cropX - width / 2;
      const imageCopyY = -this.cropY - height / 2;
      ctx.scale(clipPathScaleFactorX, clipPathScaleFactorY);
      ctx.drawImage(
        elementToDraw,
        imageCopyX,
        imageCopyY,
        elWidth,
        elHeight,
      );
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
  }

  _renderClippingText(ctx: CanvasRenderingContext2D) {
    if (!this.clippingPath || this.isNotVisible()) {
      return;
    }
    const clipPathScaleFactorX = this.clippingPath.scaleX;
    const clipPathScaleFactorY = this.clippingPath.scaleY;
    if (!this._cacheClippingPathCanvas) {
      this._cacheClippingPathCanvas = fabric.util.createCanvasElement();
    }
    const canvas = this._cacheClippingPathCanvas;
    const ctxToDraw = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctxToDraw.save();
    if (canvas.width !== ctx.canvas.width
      || canvas.height !== ctx.canvas.height
    ) {
      canvas.width = ctx.canvas.width;
      canvas.height = ctx.canvas.height;
    } else {
      ctxToDraw.setTransform(1, 0, 0, 1, 0, 0);
      ctxToDraw.clearRect(0, 0, canvas.width, canvas.height);
    }
    const transform = ctx.getTransform();
    ctxToDraw.setTransform(transform);

    ctxToDraw.save();
    this._renderText(ctxToDraw);
    ctxToDraw.restore();

    ctxToDraw.save();
    ctxToDraw.globalCompositeOperation = 'source-atop';
    const dx = -this.cropX + this.clippingPath.width / 2 - this.width / 2;
    const dy = -this.cropY + this.clippingPath.height / 2 - this.height / 2;
    ctxToDraw.translate(dx, dy);
    ctxToDraw.scale(clipPathScaleFactorX, clipPathScaleFactorY);
    this.clippingPath._render(ctxToDraw);
    ctxToDraw.restore();


    if (this.isClipping) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      const dx = -this.cropX + this.clippingPath.width / 2 - this.width / 2;
      const dy = -this.cropY + this.clippingPath.height / 2 - this.height / 2;
      ctx.translate(dx, dy);
      ctx.scale(clipPathScaleFactorX, clipPathScaleFactorY);
      this.clippingPath._render(ctx);
      ctx.restore()
    }


    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._setOpacity(ctx);
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctxToDraw.restore();
  }

  calcTextByClipPath() {
    const { clippingPath } = this;
    // // @ts-ignore
    const point1 = this.getPointByOrigin(this.originX, this.originY);
    const point2 = clippingPath.getPointByOrigin(clippingPath.originX, clippingPath.originY);
    const cropX = (point1.x - point2.x) || 0;
    const cropY = (point1.y - point2.y) || 0;
    return {
      cropX,
      cropY,
    };
  }

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

  _renderClippingBorders(ctx: CanvasRenderingContext2D, styleOverride: any = {}) {
    if (!this.canvas || !this.clippingPath || !this.isClipping) {
      return;
    }
    // const coords = this.pattern._getCoords(true, true);
    const [tl, tr, br, bl] = this.clippingPath.getCoords(true, true);
    const vpt = this.canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    let vpt4 = vpt[4];
    let vpt5 = vpt[5];
    // @ts-ignore
    const devicePixelRatio = fabric.devicePixelRatio;
    let zoom = this.canvas.getZoom();
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
  }

  static fromObject(object: Record<string, any>): Promise<any> {
    const item = this._fromObject(
      {
        ...object,
        // styles: fabric.util.stylesFromArray(object.styles || {}, object.text),
      },
      {
        extraParam: 'text',
      }
    );
    return item;
  }
}

export const textboxDefaultValues: Partial<TClassProperties<EditorTextbox>> = {
  cropX: 0,
  cropY: 0,
};

Object.assign(EditorTextbox.prototype, textboxDefaultValues);


if (typeof EditorTextbox.prototype.isClipping === 'undefined') {
  extendWithClippingText(EditorTextbox);
}

fabric.util.classRegistry.setClass(EditorTextbox);