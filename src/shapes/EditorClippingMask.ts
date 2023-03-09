// @ts-nocheck
import * as fabric from 'fabric';
import { EditorImage } from './EditorImage';
import { EditorTextbox } from './EditorTextbox';
import { extendWithClippingMask } from '../mixins/clipping-mask.mixin';
import { imageControls } from '../controls/clipping-mask/clipping-mask.controls';
import { TClassProperties } from '../typedefs';
import { applyMixins } from '../util/applyMixins';
import { StyledText, TextStyleDeclaration } from './Text/StyledText';

export type GraphemeBBox<onPath = false> = {
  width: number;
  height: number;
  kernedWidth: number;
  left: number;
  deltaY: number;
} & (onPath extends true
  ? {
    // on path
    renderLeft: number;
    renderTop: number;
    angle: number;
  }
  : Record<string, never>);

type ImageSource =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement;


fabric.Object.prototype.borderScaleFactor = 1;
fabric.Object.prototype.cornerSize = 12;
fabric.Object.prototype.touchCornerSize = 48;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.selectionBackgroundColor = 'rgba(255, 255, 255, 0.3)';
fabric.Object.prototype.borderOpacityWhenMoving = 1;
fabric.Group.prototype.noScaleCache = false; // refresh cache at scaling
fabric.Canvas.prototype.allowTouchScrolling = false;

export class EditorClippingMask extends EditorImage {
  cropOpacity = 0.5;

  isClipping?: boolean;

  clippingPath?: fabric.Textbox;

  controls = imageControls;
  // controls = fabric.Textbox.prototype.controls;

  _elementToDraw: any;

  protected declare _styleProperties: string[];


  constructor(element: ImageSource, options: any = {}) {
    super(element, { filters: [], ...options });
    this.initEvent();
  }

  initEvent() {
    // this.on('mousedblclick', (e: any) => {
    //   debugger
    //   // const newSelection = this.getSelectionStartFromPointer(e);
    //   // this.setSelectionStart(newSelection);
    //   // this.setSelectionEnd(newSelection);
    //   this.clippingPath?.set('canvas', this.canvas);
    //   this.clippingPath?.set('editable', true);
    //   this.clippingPath?.enterEditing(e);
    // });

    function checkRelativePositionBetweenElementsClippingText(
      originalImage: any,
      originalClipPath: any,
    ) {
      const ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
      const ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();

      if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
        const scale = originalImage.scaleY / originalImage.scaleX;
        const scaleToWidth = originalClipPath.getScaledWidth() / originalImage.width;
        originalImage.scale(scaleToWidth);
        originalImage.scaleY = scale * originalImage.scaleX;
      } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
        const scale = originalImage.scaleX / originalImage.scaleY;
        const scaleToHeight = originalClipPath.getScaledHeight() / originalImage.height;
        originalImage.scale(scaleToHeight);
        originalImage.scaleX = scale * originalImage.scaleY;
      }

      const centerPoint = originalClipPath.getCenterPoint();
      const imageLeft = centerPoint.x - (originalImage.getScaledWidth()) / 2;
      const imageTop = centerPoint.y - (originalImage.getScaledHeight()) / 2;

      const rotationPoint = new fabric.Point(imageLeft, imageTop);
      const angleRadians = fabric.util.degreesToRadians(
        originalClipPath.angle,
      );
      const newCoords = fabric.util.rotatePoint(
        rotationPoint,
        centerPoint,
        angleRadians,
      );
      originalImage.set({
        left: newCoords.x,
        top: newCoords.y,
        angle: originalClipPath.angle,
      });
      originalImage.setCoords();
    }

    function checkRelativePositionBetweenElements(originalImage: any, originalClipPath: any) {
      const ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
      const ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();
      originalImage.angle = 0;

      if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
        const scale = originalImage.scaleY / originalImage.scaleX;
        originalImage.scaleToWidth(originalClipPath.getScaledWidth());
        originalImage.scaleY = scale * originalImage.scaleX;
      } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
        const scale = originalImage.scaleX / originalImage.scaleY;
        originalImage.scaleToHeight(originalClipPath.getScaledHeight());
        originalImage.scaleX = scale * originalImage.scaleY;
      }

      const imageLeft = originalClipPath.left - ((originalImage.getScaledWidth() - originalClipPath.getScaledWidth()) / 2);
      const imageTop = originalClipPath.top - ((originalImage.getScaledHeight() - originalClipPath.getScaledHeight()) / 2);

      return {
        imageLeft,
        imageTop,
      };
    }

    function handleReleaseClippingMask(clippingMaskElementKey: string) {
      const section = masterPageData.state.selectedSection.value;
      const tmpOrderArray = [...masterPageData.getOrderArray(section).value];
      const index = tmpOrderArray.findIndex((elementKey) => elementKey === clippingMaskElementKey);
      const clippingMask = <MasterClippingMaskElement>masterPageData.getElementByKey(clippingMaskElementKey)?.value;
      if (!clippingMask.isClipping && clippingMask.originalImageObject && clippingMask.originalClipPathObject) {
        clippingMask.originalClipPathObject.sectionIndex = clippingMask.sectionIndex;
        clippingMask.originalClipPathObject.top = clippingMask.top;
        clippingMask.originalClipPathObject.left = clippingMask.left;
        clippingMask.originalClipPathObject.flipX = clippingMask.flipX;
        clippingMask.originalClipPathObject.flipY = clippingMask.flipY;
        clippingMask.originalClipPathObject.angle = clippingMask.angle;
        clippingMask.originalClipPathObject.scaleX *= clippingMask.scaleX || 1;
        clippingMask.originalClipPathObject.scaleY *= clippingMask.scaleY || 1;

        const cropX = (clippingMask.cropX || 0) * (clippingMask.scaleX || 1);
        const cropY = (clippingMask.cropY || 0) * (clippingMask.scaleY || 1);
        const point = fabric.util.rotateVector(new fabric.Point(cropX, cropY), fabric.util.degreesToRadians(clippingMask.angle || 0));
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
        let items = [];
        if ((clippingMask.indexImage! > clippingMask.indexClipPath! && !clippingMask.alwaysOnTop)
          || (clippingMask.indexImage! < clippingMask.indexClipPath! && clippingMask.alwaysOnTop)) {
          items.push(clippingMask.originalImageObject);
          items.push(clippingMask.originalClipPathObject);
        }
        if ((clippingMask.indexImage! < clippingMask.indexClipPath! && !clippingMask.alwaysOnTop)
          || (clippingMask.indexImage! > clippingMask.indexClipPath! && clippingMask.alwaysOnTop)) {
          items.push(clippingMask.originalClipPathObject);
          items.push(clippingMask.originalImageObject);
        }
        if (clippingMask.originalImageObject.alwaysOnTop && !clippingMask.originalClipPathObject.alwaysOnTop) {
          items = [];
          items.push(clippingMask.originalImageObject);
          items.push(clippingMask.originalClipPathObject);
        }
        addElements(
          items,
          section,
          index + 1,
          clippingMask.alwaysOnTop ? clippingMaskElementKey : undefined,
        );
        const orderArray = [...masterPageData.getOrderArray(section).value];
        if (clippingMask.alwaysOnTop) {
          orderArray.splice(index + 2, 1);
        } else {
          orderArray.splice(index, 1);
        }
        masterPageData.getOrderArray().value = orderArray;
        changeCanvas();
      }
    }
    this.on('mousedblclick', () => {
      if (!this.canvas) {
        return
      }
      // if (this.canvas?.disableObjectActions) {
      //   return;
      // }

      // if (['frozen', 'frozenDeletable'].includes(this.freeze) || !this.selectable) {
      //   return;
      // }
      // @ts-ignore
      // this.canvas.off('mouse:down', this.onMouseDown);
      this.canvas?.forEachObject((object: any) => {
        object.isClipping = false;
        object.isCropping = false;
      });
      this.isClipping = true;
      this.canvas.setActiveObject(this);
      this.canvas.requestRenderAll();
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
  }

  calcImageByClipPath() {
    const { clippingPath } = this;
    // @ts-ignore
    const point1 = this.getPointByOrigin(this.originX, this.originY);
    const point2 = clippingPath.getPointByOrigin(clippingPath.originX, clippingPath.originY);
    const cropX = (point2.x - point1.x) || 0;
    const cropY = (point2.y - point1.y) || 0;
    console.log(cropX, 'cropX')
    console.log(cropY, 'cropY')
    const width = clippingPath.getScaledWidth();
    const height = clippingPath.getScaledHeight();
    const { tl } = clippingPath.calcACoords();
    this.setPositionByOrigin(tl, 'left', 'top');
    return {
      cropX,
      cropY,
      width,
      height,
    };
  }

  _render(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) {
      return
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
  }

  _renderClippingBackground(ctx: CanvasRenderingContext2D) {
    // if (this.isClipping) {
    ctx.save()
    const { width } = this;
    const { height } = this;
    const elementToDraw = this._elementToDraw;
    ctx.globalAlpha = this.cropOpacity;
    // const padding = this.getElementPadding();
    const padding = 0;
    const elWidth = this.getElementWidth() - padding;
    const elHeight = this.getElementHeight() - padding;
    const imageCopyX = -this.cropX - width / 2;
    const imageCopyY = -this.cropY - height / 2;
    // const sX = (this.originalScaleX || this.scaleX);
    // const sY = (this.originalScaleX || this.scaleX);
    // ctx.scale(sX, sY);
    ctx.drawImage(
      elementToDraw,
      imageCopyX,
      imageCopyY,
      elWidth,
      elHeight,
    );
    ctx.restore();
    ctx.globalAlpha = 1;
    // }
  }

  _renderClippingByText(ctx: CanvasRenderingContext2D) {
    if (this.clippingPath) {
      const { width, height, scaleX } = this;
      // console.log(width, 'width');
      // console.log(scaleX, 'scaleX');
      // console.log(width * scaleX, 'width * scaleX');
      // console.log(this.clippingPath.width, 'this.clippingPath.width');

      const elementToDraw = this._elementToDraw;
      const clipPathScaleFactorX = this.clippingPath.scaleX;
      const clipPathScaleFactorY = this.clippingPath.scaleY;

      const canvasClippingPath = fabric.util.createCanvasElement();
      canvasClippingPath.width = this.clippingPath.getScaledWidth();
      canvasClippingPath.height = this.clippingPath.getScaledHeight();
      const ctxClippingPath = canvasClippingPath.getContext('2d') as CanvasRenderingContext2D;

      ctxClippingPath.save();
      ctxClippingPath.scale(clipPathScaleFactorX, clipPathScaleFactorY);
      ctxClippingPath.translate(this.clippingPath.width / 2, this.clippingPath.height / 2);
      this.clippingPath._render(ctxClippingPath);
      ctxClippingPath.restore();
      // console.log(ctxClippingPath.canvas.toDataURL());

      const canvasEl = fabric.util.createCanvasElement();
      canvasEl.width = this.clippingPath.getScaledWidth();
      canvasEl.height = this.clippingPath.getScaledHeight();
      const ctxEl = canvasEl.getContext('2d') as CanvasRenderingContext2D;
      ctxEl.save();
      // console.log(this.cropY, 'this.cropY')
      // console.log(this.cropX, 'this.cropX');
      if (elementToDraw) {
        // ctxEl.save();
        // ctxEl.drawImage(
        //   elementToDraw,
        //   this.cropX,
        //   this.cropY,
        //   Math.max(1, Math.floor(width)),
        //   Math.max(1, Math.floor(height)),
        //   (canvasEl.width / 2 - width / 2),
        //   (canvasEl.height / 2 - height / 2),
        //   Math.max(0, Math.floor(width)),
        //   Math.max(0, Math.floor(height)),
        // );
        // ctxEl.restore();

        ctxEl.save();
        const scaleX = this._filterScalingX;
        const scaleY = this._filterScalingY;
        const w = this.width,
          h = this.height,
          // crop values cannot be lesser than 0.
          cropX = Math.max(this.cropX, 0),
          cropY = Math.max(this.cropY, 0),
          elWidth = elementToDraw.naturalWidth || elementToDraw.width,
          elHeight = elementToDraw.naturalHeight || elementToDraw.height,
          sX = cropX * scaleX,
          sY = cropY * scaleY,
          // the width height cannot exceed element width/height, starting from the crop offset.
          sW = Math.min(w * scaleX, elWidth - sX),
          sH = Math.min(h * scaleY, elHeight - sY),
          // x = -w / 2,
          // y = -h / 2,
          x = canvasEl.width / 2 - w / 2,
          y = canvasEl.height / 2 - h / 2,
          maxDestW = Math.min(w, elWidth / scaleX - cropX),
          maxDestH = Math.min(h, elHeight / scaleY - cropY);
        ctxEl.drawImage(elementToDraw, sX, sY, sW, sH, x, y, maxDestW, maxDestH);
        ctxEl.restore();
      }
      // ctxEl.globalCompositeOperation = 'destination-atop';
      ctxEl.drawImage(ctxClippingPath.canvas, 0, 0);
      ctxEl.restore();

      // console.log(ctxEl.canvas.toDataURL(), 'ctxEl.canvas');
      ctx.drawImage(ctxEl.canvas, -(ctxClippingPath.canvas.width / 2), -ctxClippingPath.canvas.height / 2);
    }
  }

  _renderClippingByImage(ctx: CanvasRenderingContext2D) {
    if (this.clippingPath && (this.clippingPath.type === 'image' || this.clippingPath.type === 'svg')) {
      const angl = this.clippingPath.angle;
      this.clippingPath.angle = 0;
      const { width, height } = this;
      const elementToDraw = this._elementToDraw;

      const clipPathScaleFactorX = this.clippingPath.scaleX;
      const clipPathScaleFactorY = this.clippingPath.scaleY;

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
      const canvas = fabric.util.createCanvasElement();
      canvas.width = this.clippingPath.getScaledWidth();
      canvas.height = this.clippingPath.getScaledHeight();
      const ctxEl = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctxEl.save();
      if (elementToDraw) {
        // const padding = this.getElementPadding();
        const padding = 0;
        ctxEl.drawImage(
          elementToDraw,
          this.cropX + padding,
          this.cropY + padding,
          Math.max(1, Math.floor(width)),
          Math.max(1, Math.floor(height)),
          canvas.width / 2 - width / 2,
          canvas.height / 2 - height / 2,
          Math.max(0, Math.floor(width)),
          Math.max(0, Math.floor(height)),
        );
      }

      ctxEl.globalCompositeOperation = 'destination-atop';
      ctxEl.scale(clipPathScaleFactorX, clipPathScaleFactorY);
      ctxEl.drawImage(
        // @ts-ignore
        this.clippingPath._element,
        -this.clippingPath.cropX - (canvas.width / 2 - width / 2),
        -this.clippingPath.cropY - (canvas.height / 2 - height / 2),
      );
      ctxEl.restore();
      ctx.drawImage(ctxEl.canvas, -width / 2, -height / 2);
      // }
      this.clippingPath.angle = angl;
    }
  }

  _getOriginalTransformedDimensions(options: any = {}): fabric.Point {
    const dimOptions = {
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      skewX: this.skewX,
      skewY: this.skewY,
      width: this.getOriginalElementWidth(),
      height: this.getOriginalElementHeight(),
      strokeWidth: this.strokeWidth,
      ...options,
    };
    // stroke is applied before/after transformations are applied according to `strokeUniform`
    const strokeWidth = dimOptions.strokeWidth;
    let preScalingStrokeValue = strokeWidth,
      postScalingStrokeValue = 0;

    if (this.strokeUniform) {
      preScalingStrokeValue = 0;
      postScalingStrokeValue = strokeWidth;
    }
    const dimX = dimOptions.width + preScalingStrokeValue,
      dimY = dimOptions.height + preScalingStrokeValue,
      noSkew = dimOptions.skewX === 0 && dimOptions.skewY === 0;
    let finalDimensions;
    if (noSkew) {
      finalDimensions = new fabric.Point(
        dimX * dimOptions.scaleX,
        dimY * dimOptions.scaleY
      );
    } else {
      finalDimensions = fabric.util.sizeAfterTransform(dimX, dimY, dimOptions);
    }

    return finalDimensions.scalarAdd(postScalingStrokeValue);
  }

  static fromObject(
    { filters: f, resizeFilter: rf, src, crossOrigin, ...object }: any,
    options: { signal: AbortSignal }
  ): Promise<EditorClippingMask> {
    return Promise.all([
      fabric.util.loadImage(src, { ...options, crossOrigin }),
      f && fabric.util.enlivenObjects(f, options),
      rf && fabric.util.enlivenObjects([rf], options),
      // fabric.util.enlivenObjectEnlivables(object, options),
    ]).then(([el, filters = [], [resizeFilter] = [], hydratedProps = {}]) => {
      const item = new this(el, {
        ...object,
        src,
        crossOrigin,
        filters,
        resizeFilter,
        ...hydratedProps,
      });
      const element = object.__element;
      if (element) {
        item.setElement(element);
        item._setWidthHeight();
      }
      return item;
    });
  }

}
export const clippingMaskDefaultValues: Partial<TClassProperties<EditorClippingMask>> = {
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

Object.assign(EditorClippingMask.prototype, {
  ...clippingMaskDefaultValues,
});

if (typeof EditorClippingMask.prototype.isClipping === 'undefined') {
  extendWithClippingMask(EditorClippingMask);
}

fabric.util.classRegistry.setClass(EditorClippingMask);
fabric.util.classRegistry.setSVGClass(EditorClippingMask);



