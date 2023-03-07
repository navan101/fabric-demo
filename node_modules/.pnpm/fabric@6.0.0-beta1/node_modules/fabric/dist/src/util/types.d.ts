import type { ActiveSelection } from '../shapes/ActiveSelection';
import type { Group } from '../shapes/Group';
import type { FabricObject, TCachedFabricObject } from '../shapes/Object/Object';
import type { FabricObjectWithDragSupport } from '../shapes/Object/InteractiveObject';
import type { TFiller } from '../typedefs';
import type { Text } from '../shapes/Text/Text';
import type { Pattern } from '../Pattern';
import type { IText } from '../shapes/IText/IText';
import type { Textbox } from '../shapes/Textbox';
export declare const isFiller: (filler: TFiller | string | null) => filler is TFiller;
export declare const isSerializableFiller: (filler: TFiller | string | null) => filler is TFiller;
export declare const isPattern: (filler: TFiller) => filler is Pattern;
export declare const isCollection: (fabricObject?: FabricObject) => fabricObject is Group | ActiveSelection;
export declare const isActiveSelection: (fabricObject?: FabricObject) => fabricObject is ActiveSelection;
export declare const isTextObject: (fabricObject?: FabricObject) => fabricObject is Text<import("../EventTypeDefs").ObjectEvents>;
export declare const isInteractiveTextObject: (fabricObject?: FabricObject) => fabricObject is IText<import("../shapes/IText/ITextBehavior").ITextEvents> | Textbox;
export declare const isFabricObjectCached: (fabricObject: FabricObject) => fabricObject is TCachedFabricObject;
export declare const isFabricObjectWithDragSupport: (fabricObject?: FabricObject) => fabricObject is FabricObjectWithDragSupport;
//# sourceMappingURL=types.d.ts.map