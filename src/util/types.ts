export const isFabricObjectWithDragSupport = (
  fabricObject?: any
): fabricObject is any => {
  return (
    !!fabricObject &&
    typeof (fabricObject as any).onDragStart ===
      'function' &&
    typeof (fabricObject as any).shouldStartDragging ===
      'function'
  );
};