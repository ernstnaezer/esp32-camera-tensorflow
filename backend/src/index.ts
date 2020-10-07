// ESP32 Camera Object Detection
// MIT License

import * as WebSocket from 'ws';

import * as tf from '@tensorflow/tfjs-node'
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Tensor3D } from '@tensorflow/tfjs-node';

import { createCanvas, loadImage } from 'canvas';

import { startStreamServer } from './stream-server';

const drawPredictions = async (imageData:Uint8Array, predictions:cocoSsd.DetectedObject[]) => {

    const image = await loadImage(imageData as Buffer)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0)
    ctx.font = '10px Arial'

    predictions.forEach(prediction => {

        ctx.beginPath()
        ctx.rect(...prediction.bbox)
        ctx.lineWidth = 2
        ctx.strokeStyle = 'white'
        ctx.fillStyle = 'white'
        ctx.stroke()
        ctx.fillText(
            `${prediction.score.toFixed(3)} ${prediction.class}`,
            prediction.bbox[0],
            prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10)

    })

    return canvas.toBuffer('image/jpeg')
}

// -------------------------------
// main
// -------------------------------

(async () => {

    const emitter = startStreamServer()

    console.log('Loading detection model');

    const model = await cocoSsd.load();
    const client = new WebSocket('ws://espcam.local')

    client.on('open', () => {
        console.log('Connected to ESP, here we go');
    });

    client.on('message', async (imageData:Uint8Array) => {

        tf.engine().startScope()
        const imgTensor = tf.node.decodeImage(imageData, 3) as Tensor3D
        const predictions = await model.detect(imgTensor)
        tf.engine().endScope()

        const image = await drawPredictions(imageData, predictions)
        emitter.emit('frame', image);
    });

})();
