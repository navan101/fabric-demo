import * as fabric from 'fabric';
import { extendWithClippingText } from '../mixins/clipping-text.mixin';
import { defaultControls } from '../controls/clipping-text/clipping-text.controls';

export class EditorClippingText extends fabric.Textbox {
  pattern?: any;

  cropX = 0;

  cropY = 0;

  isClipping?: boolean;

  controls = defaultControls;

  _cachePatternCanvas?: any;

  declare _originalLockMovementX: boolean;

  declare _originalLockMovementY: boolean;

  constructor(text: string, options?: any) {
    super(text, options);
    this.initEvent();
  }

  initEvent() {
    // this.on('moving', (event: any) => {
    //   if (!event.transform) {
    //     return;
    //   }
    //   const { original, target } = event.transform;
    //   target.pattern.left = original.pattern.left - (original.left - target.left);
    //   target.pattern.top = original.pattern.top - (original.top - target.top);
    // });
  }

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

  _render(ctx: CanvasRenderingContext2D) {
    // this.callSuper('_render', ctx);
    // if (!this.isPreviewClippingMask && (!this.isCreateFirst || this.isEditing)) {
    //   this.isCreateFirst = true;
    //   fireClippingTextEvent(this, '_render');
    // }
    super._render(ctx);
    // this._renderClippingText(ctx);
  }

  _renderClippingText(ctx: CanvasRenderingContext2D) {
    if (!this.pattern || this.isNotVisible()) {
      return;
    }
    // this.updatePatternRotateIfNeed();
    // this.updatePatternTopLeftIfNeed();
    const orignalElement = this.pattern._element;
    // const originalStroke = this.stroke;
    // const originalShadow = this.shadow;
    // const originalOuterGlow = this.outerGlow;
    // if (this.tileImageOption.enabled) {
    //   this.pattern._element = this._getTileImagePatternCanvas();
    // }
    if (!this._cachePatternCanvas) {
      this._cachePatternCanvas = fabric.util.createCanvasElement();
    }
    const canvas = this._cachePatternCanvas;
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
  }

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

  drawBorders(ctx: CanvasRenderingContext2D, styleOverride: any) {
    // this.callSuper('drawBorders', ctx, styleOverride);
    this._renderClippingBorders(ctx, styleOverride);
    super.drawBorders(ctx, {
      angle: this.angle,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      skewX: this.skewX,
      skewY: this.skewY,
      translateX: this.left,
      translateY: this.top,
    }, styleOverride)
  }

  _renderClippingBorders(ctx: CanvasRenderingContext2D, styleOverride: any = {}) {
    if (!this.canvas || !this.pattern || !this.isClipping) {
      return;
    }
    // const coords = this.pattern._getCoords(true, true);
    const [tl, tr, br, bl] = this.pattern.getCoords(true, true);
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

  lockClippingMove() {
    this._originalLockMovementX = this.lockMovementX;
    this._originalLockMovementY = this.lockMovementY;
    this.lockMovementX = true;
    this.lockMovementY = true;
  }

   resetClippingMove() {
    this.lockMovementX = this._originalLockMovementX;
    this.lockMovementY = this._originalLockMovementY;
  }

  static fromObject(object: Record<string, any>): Promise<any> {
    const item = this._fromObject(
      {
        ...object,
        styles: fabric.util.stylesFromArray(object.styles || {}, object.text),
      },
      {
        extraParam: 'text',
      }
    );
    return item;
  }
}

if (typeof EditorClippingText.prototype.isClipping === 'undefined') {
  extendWithClippingText(EditorClippingText);
}

fabric.util.classRegistry.setClass(EditorClippingText);