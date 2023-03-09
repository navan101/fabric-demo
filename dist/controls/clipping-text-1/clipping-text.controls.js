import * as fabric from 'fabric';
import { uploadImageHandler } from '../clipping-mask/clipping-mask.controls.handlers';
import { renderUploadHandler } from '../clipping-mask/clipping-mask.controls.renders';
import { cornerTL, editClippingTextHandler, scaleEquallyCrop, } from './clipping-text.controls.handlers';
import { renderEditClippingTextHandler } from './clipping-text.controls.renders';
var _a = fabric.controlsUtils, scaleCursorStyleHandler = _a.scaleCursorStyleHandler, renderCircleControl = _a.renderCircleControl, scaleSkewStyleHandler = _a.scaleSkewCursorStyleHandler, scaleOrSkewActionName = _a.scaleOrSkewActionName;
var controls = fabric.Object.prototype.controls;
export var editClippingTextControl = new fabric.Control({
    x: 0,
    y: -0.5,
    offsetY: -60,
    cursorStyle: 'pointer',
    mouseDownHandler: editClippingTextHandler,
    render: renderEditClippingTextHandler,
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var uploadControl = new fabric.Control({
    // @ts-ignore
    name: 'upload',
    x: 0,
    y: 0,
    cursorStyle: 'pointer',
    mouseDownHandler: uploadImageHandler,
    render: renderUploadHandler,
    // @ts-ignore
    ignoreRotate: true,
});
export var defaultControls = {
    tl: controls.tl,
    tr: controls.tr,
    bl: controls.bl,
    br: controls.br,
    mtr: controls.mtr,
    ml: fabric.Textbox.prototype.controls.ml,
    mr: fabric.Textbox.prototype.controls.mr,
    e: editClippingTextControl,
    // upload: uploadControl,
    // tooltip: controls.tooltip,
};
export var cropControls = {
    tlS: new fabric.Control({
        x: -0.5,
        y: -0.5,
        // @ts-ignore
        name: 'tlS',
        cursorStyleHandler: scaleCursorStyleHandler,
        // @ts-ignore
        positionHandler: cornerTL,
        // @ts-ignore
        actionHandler: scaleEquallyCrop,
        // actionHandler: scaleEquallyCropTL,
        render: renderCircleControl,
    }),
    // trS: new fabric.Control({
    //   x: 0.5,
    //   y: -0.5,
    //   // @ts-ignore
    //   name: 'trS',
    //   cursorStyleHandler: scaleCursorStyleHandler,
    //   // @ts-ignore
    //   positionHandler: cornerTR,
    //   // @ts-ignore
    //   actionHandler: scaleEquallyCrop,
    //   render: renderCircleControl,
    // }),
    // blS: new fabric.Control({
    //   x: -0.5,
    //   y: 0.5,
    //   // @ts-ignore
    //   name: 'blS',
    //   cursorStyleHandler: scaleCursorStyleHandler,
    //   // @ts-ignore
    //   positionHandler: cornerBL,
    //   // @ts-ignore
    //   actionHandler: scaleEquallyCrop,
    //   render: renderCircleControl,
    // }),
    // brS: new fabric.Control({
    //   x: 0.5,
    //   y: 0.5,
    //   // @ts-ignore
    //   name: 'brS',
    //   cursorStyleHandler: scaleCursorStyleHandler,
    //   // @ts-ignore
    //   positionHandler: cornerBR,
    //   // @ts-ignore
    //   actionHandler: scaleEquallyCrop,
    //   render: renderCircleControl,
    //   // getActionName: scaleOrSkewActionName,
    // }),
    // mlS: new fabric.Control({
    //   x: -0.5,
    //   y: 0,
    //   // @ts-ignore
    //   name: 'mlS',
    //   cursorStyleHandler: scaleSkewStyleHandler,
    //   // @ts-ignore
    //   positionHandler: cornerML,
    //   // @ts-ignore
    //   actionHandler: scalingXCrop,
    //   render: renderCircleControl,
    //   getActionName: scaleOrSkewActionName,
    // }),
    // mrS: new fabric.Control({
    //   x: 0.5,
    //   y: 0,
    //   // @ts-ignore
    //   name: 'mrS',
    //   cursorStyleHandler: scaleSkewStyleHandler,
    //   // @ts-ignore
    //   positionHandler: cornerMR,
    //   // @ts-ignore
    //   actionHandler: scalingXCrop,
    //   render: renderCircleControl,
    //   getActionName: scaleOrSkewActionName,
    // }),
};
