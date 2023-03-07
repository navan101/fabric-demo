import { TPointerEvent } from '../EventTypeDefs';
import type { ITextBehavior } from '../shapes/IText/ITextBehavior';
/**
 * In charge of synchronizing all interactive text instances of a canvas
 */
export declare class TextEditingManager {
    private targets;
    private target?;
    exitTextEditing(): void;
    add(target: ITextBehavior): void;
    remove(target: ITextBehavior): void;
    register(target: ITextBehavior): void;
    unregister(target: ITextBehavior): void;
    onMouseMove(e: TPointerEvent): void;
    dispose(): void;
}
//# sourceMappingURL=TextEditingManager.d.ts.map