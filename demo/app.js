import * as fabric from 'fabric-editor';
// import * as fabric from 'fabric';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const urlImage = require('./image.jpg');
const url = 'https://images.unsplash.com/photo-1661956602116-aa6865609028?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MXwxfGFsbHwxfHx8fHx8Mnx8MTY3NTc2MjI0OA&ixlib=rb-4.0.3&q=80&w=400';
var img01URL =
  'https://images.unsplash.com/photo-1638913971873-bcef634bdcd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MXwxfGFsbHwyNnx8fHx8fDJ8fDE2NDY2Mzk3MjE&ixlib=rb-1.2.1&q=80&w=400';
var img02URL =
  'https://images.unsplash.com/photo-1645403725786-b3aadcec257d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MHwxfGFsbHw4NXx8fHx8fDJ8fDE2NDU0OTQ4NDM&ixlib=rb-1.2.1&q=80&w=400';

function addImage(canvas, imgURL, top, left, elementKeys) {
  if (canvas) {
    fabric.EditorImage.fromURL(imgURL, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      img.set({
        elementKey: getElementKey(),
        top,
        left,
      });
      canvas.add(img);
      // const rect1 = new fabric.Rect({
      //   top: 100,
      //   left : 100,
      //   width: 100,
      //   height: 100,
      //   fill: 'red'
      // })
      // const rect2 = new fabric.Rect({
      //   top: 500,
      //   left : 500,
      //   width: 100,
      //   height: 100,
      // })
      // const group = new fabric.Group([rect1, rect2, img], {
      //   interactive: true,
      //   subTargetCheck: true,
      //   objectCaching: false,
      // })
      // canvas.add(group);
      if (elementKeys) {
        elementKeys.push(img.elementKey);
      }
    })
  }
}

function getElementKey(length = 6) {
  let result = '';
  const characters = 'abcdef0123456789';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getFabricElementByKey(canvas, elementKey) {
  // @ts-ignore
  return canvas.getObjects().find((item) => item.elementKey === elementKey);
}

export function checkRelativePositionBetweenElements(originalImage, originalClipPath) {
  const ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
  const ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();
  originalImage.angle = 0;

  if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
    console.log('if')
    const scale = originalImage.scaleY / originalImage.scaleX;
    // originalImage.scaleToWidth(originalClipPath.getScaledWidth())
    const scaleToWidth = originalClipPath.getScaledWidth() / originalImage.width;
    originalImage.scale(scaleToWidth);
    originalImage.scaleY = scale * originalImage.scaleX;
  } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
    const scale = originalImage.scaleX / originalImage.scaleY;
    const scaleToHeight = originalClipPath.getScaledHeight() / originalImage.height;
    originalImage.scale(scaleToHeight);
    // originalImage.scaleToHeight(originalClipPath.getScaledHeight());
    originalImage.scaleX = scale * originalImage.scaleY;
  }

  const imageLeft = originalClipPath.left - ((originalImage.getScaledWidth() - originalClipPath.getScaledWidth()) / 2);
  const imageTop = originalClipPath.top - ((originalImage.getScaledHeight() - originalClipPath.getScaledHeight()) / 2);

  return {
    imageLeft,
    imageTop,
  };
}

export function checkRelativePositionBetweenElementsClippingText(
  originalImage,
  originalClipPath,
) {
  const ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
  const ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();

  if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
    const scale = originalImage.scaleY / originalImage.scaleX;
    const scaleToWidth = originalClipPath.getScaledWidth() / originalImage.width;
    originalImage.scale(scaleToWidth);
    originalImage.scaleY = scale * originalImage.scaleX;
  } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
    const scale = originalImage.scaleX / originalImage.scaleY;
    const scaleToHeight = originalClipPath.getScaledHeight() / originalImage.height;
    originalImage.scale(scaleToHeight);
    originalImage.scaleX = scale * originalImage.scaleY;
  }

  const centerPoint = originalClipPath.getCenterPoint();
  const imageLeft = centerPoint.x - (originalImage.getScaledWidth()) / 2;
  const imageTop = centerPoint.y - (originalImage.getScaledHeight()) / 2;

  const rotationPoint = new fabric.Point(imageLeft, imageTop);
  const angleRadians = fabric.util.degreesToRadians(
    originalClipPath.angle,
  );
  const newCoords = fabric.util.rotatePoint(
    rotationPoint,
    centerPoint,
    angleRadians,
  );
  originalImage.set({
    left: newCoords.x,
    top: newCoords.y,
    angle: originalClipPath.angle,
  });
  originalImage.setCoords();
}


(() => {
  const fabricCanvas = new fabric.EditorCanvas('fabric-canvas', {
  });
  fabricCanvas.setDimensions({
    width: 800,
    height: 800,
  });
  fabricCanvas.setZoom(0.5);

  const elementKeys = [];

  const textObject = {
    originalText: 'Clipping Text',
    text: 'Clipping Text',
    elementKey: getElementKey(),
    fontSize: 120,
    top: 700,
    left: 350,
    width: 800,
    textAlign: 'center'
  }

  addImage(fabricCanvas, img02URL, 300, 400, elementKeys);
  const textbox = fabric.EditorTextbox.fromObject(textObject);
  textbox.then((item) => {
    fabricCanvas.add(item)
    fabricCanvas.setActiveObject(item);
    elementKeys.push(item.elementKey);
  });

  // const text = new fabric.EditorTextbox('Clipping Text', {
  //   elementKey: getElementKey(),
  //   fontSize: 120,
  //   top: 100,
  //   left: 100,
  //   width: 800,
  //   textAlign: 'center'
  // });
  // fabricCanvas.add(text)
  // elementKeys.push(text.elementKey);

  // addImage(fabricCanvas, img01URL, 200, 200, elementKeys);
  // addImage(fabricCanvas, img02URL, 300, 400, elementKeys);
  // fabric.EditorImage.fromURL(img02URL, {
  //   crossOrigin: 'anonymous'
  // }).then((img) => {
  //   img.set({
  //     elementKey: getElementKey(),
  //     top: 300,
  //     left: 400,
  //   });
  //   fabricCanvas.add(img);
  // });


  // $('#createClipMask').click(function () {
  //   createClippingMask(fabricCanvas, elementKeys);
  // });

  document.getElementById('createClipMask').onclick = function () {
    createClippingMask(fabricCanvas, elementKeys)
  }

  function createClippingMask(canvas, elementKeys) {
    const clipPathElementKey = elementKeys[0];
    const imageElementKey = elementKeys[1];

    const originalClipPath = getFabricElementByKey(canvas, clipPathElementKey);
    const originalImage = getFabricElementByKey(canvas, imageElementKey);

    const { imageLeft, imageTop } = checkRelativePositionBetweenElements(
      originalImage,
      originalClipPath,
    );
    console.log(originalImage.scaleX, 'originalImage')
    const element = originalImage.toCanvasElement({
      withoutShadow: true,
      withoutOuterGlow: true,
    });
    // originalClipPath.scaleX /= originalImage.scaleX;
    // originalClipPath.scaleY /= originalImage.scaleY;

    const objectClippingMask = {
      // type: 'clipping-mask',
      left: imageLeft,
      top: imageTop,
      clippingPath: originalClipPath,
      __element: element,
      // scaleX: originalImage.scaleX,
      // scaleY: originalImage.scaleY,
      // __originalElement: element._originalElement,
      // __element: element._originalElement,
      // __element: originalImage._element,
    }
    const clippingMask = fabric.EditorClippingMask.fromObject(objectClippingMask);
    clippingMask.then((img) => {
      Object.assign(img, img.calcImageByClipPath());
      console.log(img, 'img');
      canvas.add(img);
      canvas.remove(originalImage);
      canvas.remove(originalClipPath);
      canvas.requestRenderAll();
      window.fabricCanvas = canvas;
    })
  }


  document.getElementById('createClipText').onclick = function () {
    // prompt('Hello world');
    createClipText1(fabricCanvas, elementKeys);
  }
  // $('#createClipText').click(function () {
  //   // createClipText(fabricCanvas, elementKeys);
  //   createClipText1(fabricCanvas, elementKeys);
  // });

  function createClipText(canvas, elementKeys) {
    const clipPathElementKey = elementKeys[0];
    const imageElementKey = elementKeys[1];

    const originalClipPath = getFabricElementByKey(canvas, clipPathElementKey);
    const originalImage = getFabricElementByKey(canvas, imageElementKey);

    // const { imageLeft, imageTop } = checkRelativePositionBetweenElements(
    //   originalImage,
    //   originalClipPath,
    // );
    // console.log(originalImage, 'originalImage');
    // const element = originalImage.toCanvasElement({
    //   withoutShadow: true,
    //   withoutOuterGlow: true,
    // });

    const objectClippingText = {
      ...originalClipPath.toObject(),
      type: 'clipping-text',
    }
    const clippingText = fabric.EditorClippingText.fromObject(objectClippingText);
    clippingText.then((item) => {
      checkRelativePositionBetweenElementsClippingText(originalImage, item);
      item.pattern = originalImage;
      // Object.assign(img, img.calcImageByClipPath());
      canvas.add(item);
      // canvas.insertAt(0, img)
      canvas.remove(originalImage);
      canvas.remove(originalClipPath);
      canvas.requestRenderAll();
      window.fabricCanvas = canvas;
    })
  }

  function createClipText1(canvas, elementKeys) {
    const imageElementKey = elementKeys[1];
    const originalImage = getFabricElementByKey(canvas, imageElementKey);
    const fabricActiveObject = fabricCanvas.getActiveObject();
    checkRelativePositionBetweenElementsClippingText(originalImage, fabricActiveObject)
    // fabricActiveObject.set('clippingPath', originalImage)
    fabricActiveObject.clippingPath = originalImage;
    Object.assign(fabricActiveObject, fabricActiveObject.calcTextByClipPath());
    console.log(fabricActiveObject, 'fabricActiveObject');
    fabricActiveObject.set('clippingPath', originalImage)
    canvas.remove(originalImage);
    fabricCanvas.requestRenderAll();
  }

  function checkRelativePositionBetweenElementsClippingText(
    originalImage,
    originalClipPath,
  ) {
    const ratioWidthAndHeightClipPath = originalClipPath.getScaledWidth() / originalClipPath.getScaledHeight();
    const ratioWidthAndHeightImage = originalImage.getScaledWidth() / originalImage.getScaledHeight();

    if (ratioWidthAndHeightClipPath >= ratioWidthAndHeightImage) {
      const scale = originalImage.scaleY / originalImage.scaleX;
      const scaleToWidth = originalClipPath.getScaledWidth() / originalImage.width;
      originalImage.scale(scaleToWidth);
      originalImage.scaleY = scale * originalImage.scaleX;
    } else if (ratioWidthAndHeightClipPath <= ratioWidthAndHeightImage) {
      const scale = originalImage.scaleX / originalImage.scaleY;
      const scaleToHeight = originalClipPath.getScaledHeight() / originalImage.height;
      originalImage.scale(scaleToHeight);
      originalImage.scaleX = scale * originalImage.scaleY;
    }

    const centerPoint = originalClipPath.getCenterPoint();
    const imageLeft = centerPoint.x - (originalImage.getScaledWidth()) / 2;
    const imageTop = centerPoint.y - (originalImage.getScaledHeight()) / 2;

    const rotationPoint = new fabric.Point(imageLeft, imageTop);
    const angleRadians = fabric.util.degreesToRadians(
      originalClipPath.angle,
    );
    const newCoords = fabric.util.rotatePoint(
      rotationPoint,
      centerPoint,
      angleRadians,
    );
    originalImage.set({
      left: newCoords.x,
      top: newCoords.y,
      angle: originalClipPath.angle,
    });
    originalImage.setCoords();
  }

})();