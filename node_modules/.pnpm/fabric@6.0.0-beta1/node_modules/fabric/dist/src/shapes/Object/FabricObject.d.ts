import { ObjectEvents } from '../../EventTypeDefs';
import { FabricObjectSVGExportMixin } from './FabricObjectSVGExportMixin';
import { InteractiveFabricObject } from './InteractiveObject';
export interface FabricObject<EventSpec extends ObjectEvents = ObjectEvents> extends FabricObjectSVGExportMixin {
}
export declare class FabricObject<EventSpec extends ObjectEvents = ObjectEvents> extends InteractiveFabricObject<EventSpec> {
}
export { cacheProperties, stateProperties } from './defaultValues';
//# sourceMappingURL=FabricObject.d.ts.map