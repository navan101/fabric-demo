import * as fabric from 'fabric';

const { degreesToRadians } = fabric.util;
const GRAPHIC_PATH = 'M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z';
const UPLOAD_LABEL = 'Click to Upload';
const UPLOAD_LABEL_FONT = 'bold 16px "Open Sans"';
const UPLOAD_LABEL_STROKE = '#ffffff';
const UPLOAD_FILL = '#eef6f7';
const UPLOAD_RADIUS = 2;
const path = new fabric.Path(GRAPHIC_PATH);

function renderEditClippingMaskHandler(ctx:CanvasRenderingContext2D, left:number, top:number, styleOverride:any, fabricObject:any) {
  ctx.save();
  ctx.translate(left, top);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  // @ts-ignore
  path._renderPathCommands(ctx);
  ctx.fill();
  ctx.restore();
}

function renderCropMiddle(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
  const cSize = 12;
  const cSizeBy2 = cSize / 2;
  ctx.save();
  ctx.translate(left, top);
  // @ts-ignore
  ctx.rotate(degreesToRadians(this.angle + fabricObject.angle));
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#dfe2e8';
  ctx.moveTo(-cSizeBy2, 0);
  ctx.lineTo(cSizeBy2, 0);
  ctx.stroke();
  ctx.restore();
}

function renderWithShadows(x: number, y: number, fn: Function) {
  // eslint-disable-next-line func-names
  return function (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
    ctx.save();
    ctx.shadowColor = 'rgba(12, 18, 28, 0.38)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = x;
    ctx.shadowOffsetY = y;
    // @ts-ignore
    fn.call(this, ctx, left, top, styleOverride, fabricObject);
    ctx.restore();
  };
}

function renderFillClippingMaskHandler(ctx:CanvasRenderingContext2D, left:number, top:number, styleOverride:any, fabricObject:any) {
  // @ts-ignore
  const size = this.cornerSize;
  const radius = 2 * Math.PI;
  ctx.save();
  ctx.translate(left, top);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle!));
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, radius);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, radius);
  if (fabricObject.isFillClippingMask) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
  ctx.closePath();
  ctx.restore();
}

function renderRect(ctx:CanvasRenderingContext2D,
  x:number,
  y:number,
  width:number,
  height:number,
  fill = false,
  radius = 2,
  stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }
}

enum DesignUnit {
  centimeters = 'centimeters',
  inches = 'inches',
  millimeters = 'millimeters',
}

export function convertPixelToUnit(value: number, unit: string, resolution: number) {
  if (unit === DesignUnit.centimeters) {
    return (value / resolution) * 2.54;
  }
  if (unit === DesignUnit.millimeters) {
    return (value / resolution) * 25.4;
  }
  if (unit === DesignUnit.inches) {
    return value / resolution;
  }
  return value;
}

function renderUploadHandler(this:any, ctx:CanvasRenderingContext2D, left:number, top:number, styleOverride:any, fabricObject:any) {
  const settings = fabricObject.canvas.ruler.getSettings();
  const { unit, ppi } = settings;
  const widthEl = Number(convertPixelToUnit(fabricObject.getScaledWidth(), unit, ppi).toFixed(2));
  if (widthEl >= 2) {
    const prototype = Object.getPrototypeOf(fabricObject);
    const text = prototype.uploadLabel || UPLOAD_LABEL;
    const font = prototype.uploadFont || UPLOAD_LABEL_FONT;
    const stroke = prototype.uploadStroke || UPLOAD_LABEL_STROKE;
    const fill = prototype.uploadFill || UPLOAD_FILL;
    const radius = prototype.uploadRadius || UPLOAD_RADIUS;
    const textColor = prototype.cornerColor || 'black';
    if (!this.sizeX || !this.sizeY) {
      const PADDING = {
        x: 5,
        y: 10,
      };
      const canvas = document.createElement('canvas');
      const tmpCtx = <CanvasRenderingContext2D>canvas.getContext('2d');
      tmpCtx.font = font;
      this.sizeX = tmpCtx.measureText(text).width + PADDING.x;
      this.sizeY = tmpCtx.measureText('M').width + PADDING.y;
    }
    const rectWidth = this.sizeX;
    const rectHeight = this.sizeY;
    const rectX = 0;
    const rectY = 0;

    ctx.save();
    ctx.translate(left - (rectWidth / 2), top - (rectHeight / 2));
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    renderRect(ctx, rectX, rectY, rectWidth, rectHeight, true, radius);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, rectX + (rectWidth / 2), rectY + (rectHeight / 2));
    ctx.restore();
  } else if (widthEl >= 0.75) {
    // eslint-disable-next-line max-len
    const pathStr1 = 'M30.3107 7L31.7049 7.01554L31.6854 9.2772L34 9.26166L33.9845 10.6528L31.6583 10.6723L31.6427 13L30.2485 12.9845V10.6762L28 10.6917L28.0155 9.30052L30.2874 9.28109L30.3107 7Z';
    const pathShape1 = new fabric.Path(pathStr1);
    // eslint-disable-next-line max-len
    const pathStr2 = 'M23.29 19.91H2.1C1.49 19.91 1 19.42 1 18.82V2.1C1 1.49 1.49 1 2.09 1H23.29C23.9 1 24.39 1.49 24.39 2.09V18.81C24.39 19.42 23.9 19.91 23.3 19.91';
    const pathShape2 = new fabric.Path(pathStr2);
    // eslint-disable-next-line max-len
    const pathStr3 = 'M2.1 1H23.29C23.9 1 24.39 1.49 24.39 2.1V18.81C24.39 19.42 23.9 19.91 23.29 19.91H2.1C1.49 19.91 1 19.42 1 18.81V2.1C1 1.5 1.49 1 2.1 1Z';
    const pathShape3 = new fabric.Path(pathStr3);
    // eslint-disable-next-line max-len
    const pathStr4 = 'M23.29 19.91H2.1C1.49 19.91 1 19.42 1 18.82V2.1C1 1.49 1.49 1 2.09 1H23.29C23.9 1 24.39 1.49 24.39 2.09V18.81C24.39 19.42 23.9 19.91 23.3 19.91';
    const pathShape4 = new fabric.Path(pathStr4);
    // eslint-disable-next-line max-len
    const pathStr5 = 'M2.54999 16.02L9.28999 9.79001L12.65 12.49L16.81 6.04001L22.99 16.08L2.54999 16.02Z';
    const pathShape5 = new fabric.Path(pathStr5);
    // eslint-disable-next-line max-len
    const pathStr6 = 'M7.75 5.74452C7.75 6.85137 6.85249 7.75 5.74446 7.75C4.63643 7.75 3.75 6.86233 3.75 5.75548C3.75 4.64863 4.64751 3.75 5.75554 3.75C6.86357 3.75 7.75 4.63767 7.75 5.74452Z';
    const pathShape6 = new fabric.Path(pathStr6);

    ctx.save();
    ctx.translate(left + 18, top);
    ctx.fillStyle = '#686F77';
    // @ts-ignore
    pathShape1._renderPathCommands(ctx);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(left, top);
    ctx.fillStyle = '#686F77';
    ctx.strokeStyle = '#686F77';
    // ctx.lineWidth = 1;
    ctx.miterLimit = 10;
    // @ts-ignore
    pathShape2._renderPathCommands(ctx);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(left, top);
    ctx.fillStyle = '#686F77';
    ctx.strokeStyle = '#686F77';
    // ctx.lineWidth = 1;
    ctx.miterLimit = 10;
    // @ts-ignore
    pathShape3._renderPathCommands(ctx);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(left, top);
    ctx.fillStyle = '#FFFFFF';
    // @ts-ignore
    pathShape4._renderPathCommands(ctx);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(left, top);
    ctx.fillStyle = '#686F77';
    // @ts-ignore
    pathShape5._renderPathCommands(ctx);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(left - 8, top - 5);
    ctx.fillStyle = '#686F77';
    // @ts-ignore
    pathShape6._renderPathCommands(ctx);
    ctx.fill();
    ctx.restore();
  } else {
    // eslint-disable-next-line max-len
    const pathStr = 'M2.31068 0L3.70485 0.015544L3.68544 2.2772L6 2.26166L5.98447 3.65285L3.65825 3.67228L3.64272 6L2.24854 5.98446V3.67617L0 3.69171L0.0155343 2.30052L2.28738 2.28109L2.31068 0Z';
    const pathShape = new fabric.Path(pathStr);
    ctx.save();
    ctx.translate(left, top);
    ctx.fillStyle = '#686F77';
    // @ts-ignore
    pathShape._renderPathCommands(ctx);
    ctx.fill();
    ctx.restore();
  }
}

export {
  renderCropMiddle,
  renderWithShadows,
  renderFillClippingMaskHandler,
  renderEditClippingMaskHandler,
  renderUploadHandler,
};
