import type { Object as FabricObject, Point } from 'fabric';
import { TOriginX, TOriginY } from '../typedefs';
import { TPointerEvent, Transform } from '../EventTypeDefs';
export declare const getActionFromCorner: (alreadySelected: boolean, corner: string, e: TPointerEvent, target: FabricObject) => string;
export declare function isTransformCentered(transform: Transform): boolean;
export declare function invertOrigin(origin: TOriginX | TOriginY): number;
export declare const isLocked: (target: FabricObject, lockingKey: 'lockMovementX' | 'lockMovementY' | 'lockRotation' | 'lockScalingX' | 'lockScalingY' | 'lockSkewingX' | 'lockSkewingY' | 'lockScalingFlip') => boolean;
export declare function normalizePoint(target: FabricObject, point: Point, originX: TOriginX, originY: TOriginY): Point;
