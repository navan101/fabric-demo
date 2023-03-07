import * as fabric from 'fabric';
var getDistanceFromPointToLine = function (point, pointLineA, pointLineB) {
    var a = pointLineA.y - pointLineB.y;
    var b = pointLineB.x - pointLineA.x;
    var c = pointLineA.x * pointLineB.y - pointLineB.x * pointLineA.y;
    return Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
};
export var saveObjectTransform = function (target) {
    var clippingPath;
    if (target.clippingPath instanceof fabric.Textbox) {
        // console.log(target, 'target');
        // const {
        //   tl: tl1, tr: tr1, bl: bl1,
        // } = target._getCoords(true, true);
        // const {
        //   tl, tr, bl, br,
        // } = target.clippingPath._getCoords(true, true);
        var _a = target.getCoords(true, true), tl1 = _a[0], tr1 = _a[1], br1 = _a[2], bl1 = _a[3];
        var _b = target.clippingPath.getCoords(true, true), tl = _b[0], tr = _b[1], br = _b[2], bl = _b[3];
        var _c = target.clippingPath, width = _c.width, height = _c.height;
        var widthTR = getDistanceFromPointToLine(tr1, tl, bl);
        var heightTR = getDistanceFromPointToLine(tr1, bl, br);
        var minTrScaleX = widthTR / width;
        var minTrScaleY = heightTR / height;
        var widthTl = getDistanceFromPointToLine(tl1, tr, br);
        var heightTl = getDistanceFromPointToLine(bl1, br, bl);
        var minTlScaleX = widthTl / width;
        var minTlScaleY = heightTl / height;
        var widthBR = getDistanceFromPointToLine(tr1, tl, bl);
        var heightBR = getDistanceFromPointToLine(bl1, tl, tr);
        var minBrScaleX = widthBR / width;
        var minBrScaleY = heightBR / height;
        var widthBL = getDistanceFromPointToLine(bl1, tr, br);
        var heightBL = getDistanceFromPointToLine(bl1, tl, tr);
        var minBlScaleX = widthBL / width;
        var minBlScaleY = heightBL / height;
        var widthMl = getDistanceFromPointToLine(tl1, tr, br);
        var minMlScaleX = widthMl / width;
        var widthMr = getDistanceFromPointToLine(tr1, tl, bl);
        var minMrScaleX = widthMr / width;
        clippingPath = {
            scaleFactor: target.clippingPath.scaleFactor || 1,
            scaleX: target.clippingPath.scaleX,
            scaleY: target.clippingPath.scaleY,
            left: target.clippingPath.left,
            top: target.clippingPath.top,
            center: target.clippingPath.getRelativeCenterPoint(),
            minScale: {
                tlS: {
                    scaleX: minTlScaleX,
                    scaleY: minTlScaleY,
                },
                blS: {
                    scaleX: minBlScaleX,
                    scaleY: minBlScaleY,
                },
                trS: {
                    scaleX: minTrScaleX,
                    scaleY: minTrScaleY,
                },
                brS: {
                    scaleX: minBrScaleX,
                    scaleY: minBrScaleY,
                },
                mrS: {
                    scaleX: minMrScaleX,
                    scaleY: Infinity,
                },
                mlS: {
                    scaleX: minMlScaleX,
                    scaleY: Infinity,
                },
            },
        };
    }
    return {
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        originalScaleX: target.originalScaleX,
        originalScaleY: target.originalScaleY,
        skewX: target.skewX,
        skewY: target.skewY,
        angle: target.angle,
        left: target.left,
        top: target.top,
        flipX: target.flipX,
        flipY: target.flipY,
        cropX: target.cropX || 0,
        cropY: target.cropY || 0,
        clippingPath: clippingPath,
        fontSize: target.fontSize,
        styles: target.styles,
        width: target.width,
        height: target.height,
    };
};
