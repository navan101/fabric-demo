import { AnimationBase } from './AnimationBase';
import { ValueAnimationOptions } from './types';
export declare class ValueAnimation extends AnimationBase<number> {
    constructor({ startValue, endValue, ...otherOptions }: ValueAnimationOptions);
    protected calculate(timeElapsed: number): {
        value: number;
        valueProgress: number;
    };
}
//# sourceMappingURL=ValueAnimation.d.ts.map