var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import extend from 'lodash/extend';
import { util, controlsUtils, Canvas } from 'fabric';
import { getActionFromCorner } from '../controls/util';
import { saveObjectTransform } from '../util/misc/objectTransforms';
var sendPointToPlane = util.sendPointToPlane, degreesToRadians = util.degreesToRadians;
var dragHandler = controlsUtils.dragHandler;
var SelectableCanvasCustom = {
    _getOriginFromCorner: function (target, controlName) {
        var origin = {
            x: target.originX,
            y: target.originY,
        };
        // is a left control ?
        if (['ml', 'tl', 'bl', 'mlS', 'tlS', 'blS'].includes(controlName)) {
            origin.x = 'right';
            // is a right control ?
        }
        else if (['mr', 'tr', 'br', 'mrS', 'trS', 'brS'].includes(controlName)) {
            origin.x = 'left';
        }
        // is a top control ?
        if (['tl', 'mt', 'tr', 'tlS', 'mtS', 'trS'].includes(controlName)) {
            origin.y = 'bottom';
            // is a bottom control ?
        }
        else if (['bl', 'mb', 'br', 'blS', 'mbS', 'brS'].includes(controlName)) {
            origin.y = 'top';
        }
        return origin;
    },
    _setupCurrentTransform: function (e, target, alreadySelected) {
        if (!target) {
            return;
        }
        var pointer = target.group
            ? // transform pointer to target's containing coordinate plane
                sendPointToPlane(this.getPointer(e), undefined, target.group.calcTransformMatrix())
            : this.getPointer(e);
        var corner = target.__corner || '', control = !!corner && target.controls[corner], actionHandler = alreadySelected && control
            ? control.getActionHandler(e, target, control)
            : dragHandler, action = getActionFromCorner(alreadySelected, corner, e, target), origin = this._getOriginFromCorner(target, corner), altKey = e[this.centeredKey], 
        /**
         * relative to target's containing coordinate plane
         * both agree on every point
         **/
        transform = {
            target: target,
            action: action,
            // @ts-ignore
            actionHandler: actionHandler,
            actionPerformed: false,
            corner: corner,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            skewX: target.skewX,
            skewY: target.skewY,
            offsetX: pointer.x - target.left,
            offsetY: pointer.y - target.top,
            originX: origin.x,
            originY: origin.y,
            ex: pointer.x,
            ey: pointer.y,
            lastX: pointer.x,
            lastY: pointer.y,
            // @ts-ignore
            theta: degreesToRadians(target.angle),
            width: target.width,
            height: target.height,
            shiftKey: e.shiftKey,
            altKey: altKey,
            original: __assign(__assign({}, saveObjectTransform(target)), { originX: origin.x, originY: origin.y }),
        };
        if (this._shouldCenterTransform(target, action, altKey)) {
            transform.originX = 'center';
            transform.originY = 'center';
        }
        this._currentTransform = transform;
        // @ts-ignore
        this._beforeTransform(e);
    },
};
extend(Canvas.prototype, SelectableCanvasCustom);
