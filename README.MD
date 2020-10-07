# ESP32 Cam with Nodejs Tensorflow Object Detection and MJPEG proxy stream

Connect an ESP32 Camera to the coco-ssd Object detection model and feed the result thought an MPJEG steam to a browser.

The setup is as follows;

```
+---------------+    ws    +---------------------+   http   +--------------------+
|   ESP32 cam   | -------> |   nodejs/coco-ssd   | -------> |   browser <img/>   |
+---------------+          +---------------------+          +--------------------+
```

## Installing

### WiFi credentials

For your ESP32 to connect to your network, create the file `wifi_secrets.txt` containing your wifi credentials. It should look like this and gets picked up by the buildsystem to include these into you firmware:

```
# use this file to define your Wifi secrets

WIFI_SSID=...
WIFI_PASSWORD=...
```

note: the backend looks for a network device named `espcam.local` using Multicast DNS. If this doesn't work on your setup, plug in the ESP32's IP address in the `index.ts` file. You'll find this address in the serial output of the ESP32 during startup.

### Build and upload

The device code is writting in Arduino using platform.io. Make this you have this installed on you machine.
Once you open the platform.io CLI, in the `device` folder you can type:

`pio run -t upload; pio device monitor`

This will build the device firmware, upload it to you ESP32 and start a device monitor over serial.

### nodejs backend

Once the ESP32 device is flashed, you can start the nodejs backend containing the Tensflow model. On the command line, in the `backend` folder type

`yarn`

This will install all needed dependencies and compile the tensorflow bindings for your machine. You might need to install additional dependencies based on your machine.

Once everything is setup, type;

`yarn run dev`

You can now open a browser and visit `http://localhost:3000`

## Sample output

The device is by default configured with the camera pin-out for an LilyGo TTGO micro. You can configure this for other models as well. If everything works as it should, you'll see predictions drawn like this.

![ttgo camera](https://raw.githubusercontent.com/ernstnaezer/esp32-camera-tensorflow/main/assets/browser-capture.jpg)

![ttgo camera](https://github.com/ernstnaezer/esp32-camera-tensorflow/blob/main/assets/ttgo-camera.jpg?raw=true)

## Building using

The backend runs on nodejs, and is build using TypeScript

- https://github.com/tensorflow/tfjs-models
- https://github.com/websockets/ws
- https://expressjs.com

The devices code runs on an ESP32, and is build using Arduino

- https://platformio.org
- https://github.com/yoursunny/esp32cam
- https://github.com/Links2004/arduinoWebSockets
