import * as fabric from 'fabric';
declare function fireClippingTextEvent(target: fabric.Object, fnName?: string): void;
declare const scalingEqually: import("fabric/dist/src/EventTypeDefs").TransformActionHandler<any>;
declare const scalingX: import("fabric/dist/src/EventTypeDefs").TransformActionHandler<any>;
declare const scalingY: import("fabric/dist/src/EventTypeDefs").TransformActionHandler<any>;
declare function cornerTL(dim: any, finalMatrix: any, fabricObject: any): {
    x: any;
    y: any;
};
declare function cornerTR(dim: any, finalMatrix: any, fabricObject: any): {
    x: any;
    y: any;
};
declare function cornerML(dim: any, finalMatrix: any, fabricObject: any): {
    x: any;
    y: any;
};
declare function cornerMR(dim: any, finalMatrix: any, fabricObject: any): {
    x: any;
    y: any;
};
declare function cornerBR(dim: any, finalMatrix: any, fabricObject: any): {
    x: any;
    y: any;
};
declare function cornerBL(dim: any, finalMatrix: any, fabricObject: any): {
    x: any;
    y: any;
};
declare function editClippingTextHandler(eventData: any, transform: any): boolean;
export { cornerTL, cornerTR, cornerML, cornerMR, cornerBR, cornerBL, scalingEqually, scalingX, scalingY, editClippingTextHandler, fireClippingTextEvent, };
