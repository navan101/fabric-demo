import { TSVGReviver } from '../../typedefs';
import { FabricObjectSVGExportMixin } from '../Object/FabricObjectSVGExportMixin';
export declare class TextSVGExportMixin extends FabricObjectSVGExportMixin {
    _toSVG(): string[];
    toSVG(reviver: TSVGReviver): string;
    private _getSVGLeftTopOffsets;
    private _wrapSVGTextAndBg;
    /**
     * @private
     * @param {Number} textTopOffset Text top offset
     * @param {Number} textLeftOffset Text left offset
     * @return {Object}
     */
    private _getSVGTextAndBg;
    private _createTextCharSpan;
    private _setSVGTextLineText;
    private _setSVGTextLineBg;
    /**
     * @deprecated unused
     */
    _getSVGLineTopOffset(lineIndex: number): {
        lineTop: number;
        offset: number;
    };
    /**
     * Returns styles-string for svg-export
     * @param {Boolean} skipShadow a boolean to skip shadow filter output
     * @return {String}
     */
    getSvgStyles(skipShadow?: boolean): string;
}
//# sourceMappingURL=TextSVGExportMixin.d.ts.map