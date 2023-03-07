import { Point } from './Point';
export type IntersectionType = 'Intersection' | 'Coincident' | 'Parallel';
export declare class Intersection {
    points: Point[];
    status?: IntersectionType;
    constructor(status?: IntersectionType);
    /**
     * Used to verify if a point is alredy in the collection
     * @param {Point} point
     * @returns {boolean}
     */
    private includes;
    /**
     * Appends points of intersection
     * @param {...Point[]} points
     * @return {Intersection} thisArg
     * @chainable
     */
    private append;
    /**
     * Checks if a line intersects another
     * @static
     * @param {Point} a1
     * @param {Point} a2
     * @param {Point} b1
     * @param {Point} b2
     * @param {boolean} [aInfinite=true] check segment intersection by passing `false`
     * @param {boolean} [bInfinite=true] check segment intersection by passing `false`
     * @return {Intersection}
     */
    static intersectLineLine(a1: Point, a2: Point, b1: Point, b2: Point, aInfinite?: boolean, bInfinite?: boolean): Intersection;
    /**
     * Checks if a segment intersects a line
     * @see {@link intersectLineLine} for line intersection
     * @static
     * @param {Point} s1 boundary point of segment
     * @param {Point} s2 other boundary point of segment
     * @param {Point} l1 point on line
     * @param {Point} l2 other point on line
     * @return {Intersection}
     */
    static intersectSegmentLine(s1: Point, s2: Point, l1: Point, l2: Point): Intersection;
    /**
     * Checks if a segment intersects another
     * @see {@link intersectLineLine} for line intersection
     * @static
     * @param {Point} a1 boundary point of segment
     * @param {Point} a2 other boundary point of segment
     * @param {Point} b1 boundary point of segment
     * @param {Point} b2 other boundary point of segment
     * @return {Intersection}
     */
    static intersectSegmentSegment(a1: Point, a2: Point, b1: Point, b2: Point): Intersection;
    /**
     * Checks if line intersects polygon
     *
     * @todo account for stroke
     *
     * @static
     * @see {@link intersectSegmentPolygon} for segment intersection
     * @param {Point} a1 point on line
     * @param {Point} a2 other point on line
     * @param {Point[]} points polygon points
     * @param {boolean} [infinite=true] check segment intersection by passing `false`
     * @return {Intersection}
     */
    static intersectLinePolygon(a1: Point, a2: Point, points: Point[], infinite?: boolean): Intersection;
    /**
     * Checks if segment intersects polygon
     * @static
     * @see {@link intersectLinePolygon} for line intersection
     * @param {Point} a1 boundary point of segment
     * @param {Point} a2 other boundary point of segment
     * @param {Point[]} points polygon points
     * @return {Intersection}
     */
    static intersectSegmentPolygon(a1: Point, a2: Point, points: Point[]): Intersection;
    /**
     * Checks if polygon intersects another polygon
     *
     * @todo account for stroke
     *
     * @static
     * @param {Point[]} points1
     * @param {Point[]} points2
     * @return {Intersection}
     */
    static intersectPolygonPolygon(points1: Point[], points2: Point[]): Intersection;
    /**
     * Checks if polygon intersects rectangle
     * @static
     * @see {@link intersectPolygonPolygon} for polygon intersection
     * @param {Point[]} points polygon points
     * @param {Point} r1 top left point of rect
     * @param {Point} r2 bottom right point of rect
     * @return {Intersection}
     */
    static intersectPolygonRectangle(points: Point[], r1: Point, r2: Point): Intersection;
}
//# sourceMappingURL=Intersection.d.ts.map