import * as express from 'express'
import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

export interface Events {
    frame: (data:Uint8Array) => void;
}
  
export const startStreamServer = () : StrictEventEmitter<EventEmitter, Events> => {

    const emitter: StrictEventEmitter<EventEmitter, Events> = new EventEmitter;
    const app = express()
    const port = 3000

    app.use(express.static('static'))

    app.get('/stream', (req:express.Request, res: express.Response) => {
        const boundary = '1a8210dd-eab8-4c1c-9a6c-15daedeb3e5c'

        res.writeHead(200, {
            'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
            Pragma: 'no-cache',
            Connection: 'close',
            'Content-Type': 'multipart/x-mixed-replace; boundary=--' + boundary
        });

        emitter.addListener('frame', (image: Uint8Array) => {
            res.write(`--${boundary}\nContent-Type: image/jpg\nContent-length: ${image.length}\n\n`);
            res.write(image);
        });

        res.addListener('close', () => emitter.removeAllListeners());

    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    })

    return emitter

}