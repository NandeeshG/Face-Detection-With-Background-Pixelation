import * as C from "/constants.js";

function makeVideoElement() {
  const videoElem = document.createElement("video");
  videoElem.muted = !C.AUDIO_NEEDED;
  //videoElem.height = C.VID_H;
  //videoElem.width = C.VID_W;
  videoElem.autoplay = true;
  videoElem.height = 0;
  videoElem.width = 0;
  return videoElem;
}

function makeCanvasElement() {
  const canvasElem = document.createElement("canvas");
  canvasElem.height = C.VID_H;
  canvasElem.width = C.VID_W;
  return canvasElem;
}

function appendToBody(elem) {
  document.body.append(elem);
  return elem;
}

function loadFaceApiModels(callback) {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]).then(callback);
}

function setColor(k, col, ids, data) {
  if (ids.length == 0) return 0;
  for (let i = 0; i < ids.length; ++i) {
    data[ids[i] + k] = col;
  }
}

function colorAverage(k, ids, data) {
  if (ids.length == 0) return 0;
  let sum = 0;
  for (let i = 0; i < ids.length; ++i) {
    sum += data[ids[i] + k];
  }
  return sum / ids.length;
}

//get array index from x,y,w,h
function getId(
  x /*0 based col num*/,
  y /*0 based row num*/,
  w /*number of pixels on width*/,
  h /*no. of pixels of height*/
) {
  let rowBeg = 4 * w * y;
  let id = rowBeg + 4 * x;
  return id;
}

function withinBox(x, y, fx, fy, fw, fh) {
  return x >= fx && x <= fx + fw && y >= fy && y <= fy + fh;
}

export {
  makeVideoElement,
  appendToBody,
  loadFaceApiModels,
  makeCanvasElement,
  setColor,
  colorAverage,
  getId,
  withinBox,
};
