const videoElem = document.getElementById("videoElement");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo(videoElem));

async function startVideo(videoElem) {
  let stream = null;

  /*
    Another non-number constraint is the deviceId constraint.
    If you have a deviceId from mediaDevices.enumerateDevices(), you can use it to request a specific device:
    { video: { deviceId: myPreferredCameraDeviceId } }
  */

  let options = {
    audio: false,
    video: {
      width: 720,
      height: 560,
    },
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(options);
    videoElem.srcObject = stream;
  } catch (err) {
    console.log(err);
  }
}

videoElem.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(videoElem);
  document.body.append(canvas);
  const displaySize = { width: videoElem.width, height: videoElem.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(videoElem, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    //console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    console.log(resizedDetections);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 250);
});
