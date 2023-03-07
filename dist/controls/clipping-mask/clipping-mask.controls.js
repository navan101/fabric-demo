import * as fabric from 'fabric';
import { imageCornerML, imageCornerMR, scalingEqually, scalingXCrop } from './clipping-mask.controls.handlers';
import { imageCornerBL, imageCornerBR, imageCornerTL, imageCornerTR, scaleEquallyCropBL, scaleEquallyCropBLFlig, scaleEquallyCropBR, scaleEquallyCropBRFlig, 
// scaleEquallyCropTL,
scaleEquallyCropTLFlig, scaleEquallyCropTR, scaleEquallyCropTRFlig, } from '../cropping/cropping.controls.handlers';
import { scaleEquallyCrop } from './clipping-mask.controls.handlers';
var controls = fabric.Object.prototype.controls;
// @ts-ignore
var _a = fabric.controlsUtils, scaleCursorStyleHandler = _a.scaleCursorStyleHandler, renderCircleControl = _a.renderCircleControl;
// const uploadControl = new fabric.Control({
//   // @ts-ignore
//   name: 'upload',
//   x: 0,
//   y: 0,
//   cursorStyle: 'pointer',
//   mouseDownHandler: uploadImageHandler,
//   render: renderUploadHandler,
//   // @ts-ignore
//   ignoreRotate: true,
// });
export var imageControls = {
    tl: controls.tl,
    tr: controls.tr,
    bl: controls.bl,
    br: controls.br,
    mtr: controls.mtr,
    // mr: controls.mr,
    mr: new fabric.Control({
        x: 0.5,
        y: 0,
        actionHandler: scalingEqually,
        // actionHandler: changeWidth,
        cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
        actionName: 'resizing',
    }),
    ml: new fabric.Control({
        x: -0.5,
        y: 0,
        // actionHandler: fabric.controlsUtils.changeWidth,
        actionHandler: scalingEqually,
        cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
        actionName: 'resizing',
    }),
    // ml: controls.ml,
    // mr: controls.mr,
    // mt: controls.mt,
    // mb: controls.mb
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
        positionHandler: imageCornerTL,
        // actionHandler: scaleEquallyCropTL,
        // @ts-ignore
        actionHandler: scaleEquallyCrop,
        render: renderCircleControl,
    }),
    trS: new fabric.Control({
        x: 0.5,
        y: -0.5,
        // @ts-ignore
        name: 'trS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTR,
        // actionHandler: scaleEquallyCropTR,
        // @ts-ignore
        actionHandler: scaleEquallyCrop,
        render: renderCircleControl,
    }),
    blS: new fabric.Control({
        x: -0.5,
        y: 0.5,
        // @ts-ignore
        name: 'blS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBL,
        // actionHandler: scaleEquallyCropBL,
        // @ts-ignore
        actionHandler: scaleEquallyCrop,
        render: renderCircleControl,
    }),
    brS: new fabric.Control({
        x: 0.5,
        y: 0.5,
        // @ts-ignore
        name: 'brS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBR,
        // actionHandler: scaleEquallyCropBR,
        // @ts-ignore
        actionHandler: scaleEquallyCrop,
        render: renderCircleControl,
    }),
    mlS: new fabric.Control({
        x: -0.5,
        y: 0,
        // @ts-ignore
        name: 'mlS',
        cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
        // @ts-ignore
        positionHandler: imageCornerML,
        // @ts-ignore
        actionHandler: scalingXCrop,
        render: renderCircleControl,
        getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    }),
    mrS: new fabric.Control({
        x: 0.5,
        y: 0,
        // @ts-ignore
        name: 'mrS',
        cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
        // @ts-ignore
        positionHandler: imageCornerMR,
        // @ts-ignore
        actionHandler: scalingXCrop,
        render: renderCircleControl,
        getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    }),
};
export var flipXCropControls = {
    tlS: new fabric.Control({
        x: -0.5,
        y: -0.5,
        // @ts-ignore
        name: 'tlS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTR,
        actionHandler: scaleEquallyCropTR,
        render: renderCircleControl,
    }),
    trS: new fabric.Control({
        x: 0.5,
        y: -0.5,
        // @ts-ignore
        name: 'trS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTL,
        // actionHandler: scaleEquallyCropTL,
        render: renderCircleControl,
    }),
    blS: new fabric.Control({
        x: -0.5,
        y: 0.5,
        // @ts-ignore
        name: 'blS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBR,
        actionHandler: scaleEquallyCropBR,
        render: renderCircleControl,
    }),
    brS: new fabric.Control({
        x: 0.5,
        y: 0.5,
        // @ts-ignore
        name: 'brS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBL,
        actionHandler: scaleEquallyCropBL,
        render: renderCircleControl,
    }),
};
export var flipYCropControls = {
    tlS: new fabric.Control({
        x: -0.5,
        y: -0.5,
        // @ts-ignore
        name: 'tlS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBL,
        actionHandler: scaleEquallyCropBL,
        render: renderCircleControl,
    }),
    trS: new fabric.Control({
        x: 0.5,
        y: -0.5,
        // @ts-ignore
        name: 'trS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBR,
        actionHandler: scaleEquallyCropBR,
        render: renderCircleControl,
    }),
    blS: new fabric.Control({
        x: -0.5,
        y: 0.5,
        // @ts-ignore
        name: 'blS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTL,
        // actionHandler: scaleEquallyCropTL,
        render: renderCircleControl,
    }),
    brS: new fabric.Control({
        x: 0.5,
        y: 0.5,
        // @ts-ignore
        name: 'brS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTR,
        actionHandler: scaleEquallyCropTR,
        render: renderCircleControl,
    }),
};
export var flipXYCropControls = {
    tlS: new fabric.Control({
        x: -0.5,
        y: -0.5,
        // @ts-ignore
        name: 'tlS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBR,
        actionHandler: scaleEquallyCropTLFlig,
        render: renderCircleControl,
    }),
    trS: new fabric.Control({
        x: 0.5,
        y: -0.5,
        // @ts-ignore
        name: 'trS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBL,
        actionHandler: scaleEquallyCropTRFlig,
        render: renderCircleControl,
    }),
    blS: new fabric.Control({
        x: -0.5,
        y: 0.5,
        // @ts-ignore
        name: 'blS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTR,
        actionHandler: scaleEquallyCropBLFlig,
        render: renderCircleControl,
    }),
    brS: new fabric.Control({
        x: 0.5,
        y: 0.5,
        // @ts-ignore
        name: 'brS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTL,
        actionHandler: scaleEquallyCropBRFlig,
        render: renderCircleControl,
    }),
};
