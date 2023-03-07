export var isFabricObjectWithDragSupport = function (fabricObject) {
    return (!!fabricObject &&
        typeof fabricObject.onDragStart ===
            'function' &&
        typeof fabricObject.shouldStartDragging ===
            'function');
};
