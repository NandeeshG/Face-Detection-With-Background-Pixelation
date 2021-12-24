import * as C from "/constants.js";
import * as H from "/helper.js";

//Flow ->
// 1. Make videoElem and canvasElem
// 2. Get webcam video stream
// 3. Detect face and get facebox at regular intervals
// 4. Pass to pixelAveraging and get pixelated image
// 5. Print it on the canvas

//Make video elem and append to body
const videoElem = H.appendToBody(H.makeVideoElement());
const context = H.appendToBody(H.makeCanvasElement()).getContext("2d");

//const videoElem = document.getElementById("video-elem");
//const canvasElem = document.getElementById("canvas-elem");
//let stream, context;
//
//async function init(constraints) {
//  try {
//    //init webcam and videoElem
//    stream = await navigator.mediaDevices.getUserMedia(constraints);
//    videoElem.srcObject = stream;
//    videoElem.addEventListener("loadedmetadata", () => {
//      videoElem.play();
//    });
//    videoElem.width = VID_W;
//    videoElem.height = VID_H;
//
//    //init canvas
//    context = canvasElem.getContext("2d");
//    canvasElem.width = VID_W;
//    canvasElem.height = VID_H;
//
//    videoElem.addEventListener("play", () => {
//      faceDetect();
//    });
//  } catch (err) {
//    console.log(err);
//  }
//}

//Load face-api models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo(videoElem));

//Start video streaming on videoElem
async function startVideo(videoElem) {
  let stream = null;

  /*
    Another non-number constraint is the deviceId constraint.
    If you have a deviceId from mediaDevices.enumerateDevices(), you can use it to request a specific device:
    { video: { deviceId: myPreferredCameraDeviceId } }
  */

  const options = {
    audio: C.AUDIO_NEEDED,
    video: {
      width: C.VID_W,
      height: C.VID_H,
    },
  };

  try {
    //get webcam stream
    stream = await navigator.mediaDevices.getUserMedia(options);
    //let videoElem show that to us
    videoElem.srcObject = stream;
  } catch (err) {
    console.log(err);
  }
}

//Start facedetection
videoElem.addEventListener("playing", () => {
  const displaySize = { width: C.VID_W, height: C.VID_H };

  ////create canvas and append to body
  //const canvas = faceapi.createCanvasFromMedia(videoElem);
  //document.body.append(canvas);
  //faceapi.matchDimensions(canvas, displaySize);

  //detect face at regular intervals
  setInterval(async () => {
    //with Landmarks and Faceexpressions?
    const detections = await faceapi.detectAllFaces(
      videoElem,
      new faceapi.TinyFaceDetectorOptions()
    );
    //  .withFaceLandmarks()
    //  .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //console.log(resizedDetections);

    for (let i = 0; i < resizedDetections.length; ++i) {
      const x = resizedDetections[i]._box._x;
      const y = resizedDetections[i]._box._y;
      const w = resizedDetections[i]._box._width;
      const h = resizedDetections[i]._box._height;
      pixelAveraging(x, y, w, h);
    }

    //drawFaceBox(canvas, resizedDetections);
  }, C.TIMER_MILLISECONDS);
});

//faceAPI facebox
function drawFaceBox(canvas, resizedDetections) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resizedDetections);
  //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  //faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
}

////--------------------------

//
//function faceDetect() {
//  let fx = Math.floor(0.3 * VID_W),
//    fy = Math.floor(0.2 * VID_H),
//    fw = VID_W - 2 * fx,
//    fh = VID_H - 2 * fy;
//  timer(fx, fy, fw, fh);
//}
//

function pixelAveraging(fx, fy, fw, fh) {
  context.drawImage(videoElem, 0, 0, C.VID_W, C.VID_H);

  ////face box
  //context.strokeStyle = "green";
  //context.strokeRect(fx, fy, fw, fh);

  let frame = context.getImageData(0, 0, C.VID_W, C.VID_H);

  for (let i = 0; i < C.VID_W; i += C.SQUARE_SIDE) {
    for (let j = 0; j < C.VID_H; j += C.SQUARE_SIDE) {
      if (
        H.withinBox(i, j, fx, fy, fw, fh) ||
        H.withinBox(i + C.SQUARE_SIDE, j + C.SQUARE_SIDE, fx, fy, fw, fh) ||
        H.withinBox(i, j + C.SQUARE_SIDE, fx, fy, fw, fh) ||
        H.withinBox(i + C.SQUARE_SIDE, j, fx, fy, fw, fh)
      ) {
        continue;
      }

      let ids = [];
      for (let ii = 0; ii < C.SQUARE_SIDE; ++ii) {
        for (let jj = 0; jj < C.SQUARE_SIDE; ++jj) {
          ids.push(H.getId(i + ii, j + jj, C.VID_W, C.VID_H));
        }
      }

      let avgs = [0, 0, 0, 0]; //rgba
      for (let k = 0; k < 4; k++) {
        avgs[k] = H.colorAverage(k, ids, frame.data);
      }

      for (let k = 0; k < 4; k++) {
        H.setColor(k, avgs[k], ids, frame.data);
      }
    }
  }
  context.putImageData(frame, 0, 0);

  //setTimeout(faceDetect, TIMER_MILLISECONDS);
}

//
//init({
//  video: {
//    width: { ideal: VID_W },
//    height: { ideal: VID_H },
//    facingMode: "user",
//  },
//});
