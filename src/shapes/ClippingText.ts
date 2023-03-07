import * as fabric from 'fabric';
import { extend } from 'lodash';
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

export class ClippingText extends fabric.Textbox {

  isClipping?: boolean;
  
  cropX = 0;

  cropY = 0;

  originalText?: string;

  placeholder?: string;

  uppercase?: boolean;

  declare clippingPath: fabric.Image;

  declare _cacheClippingPathCanvas: any;

  cacheProperties = fabric.Textbox.prototype.cacheProperties.concat(
    'clippingPath',
  );

  constructor(text: string, options?: any) {
    super(text, options);
  }

  // render(ctx: CanvasRenderingContext2D) {
  //   super.render(ctx);
  //   this._renderClippingText(ctx);
  // }

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this._renderClippingText(ctx);
  }

  _renderClippingText(ctx: CanvasRenderingContext2D) {
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
    const clipPathScaleFactorX = this.clippingPath.scaleX;
    const clipPathScaleFactorY = this.clippingPath.scaleY;
    ctxToDraw.scale(clipPathScaleFactorX, clipPathScaleFactorY);
    const elWidth = this.clippingPath.width;
    const elHeight = this.clippingPath.height;
    const xOffset = -this.cropX - elWidth / 2;
    const yOffset = -this.cropY - elHeight / 2;
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

if (typeof ClippingText.prototype.isClipping === 'undefined') {
  extendWithClippingMask(ClippingText);
}

fabric.util.classRegistry.setClass(ClippingText);