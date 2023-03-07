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
import * as fabric from 'fabric';
// fabric.Canvas.prototype._onMouseMove = function(e: TPointerEvent) {
//       const activeObject = this.getActiveObject();
//     !this.allowTouchScrolling &&
//       (!activeObject ||
//         // a drag event sequence is started by the active object flagging itself on mousedown / mousedown:before
//         // we must not prevent the event's default behavior in order for the window to start dragging
//         (isFabricObjectWithDragSupport(activeObject) &&
//         // @ts-ignore
//           !activeObject.shouldStartDragging())) &&
//       e.preventDefault &&
//       e.preventDefault();
//       console.log('_onMouseMove')
//     this.__onMouseMove(e);
// }
// fabric.Canvas.prototype.__onMouseMove = function(e: TPointerEvent) {
//     // @ts-ignore
//     this._isClick = false;
//     this._handleEvent(e, 'move:before');
//     this._cacheTransformEventData(e);
//     if (this.isDrawingMode) {
//       this._onMouseMoveInDrawingMode(e);
//       return;
//     }
//     if (!this._isMainEvent(e)) {
//       return;
//     }
//     const groupSelector = this._groupSelector;
//     // We initially clicked in an empty area, so we draw a box for multiple selection
//     if (groupSelector) {
//       const pointer = this.getPointer(e);
//       groupSelector.left = pointer.x - groupSelector.ex;
//       groupSelector.top = pointer.y - groupSelector.ey;
//       this.renderTop();
//     } else if (!this._currentTransform) {
//       const target = this.findTarget(e);
//       console.log(target, 'target');
//       this._setCursorFromEvent(e, target);
//       this._fireOverOutEvents(e, target);
//     } else {
//       this._transformObject(e);
//     }
//     this.textEditingManager.onMouseMove(e);
//     this._handleEvent(e, 'move');
//     this._resetTransformEventData();
// }
var EditorCanvas = /** @class */ (function (_super) {
    __extends(EditorCanvas, _super);
    function EditorCanvas(element, options) {
        return _super.call(this, element, options) || this;
    }
    return EditorCanvas;
}(fabric.Canvas));
export { EditorCanvas };
