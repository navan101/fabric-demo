import { TRGBAColorSource } from '../../color/Color';
import { AnimationBase } from './AnimationBase';
import type { ColorAnimationOptions } from './types';
export declare class ColorAnimation extends AnimationBase<TRGBAColorSource> {
    constructor({ startValue, endValue, easing, onChange, onComplete, abort, ...options }: ColorAnimationOptions);
    protected calculate(timeElapsed: number): {
        value: TRGBAColorSource;
        valueProgress: number;
    };
}
//# sourceMappingURL=ColorAnimation.d.ts.map