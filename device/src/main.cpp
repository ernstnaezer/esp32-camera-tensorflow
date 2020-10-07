// ESP32 Camera Object Detection
// MIT License

#include "esp_wifi.h"
#include <Arduino.h>
#include <ESPmDNS.h>
#include <WebServer.h>
#include <WiFi.h>

#include <WebSocketsServer.h>
#include <esp32cam.h>

#define STR_(X) #X
#define STR(X) STR_(X)

/** Pin definition for TTGO ESP32-CAM.
 */
constexpr esp32cam::Pins TTGO{
  D0 : 5,
  D1 : 14,
  D2 : 4,
  D3 : 15,
  D4 : 37,
  D5 : 38,
  D6 : 36,
  D7 : 39,
  XCLK : 32,
  PCLK : 19,
  VSYNC : 27,
  HREF : 25,
  SDA : 13,
  SCL : 12,
  RESET : -1,
  PWDN : -1,
};

static auto hiRes = esp32cam::Resolution::find(1024, 768);

WebSocketsServer server = WebSocketsServer(80);

void setup() {
  Serial.begin(115200);

  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(TTGO);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(1);
    cfg.setJpeg(90);

    bool ok = Camera.begin(cfg);
    Serial.println(ok ? "Camera Ok" : "Camera Fail");
  }

  Serial.printf("Connecting to wifi: %s\n", STR(WIFI_SSID));

  WiFi.persistent(false);
  WiFi.setSleep(false);
  WiFi.disconnect(true);
  WiFi.begin(STR(WIFI_SSID), STR(WIFI_PASSWORD));

  int i = 0;
  while (WiFi.status() != WL_CONNECTED) { // Wait for the Wi-Fi to connect
    delay(1000);
    ++i;
    Serial.print('.');
    if (i == 10) {
      Serial.println("Giving up connecting to the wifi, going for a reboot");
      ESP.restart();
    }
  }
  Serial.println('.');
  Serial.printf("Device ip: %s\n", WiFi.localIP().toString().c_str());

  Serial.println("Starting MDNS server (espcam.local)");
  MDNS.begin("espcam");

  Serial.println("Starting websocket server");
  server.begin();

  Serial.println("Entering capture loop");
}

void loop() {

  auto frame = esp32cam::capture();

  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    return;
  }

  server.broadcastBIN(frame->data(), frame->size());

  server.loop();

  return;
}
