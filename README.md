# WebSerial ParMarker
## Intro
This library allows control of the ParMarker device from inside a browser using the WebSerial API. This allows users to send markers from online experiments, such as Qualtrics, OSWeb, jsPsych, etc.

See the demo [here](https://solo-fsw.github.io/web-par-marker/demo.html) and the repo [here](https://github.com/solo-fsw/web-par-marker).

## Usage

First, add the js file to your project. You can also load it straight from GitHub using using the code below. However, that is not currently advisable as this library is still under development.
```
<script src="https://solo-fsw.github.io/web-par-marker/webParMar.js"></script>
```

Inside your website, use the `connectToParMar()` function to connect to the serial device. This function returns a Promise, which on fulfillment returns an object with data regarding the device, and the `sendMarker(markerValue)` and `disconnect()`. The latter returns a Promise. For ease of usage, `connectToParMar` also saves this variable as a global variable named `gParMar`.

Connect to ParMar (you can either capture the argument passed to the resolve function, or just use `gParMar`, the global variable automatically created by `connectToParMar()`):
```
connectToParMar().then(() => {
    // Handle successful connection here.
}).catch((e) => {
    // Handle connection error here.
})
```

Send marker using `gParMar`. A value of 255 is sent here:
```
try {
    gParMar.sendMarker(255);
    // Handle successful marker sending here.
} catch (e) {
    // Handle marker error here.
};
```


Disconnect using `gParMar`:
```
gParMar.disconnect().then(() => {
    // Handle successful disconnection here.
}).catch((e) => {
    // Handle disconnection error here.
})
```

## OpenSesame
See the [opensesame](https://github.com/solo-fsw/web-par-marker/opensesame) folder for an OpenSesame demo implementation.

## Notes
 - This library is still under development.
 - Check your browser and environment for compatibility with WebSerial. Additionally, certain security provisions may need to be navigated before a website can connect to a serial device (e.g. some browsers do not allow connection to a serial device by unsecure websites).
 - Make sure connectToParMar has finished before attempting to send a marker. This can e.g. be done using async/await, or checking that gParMar exists and the info field is not null.
 - The first time that users connect to the serial device, a popup is shown allowing them to give the website access to the device. Once access is granted, subsequent visits to the website can auto-connect to the device if it is connected to the PC.
 - Browsers generally do not allow code to connect to serial hardware outside of a user-gesture triggered callback. As such, the user must perform an action (e.g. click a button) before hardware can be connected to.
 - In most browsers, you can click the icon directly to the left of the URL in the navigation bar to view or disable the enabled serial devices.
 - A serial device can only handle a single connection at a time. As such, if one tab is connected to a device, another tab will not be able to connect to it.

