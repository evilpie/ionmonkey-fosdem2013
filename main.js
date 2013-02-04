var width = 320, height = 240;
var squidImageData = new Array(width * height * 4);
var sigma = 1; // radius
var kernelSize = 1;
var kernel, kernelSum;

function buildKernel() {
   var ss = sigma * sigma;
   var factor = 2 * Math.PI * ss;
   kernel = [];
   kernel.push([]);
   var i = 0, j;

   do {
       var g = Math.exp(-(i * i) / (2 * ss)) / factor;
       if (g < 1e-3) break;
       kernel[0].push(g);
       ++i;
   } while (i < kernelSize);

   for (j = 1; j < kernelSize; ++j) {
       kernel.push([]);
       for (i = 0; i < kernelSize; ++i) {
           var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
           kernel[j].push(g);
       }
   }
   kernelSum = 0;
   for (j = 1 - kernelSize; j < kernelSize; ++j) {
       for (i = 1 - kernelSize; i < kernelSize; ++i) {
           kernelSum += kernel[Math.abs(j)][Math.abs(i)];
       }
   }
}

buildKernel();

let Demo = {
  shouldStop: false,
  isStarted: false,
  start: function () {
    this.video = document.getElementById("v");
    this.width = this.video.width;
    this.height = this.video.height;

    let canvas = document.getElementById("c");
    let output = document.getElementById("d");
    this.context = canvas.getContext("2d");
    this.outputctx = canvas.getContext("2d");

    // Get the video stream.
    navigator.mozGetUserMedia({video: true}, function (stream) {
      this.video.mozSrcObject = stream;
      this.video.play();
    }.bind(this), function err() {});
      setTimeout(
      function () { Demo.requestAnimationFrame() }, 2000);
  },

  requestAnimationFrame: function () {
    mozRequestAnimationFrame(this.draw.bind(this));
  },

  blur: function () { },

  blurOrig: function () {
      gaussianBlurOrig();
  },

  blurNew: function () {
      gaussianBlur();
  },

  draw: function () {
    this.context.drawImage(this.video, 0, 0, this.width, this.height);
    let frame = this.context.getImageData(0, 0, this.width, this.height);
    let len = frame.data.length / 4;

    // Copy and eagerly convert to double to make it more efficient for
    // blurring.
    for (var i = 0; i < frame.data.length; i++)
        squidImageData[i] = frame.data[i]  + 0.00390625;

    this.blur();

    // Fill the buffer back.
    for (var i = 0; i < frame.data.length; i++)
        frame.data[i] = squidImageData[i] & 0xFF;

    this.context.putImageData(frame, 0, 0);
    this.requestAnimationFrame();
  }
};
