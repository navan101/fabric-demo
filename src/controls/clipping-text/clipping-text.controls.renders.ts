import * as fabric from 'fabric';

const GRAPHIC_PATH = 'M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z';
const path = new fabric.Path(GRAPHIC_PATH);

function renderEditClippingTextHandler(ctx:CanvasRenderingContext2D, left:number, top:number, styleOverride:any, fabricObject:any) {
  ctx.save();
  ctx.translate(left, top);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  // @ts-ignore
  path._renderPathCommands(ctx);
  ctx.fill();
  ctx.restore();
}

export {
    renderEditClippingTextHandler,
};
