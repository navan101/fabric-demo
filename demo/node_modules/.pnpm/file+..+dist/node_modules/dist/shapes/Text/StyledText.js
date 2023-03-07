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
// import { FabricObject } from '../Object/FabricObject';
import { Object as FabricObject } from 'fabric';
var StyledText = /** @class */ (function (_super) {
    __extends(StyledText, _super);
    function StyledText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns true if object has no styling or no styling in a line
     * @param {Number} lineIndex , lineIndex is on wrapped lines.
     * @return {Boolean}
     */
    StyledText.prototype.isEmptyStyles = function (lineIndex) {
        if (!this.styles) {
            return true;
        }
        if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
            return true;
        }
        var obj = typeof lineIndex === 'undefined'
            ? this.styles
            : { line: this.styles[lineIndex] };
        for (var p1 in obj) {
            for (var p2 in obj[p1]) {
                // eslint-disable-next-line no-unused-vars
                for (var p3 in obj[p1][p2]) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Returns true if object has a style property or has it ina specified line
     * This function is used to detect if a text will use a particular property or not.
     * @param {String} property to check for
     * @param {Number} lineIndex to check the style on
     * @return {Boolean}
     */
    StyledText.prototype.styleHas = function (property, lineIndex) {
        if (!this.styles || !property || property === '') {
            return false;
        }
        if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
            return false;
        }
        var obj = typeof lineIndex === 'undefined'
            ? this.styles
            : { 0: this.styles[lineIndex] };
        // eslint-disable-next-line
        for (var p1 in obj) {
            // eslint-disable-next-line
            for (var p2 in obj[p1]) {
                if (typeof obj[p1][p2][property] !== 'undefined') {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Check if characters in a text have a value for a property
     * whose value matches the textbox's value for that property.  If so,
     * the character-level property is deleted.  If the character
     * has no other properties, then it is also deleted.  Finally,
     * if the line containing that character has no other characters
     * then it also is deleted.
     *
     * @param {string} property The property to compare between characters and text.
     */
    StyledText.prototype.cleanStyle = function (property) {
        if (!this.styles || !property || property === '') {
            return false;
        }
        var obj = this.styles;
        var stylesCount = 0, letterCount, stylePropertyValue, allStyleObjectPropertiesMatch = true, graphemeCount = 0;
        for (var p1 in obj) {
            letterCount = 0;
            for (var p2 in obj[p1]) {
                var styleObject = obj[p1][p2], 
                // TODO: this shouldn't be necessary anymore with modern browsers
                stylePropertyHasBeenSet = Object.prototype.hasOwnProperty.call(styleObject, property);
                stylesCount++;
                if (stylePropertyHasBeenSet) {
                    if (!stylePropertyValue) {
                        stylePropertyValue = styleObject[property];
                    }
                    else if (styleObject[property] !== stylePropertyValue) {
                        allStyleObjectPropertiesMatch = false;
                    }
                    if (styleObject[property] === this[property]) {
                        delete styleObject[property];
                    }
                }
                else {
                    allStyleObjectPropertiesMatch = false;
                }
                if (Object.keys(styleObject).length !== 0) {
                    letterCount++;
                }
                else {
                    delete obj[p1][p2];
                }
            }
            if (letterCount === 0) {
                delete obj[p1];
            }
        }
        // if every grapheme has the same style set then
        // delete those styles and set it on the parent
        for (var i = 0; i < this._textLines.length; i++) {
            graphemeCount += this._textLines[i].length;
        }
        if (allStyleObjectPropertiesMatch && stylesCount === graphemeCount) {
            this[property] = stylePropertyValue;
            this.removeStyle(property);
        }
    };
    /**
     * Remove a style property or properties from all individual character styles
     * in a text object.  Deletes the character style object if it contains no other style
     * props.  Deletes a line style object if it contains no other character styles.
     *
     * @param {String} props The property to remove from character styles.
     */
    StyledText.prototype.removeStyle = function (property) {
        if (!this.styles || !property || property === '') {
            return;
        }
        var obj = this.styles;
        var line, lineNum, charNum;
        for (lineNum in obj) {
            line = obj[lineNum];
            for (charNum in line) {
                delete line[charNum][property];
                if (Object.keys(line[charNum]).length === 0) {
                    delete line[charNum];
                }
            }
            if (Object.keys(line).length === 0) {
                delete obj[lineNum];
            }
        }
    };
    StyledText.prototype._extendStyles = function (index, styles) {
        var _a = this.get2DCursorLocation(index), lineIndex = _a.lineIndex, charIndex = _a.charIndex;
        if (!this._getLineStyle(lineIndex)) {
            this._setLineStyle(lineIndex);
        }
        if (!this._getStyleDeclaration(lineIndex, charIndex)) {
            this._setStyleDeclaration(lineIndex, charIndex, {});
        }
        return Object.assign(this._getStyleDeclaration(lineIndex, charIndex) || {}, styles);
    };
    /**
     * Gets style of a current selection/cursor (at the start position)
     * @param {Number} startIndex Start index to get styles at
     * @param {Number} endIndex End index to get styles at, if not specified startIndex + 1
     * @param {Boolean} [complete] get full style or not
     * @return {Array} styles an array with one, zero or more Style objects
     */
    StyledText.prototype.getSelectionStyles = function (startIndex, endIndex, complete) {
        var styles = [];
        for (var i = startIndex; i < (endIndex || startIndex); i++) {
            styles.push(this.getStyleAtPosition(i, complete));
        }
        return styles;
    };
    /**
     * Gets style of a current selection/cursor position
     * @param {Number} position  to get styles at
     * @param {Boolean} [complete] full style if true
     * @return {Object} style Style object at a specified index
     * @private
     */
    StyledText.prototype.getStyleAtPosition = function (position, complete) {
        var _a = this.get2DCursorLocation(position), lineIndex = _a.lineIndex, charIndex = _a.charIndex;
        return ((complete
            ? this.getCompleteStyleDeclaration(lineIndex, charIndex)
            : this._getStyleDeclaration(lineIndex, charIndex)) || {});
    };
    /**
     * Sets style of a current selection, if no selection exist, do not set anything.
     * @param {Object} styles Styles object
     * @param {Number} startIndex Start index to get styles at
     * @param {Number} [endIndex] End index to get styles at, if not specified startIndex + 1
     */
    StyledText.prototype.setSelectionStyles = function (styles, startIndex, endIndex) {
        for (var i = startIndex; i < (endIndex || startIndex); i++) {
            this._extendStyles(i, styles);
        }
        /* not included in _extendStyles to avoid clearing cache more than once */
        this._forceClearCache = true;
    };
    /**
     * get the reference, not a clone, of the style object for a given character
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @return {Object} style object
     */
    StyledText.prototype._getStyleDeclaration = function (lineIndex, charIndex) {
        var lineStyle = this.styles && this.styles[lineIndex];
        if (!lineStyle) {
            return null;
        }
        return lineStyle[charIndex];
    };
    /**
     * return a new object that contains all the style property for a character
     * the object returned is newly created
     * @param {Number} lineIndex of the line where the character is
     * @param {Number} charIndex position of the character on the line
     * @return {Object} style object
     */
    StyledText.prototype.getCompleteStyleDeclaration = function (lineIndex, charIndex) {
        var style = this._getStyleDeclaration(lineIndex, charIndex) || {}, styleObject = {};
        for (var i = 0; i < this._styleProperties.length; i++) {
            var prop = this._styleProperties[i];
            styleObject[prop] =
                typeof style[prop] === 'undefined'
                    ? this[prop]
                    : style[prop];
        }
        return styleObject;
    };
    /**
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @param {Object} style
     * @private
     */
    StyledText.prototype._setStyleDeclaration = function (lineIndex, charIndex, style) {
        this.styles[lineIndex][charIndex] = style;
    };
    /**
     *
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @private
     */
    StyledText.prototype._deleteStyleDeclaration = function (lineIndex, charIndex) {
        delete this.styles[lineIndex][charIndex];
    };
    /**
     * @param {Number} lineIndex
     * @return {Boolean} if the line exists or not
     * @private
     */
    StyledText.prototype._getLineStyle = function (lineIndex) {
        return !!this.styles[lineIndex];
    };
    /**
     * Set the line style to an empty object so that is initialized
     * @param {Number} lineIndex
     * @private
     */
    StyledText.prototype._setLineStyle = function (lineIndex) {
        this.styles[lineIndex] = {};
    };
    StyledText.prototype._deleteLineStyle = function (lineIndex) {
        delete this.styles[lineIndex];
    };
    return StyledText;
}(FabricObject));
export { StyledText };
