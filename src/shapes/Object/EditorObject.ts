
import { config, util, Point, StaticCanvas, Object } from 'fabric';

import extend from 'lodash/extend';
import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import { saveObjectTransform } from '../../util/misc/objectTransforms';

const { resetObjectTransform, createCanvasElement } = util;

const EditorObjectCustom: any = {
  render(ctx: CanvasRenderingContext2D) {
    // do not render if width/height are zeros or object is not visible
    if (this.isNotVisible()) {
      return;
    }
    if (
      this.canvas &&
      this.canvas.skipOffscreen &&
      !this.group &&
      !this.isOnScreen()
    ) {
      return;
    }
    ctx.save();
    this._setupCompositeOperation(ctx);
    this.drawSelectionBackground(ctx);
    this.transform(ctx);
    this._setOpacity(ctx);
    this._setShadow(ctx);
    if (this.shouldCache()) {
      this.renderCache();
      this.drawCacheOnCanvas(ctx);
    } else {
      this._removeCacheCanvas();
      this.dirty = false;
      this.drawObject(ctx);
    }
    ctx.restore();
  },
  toCanvasElement(options: any = {}) {
    const origParams = saveObjectTransform(this),
      originalGroup = this.group,
      originalShadow = this.shadow,
      abs = Math.abs,
      retinaScaling = options.enableRetinaScaling
        ? Math.max(config.devicePixelRatio, 1)
        : 1,
      multiplier = (options.multiplier || 1) * retinaScaling;
    delete this.group;
    if (options.withoutTransform) {
      resetObjectTransform(this);
    }
    if (options.withoutShadow) {
      this.shadow = null;
    }

    const el = createCanvasElement(),
      // skip canvas zoom and calculate with setCoords now.
      boundingRect = this.getBoundingRect(true, true),
      shadow = this.shadow,
      shadowOffset = new Point();

    if (shadow) {
      const shadowBlur = shadow.blur;
      const scaling = shadow.nonScaling
        ? new Point(1, 1)
        : this.getObjectScaling();
      // consider non scaling shadow.
      shadowOffset.x =
        2 * Math.round(abs(shadow.offsetX) + shadowBlur) * abs(scaling.x);
      shadowOffset.y =
        2 * Math.round(abs(shadow.offsetY) + shadowBlur) * abs(scaling.y);
    }
    const width = boundingRect.width + shadowOffset.x,
      height = boundingRect.height + shadowOffset.y;
    // if the current width/height is not an integer
    // we need to make it so.
    el.width = Math.ceil(width);
    el.height = Math.ceil(height);
    const canvas = new StaticCanvas(el, {
      enableRetinaScaling: false,
      renderOnAddRemove: false,
      skipOffscreen: false,
    });
    if (options.format === 'jpeg') {
      canvas.backgroundColor = '#fff';
    }
    this.setPositionByOrigin(
      new Point(canvas.width / 2, canvas.height / 2),
      'center',
      'center'
    );
    const originalCanvas = this.canvas;
    // static canvas and canvas have both an array of InteractiveObjects
    // @ts-ignore this needs to be fixed somehow, or ignored globally
    canvas._objects = [this];
    this.set('canvas', canvas);
    this.setCoords();
    const canvasEl = canvas.toCanvasElement(multiplier || 1, options);
    this.set('canvas', originalCanvas);
    this.shadow = originalShadow;
    if (originalGroup) {
      this.group = originalGroup;
    }
    this.set(origParams);
    this.setCoords();
    // canvas.dispose will call image.dispose that will nullify the elements
    // since this canvas is a simple element for the process, we remove references
    // to objects in this way in order to avoid object trashing.
    canvas._objects = [];
    // since render has settled it is safe to destroy canvas
    canvas.destroy();
    return canvasEl;
  }
}

extend(Object.prototype, EditorObjectCustom);
