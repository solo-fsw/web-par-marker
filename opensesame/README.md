# WebSerial ParMarker OpenSesame OSWeb Demo
## Intro
This demo shows how to use a slightly modified version of the web-par-marker library in OpenSesame/OSWeb.

Run this demo in JATOS [here](https://jatos.services.universiteitleiden.nl/publix/UhuDTC6L5vr). You will need a UsbParMarker device for it to work.

This demo was developed in OpenSesame 3.3.14 with OSWeb 1.4.13.1. If the osexp file is opened in an older version of OSWeb, it will probably look different and may not work at all.

## Notes
 - This experiment is a quick and simple demo on how to implement the web-par-marker library in OSWeb.
 - This experiment includes its own modified copy of the web-par-marker library code, saved inside an inline_javascript object. OSWeb's inline_javascript closed-scope issue is bypassed by using DOM-manipulation to dynamically inject the function-code directly into the document head.
 - If an OSWeb experiment does not work in Edge, try enabling hardware acceleration. The concerning setting can be found here: `edge://settings/system`.
 - The experiment most likely will not work in full-screen mode.