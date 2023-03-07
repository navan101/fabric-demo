export function containsPoint(pointer, points) {
    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        var xi = points[i].x;
        var yi = points[i].y;
        var xj = points[j].x;
        var yj = points[j].y;
        var intersect = ((yi > pointer.y) !== (yj > pointer.y)) && (pointer.x < (xj - xi) * (pointer.y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
}
