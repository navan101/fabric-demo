import type { IText } from './IText';
export type TKeyMapIText = Record<KeyboardEvent['keyCode'], keyof IText>;
export declare const keysMap: TKeyMapIText;
export declare const keysMapRtl: TKeyMapIText;
/**
 * For functionalities on keyUp + ctrl || cmd
 */
export declare const ctrlKeysMapUp: TKeyMapIText;
/**
 * For functionalities on keyDown + ctrl || cmd
 */
export declare const ctrlKeysMapDown: TKeyMapIText;
//# sourceMappingURL=constants.d.ts.map