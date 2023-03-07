import * as fabric from 'fabric';
import { cropFromTop, cropFromTopFlig, cropFromLeft, cropFromLeftFlig, cropFromRight, cropFromRightFlig, cropFromBottom, cropFromBottomFlig, cropFromBottomLeft, cropFromBottomRight, cropFromTopLeft, cropFromTopRight, imageCornerBL, imageCornerBR, imageCornerTL, imageCornerTR, scaleEquallyCropBL, scaleEquallyCropBR, scaleEquallyCropTL, scaleEquallyCropTR, scaleEquallyCropTLFlig, scaleEquallyCropBRFlig, scaleEquallyCropTRFlig, scaleEquallyCropBLFlig } from './cropping.controls.handlers';
import { renderCropCorner, renderCropMiddle, renderWithShadows } from './cropping.controls.renders';
// @ts-ignore
var _a = fabric.controlsUtils, scaleCursorStyleHandler = _a.scaleCursorStyleHandler, renderCircleControl = _a.renderCircleControl;
var renderCropTL = renderWithShadows(2, 2, renderCropCorner);
var renderCropTR = renderWithShadows(-2, 2, renderCropCorner);
var renderCropBL = renderWithShadows(2, -2, renderCropCorner);
var renderCropBR = renderWithShadows(-2, -2, renderCropCorner);
var renderCropMT = renderWithShadows(0, 2, renderCropMiddle);
var renderCropMB = renderWithShadows(0, -2, renderCropMiddle);
var renderCropML = renderWithShadows(2, 0, renderCropMiddle);
var renderCropMR = renderWithShadows(-2, 0, renderCropMiddle);
export var croppingControlSet = {
    tlS: new fabric.Control({
        x: -0.5, y: -0.5,
        // @ts-ignore
        name: 'tlS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTL,
        actionHandler: scaleEquallyCropTL,
        render: renderCircleControl,
    }),
    trS: new fabric.Control({
        x: 0.5, y: -0.5,
        // @ts-ignore
        name: 'trS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerTR,
        actionHandler: scaleEquallyCropTR,
        render: renderCircleControl,
    }),
    blS: new fabric.Control({
        x: -0.5, y: 0.5,
        // @ts-ignore
        name: 'blS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBL,
        actionHandler: scaleEquallyCropBL,
        render: renderCircleControl,
    }),
    brS: new fabric.Control({
        x: 0.5, y: 0.5,
        // @ts-ignore
        name: 'brS',
        cursorStyleHandler: scaleCursorStyleHandler,
        positionHandler: imageCornerBR,
        actionHandler: scaleEquallyCropBR,
        render: renderCircleControl,
    }),
    cropLeft: new fabric.Control({
        x: -0.5, y: 0,
        // @ts-ignore
        name: 'cropLeft',
        render: renderCropML,
        actionHandler: cropFromLeft,
        angle: 90,
    }),
    cropRight: new fabric.Control({
        x: 0.5, y: 0,
        // @ts-ignore
        name: 'cropRight',
        render: renderCropMR,
        actionHandler: cropFromRight,
        angle: 90,
    }),
    cropTop: new fabric.Control({
        x: 0, y: -0.5,
        // @ts-ignore
        name: 'cropTop',
        render: renderCropMT,
        actionHandler: cropFromTop,
    }),
    cropBottom: new fabric.Control({
        x: 0, y: 0.5,
        // @ts-ignore
        name: 'cropBottom',
        render: renderCropMB,
        actionHandler: cropFromBottom,
    }),
    cropCornerTL: new fabric.Control({
        x: -0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTL',
        render: renderCropTL,
        actionHandler: cropFromTopLeft,
    }),
    cropCornerBL: new fabric.Control({
        x: -0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBL',
        render: renderCropBL,
        angle: 270,
        actionHandler: cropFromBottomLeft,
    }),
    cropCornerBR: new fabric.Control({
        x: 0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBR',
        render: renderCropBR,
        angle: 180,
        actionHandler: cropFromBottomRight,
    }),
    cropCornerTR: new fabric.Control({
        x: 0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTR',
        render: renderCropTR,
        angle: 90,
        actionHandler: cropFromTopRight,
    }),
};
var fabricObjectControls = fabric.Object.prototype.controls;
export var standardControlSet = fabricObjectControls;
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
        actionHandler: scaleEquallyCropTL,
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
    cropLeft: new fabric.Control({
        x: -0.5, y: 0,
        // @ts-ignore
        name: 'cropLeft',
        render: renderCropML,
        actionHandler: cropFromLeftFlig,
        angle: 90,
    }),
    cropRight: new fabric.Control({
        x: 0.5, y: 0,
        // @ts-ignore
        name: 'cropRight',
        render: renderCropMR,
        actionHandler: cropFromRightFlig,
        angle: 90,
    }),
    cropTop: new fabric.Control({
        x: 0, y: -0.5,
        // @ts-ignore
        name: 'cropTop',
        render: renderCropMT,
        actionHandler: cropFromTop,
    }),
    cropBottom: new fabric.Control({
        x: 0, y: 0.5,
        // @ts-ignore
        name: 'cropBottom',
        render: renderCropMB,
        actionHandler: cropFromBottom,
    }),
    cropCornerTL: new fabric.Control({
        x: -0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTL',
        render: renderCropTL,
        actionHandler: cropFromTopLeft,
    }),
    cropCornerBL: new fabric.Control({
        x: -0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBL',
        render: renderCropBL,
        angle: 270,
        actionHandler: cropFromBottomLeft,
    }),
    cropCornerBR: new fabric.Control({
        x: 0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBR',
        render: renderCropBR,
        angle: 180,
        actionHandler: cropFromBottomRight,
    }),
    cropCornerTR: new fabric.Control({
        x: 0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTR',
        render: renderCropTR,
        angle: 90,
        actionHandler: cropFromTopRight,
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
        actionHandler: scaleEquallyCropTL,
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
    cropLeft: new fabric.Control({
        x: -0.5, y: 0,
        // @ts-ignore
        name: 'cropLeft',
        render: renderCropML,
        actionHandler: cropFromLeft,
        angle: 90,
    }),
    cropRight: new fabric.Control({
        x: 0.5, y: 0,
        // @ts-ignore
        name: 'cropRight',
        render: renderCropMR,
        actionHandler: cropFromRight,
        angle: 90,
    }),
    cropTop: new fabric.Control({
        x: 0, y: -0.5,
        // @ts-ignore
        name: 'cropTop',
        render: renderCropMT,
        actionHandler: cropFromTopFlig,
    }),
    cropBottom: new fabric.Control({
        x: 0, y: 0.5,
        // @ts-ignore
        name: 'cropBottom',
        render: renderCropMB,
        actionHandler: cropFromBottomFlig,
    }),
    cropCornerTL: new fabric.Control({
        x: -0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTL',
        render: renderCropTL,
        actionHandler: cropFromTopLeft,
    }),
    cropCornerBL: new fabric.Control({
        x: -0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBL',
        render: renderCropBL,
        angle: 270,
        actionHandler: cropFromBottomLeft,
    }),
    cropCornerBR: new fabric.Control({
        x: 0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBR',
        render: renderCropBR,
        angle: 180,
        actionHandler: cropFromBottomRight,
    }),
    cropCornerTR: new fabric.Control({
        x: 0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTR',
        render: renderCropTR,
        angle: 90,
        actionHandler: cropFromTopRight,
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
    cropLeft: new fabric.Control({
        x: -0.5, y: 0,
        // @ts-ignore
        name: 'cropLeft',
        render: renderCropML,
        actionHandler: cropFromLeftFlig,
        angle: 90,
    }),
    cropRight: new fabric.Control({
        x: 0.5, y: 0,
        // @ts-ignore
        name: 'cropRight',
        render: renderCropMR,
        actionHandler: cropFromRightFlig,
        angle: 90,
    }),
    cropTop: new fabric.Control({
        x: 0, y: -0.5,
        // @ts-ignore
        name: 'cropTop',
        render: renderCropMT,
        actionHandler: cropFromTopFlig,
    }),
    cropBottom: new fabric.Control({
        x: 0, y: 0.5,
        // @ts-ignore
        name: 'cropBottom',
        render: renderCropMB,
        actionHandler: cropFromBottomFlig,
    }),
    cropCornerTL: new fabric.Control({
        x: -0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTL',
        render: renderCropTL,
        actionHandler: cropFromTopLeft,
    }),
    cropCornerBL: new fabric.Control({
        x: -0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBL',
        render: renderCropBL,
        angle: 270,
        actionHandler: cropFromBottomLeft,
    }),
    cropCornerBR: new fabric.Control({
        x: 0.5, y: 0.5,
        // @ts-ignore
        name: 'cropCornerBR',
        render: renderCropBR,
        angle: 180,
        actionHandler: cropFromBottomRight,
    }),
    cropCornerTR: new fabric.Control({
        x: 0.5, y: -0.5,
        // @ts-ignore
        name: 'cropCornerTR',
        render: renderCropTR,
        angle: 90,
        actionHandler: cropFromTopRight,
    }),
};
