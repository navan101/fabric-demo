"use strict";
// export class EditorObjectMixin {
//   render(ctx: CanvasRenderingContext2D) {
//     // do not render if width/height are zeros or object is not visible
//     if (this.isNotVisible()) {
//       return;
//     }
//     if (
//       this.canvas &&
//       this.canvas.skipOffscreen &&
//       !this.group &&
//       !this.isOnScreen()
//     ) {
//       return;
//     }
//     ctx.save();
//     this._setupCompositeOperation(ctx);
//     this.drawSelectionBackground(ctx);
//     this.transform(ctx);
//     this._setOpacity(ctx);
//     this._setShadow(ctx);
//     if (this.shouldCache()) {
//       this.renderCache();
//       (this as TCachedFabricObject).drawCacheOnCanvas(ctx);
//     } else {
//       this._removeCacheCanvas();
//       this.dirty = false;
//       this.drawObject(ctx);
//     }
//     ctx.restore();
//   }
// }
