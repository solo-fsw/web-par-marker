//--------------------------------------------------------------------------------------------
//  Code for controlling the ParMarker device from inside a browser.
///
// Change log:
//   First version.                                                  - Elio Sjak-Shie, 2022.
//--------------------------------------------------------------------------------------------

//================================================================================================
function genWidget(parent) {
    // Creates the widget inside a parent. Meant for testing.
    //--------------------------------------------------------------------------------------------

    // Make container:
    let container = document.createElement("div");
    container.setAttribute('display', 'grid');
    container.setAttribute("style", `
        display: grid;
        height: 100%;
        width: 200px;
        border-style: solid;
        border-width: thin;
        `);
    parent.appendChild(container);

    // Style:
    let e_margin = 5;

    // Connect btn:
    let btn_connect = document.createElement("input");
    btn_connect.setAttribute("id", "btn_connect");
    btn_connect.setAttribute("type", "button");
    btn_connect.setAttribute("value", "Connect");
    btn_connect.setAttribute("style", `margin : ${e_margin}px`);
    btn_connect.onclick = onConnectClick;
    container.appendChild(btn_connect);

    // Status text:
    let status_text = document.createElement("p");
    status_text.setAttribute("id", "status_text");
    status_text.setAttribute("style", ` 
        margin : ${e_margin}px;
        height : 100px;
        text-align: center;
        `);
    status_text.innerHTML = 'Please click connect.';
    container.appendChild(status_text);

    // Marker input:
    let input_marker = document.createElement("input");
    input_marker.setAttribute("id", "marker_input");
    input_marker.setAttribute("type", "number");
    input_marker.setAttribute("value", "0");
    input_marker.setAttribute("style", `margin : ${e_margin}px`);
    container.appendChild(input_marker);

    // Marker send:
    let btn_send = document.createElement("input");
    btn_send.setAttribute("id", "btn_send");
    btn_send.setAttribute("type", "button");
    btn_send.setAttribute("value", "Send");
    btn_send.setAttribute("style", `margin : ${e_margin}px`);
    btn_send.disabled = true;
    btn_send.onclick = onSendClick;
    container.appendChild(btn_send);

    // callbacks:
    function onConnectClick() {
        connectToParMar().then(() => {
            btn_connect.setAttribute("value", "Disconnect");
            btn_connect.onclick = onDisconnectClick;
            btn_send.disabled = false;
            status_text.innerHTML = 'Connected to device:<br>';
            for (const [key, value] of Object.entries(gParMar.info)) {
                status_text.innerHTML += `${key}: ${value}<br>`;
              }
        }).catch((e) => {
            status_text.innerHTML = `Error connecting.\n${e}`;
        })
    };
    function onDisconnectClick() {
        gParMar.disconnect().then(() => {
            btn_connect.setAttribute("value", "Connect");
            btn_connect.onclick = onConnectClick;
            btn_send.disabled = true;
            status_text.innerHTML = `Disconnected. Please click connect.`;
        }).catch((e) => {
            status_text.innerHTML = `Error disconnecting.\n${e}`;
        })
    };
    function onSendClick() {
        try {
            gParMar.sendMarker(input_marker.value);
            status_text.innerHTML = `Marker (${input_marker.value}) sent.`;
        } catch (e) {
            status_text.innerHTML = `Error sending marker.\n${e}`;
        };
    };

};



//================================================================================================
async function connectToParMar(forcePermissionPrompt = false, autoConnectIndex = 0) {
    // Connects to the ParMarker. Note, this function returns a Promise.
    //--------------------------------------------------------------------------------------------

    if (!("serial" in navigator)){
        throw 'WebParMar (noSerial): Serial device not available in this browser.';
    }

    // Serial port object:
    let port;

    // Attempt to auto-connect:
    if (!forcePermissionPrompt) {
        const ports = await navigator.serial.getPorts();
        port = ports[autoConnectIndex];
    };

    // If force permission is true, or if auto-connect failed, request port access:
    if (forcePermissionPrompt || !port) {
        try {
            usbVendorId = 0x2341;  // the Arduino vendor ID is: 0x2341.
            port = await navigator.serial.requestPort({
                filters: [{
                    usbVendorId
                }]
            });
        } catch (e) {
            throw 'WebParMar (noCom): user did not select COM device.';
        }
    };

    // Serial params:
    const commandModeBaudRate = 4800;
    const dataModeBaudRate = 115200;

    // Connect to port in command mode:
    if (!port) {
        console.error('WebParMar: unknown error.');
        throw 'WebParMar (unknownError): unknown error.';
    };
    try {
        await port.open({
            baudRate: commandModeBaudRate
        });
    } catch (e) {
        throw 'WebParMar (comNoOpen): could not open COM port.';
    };

    // Request the info:
    let rawWriter = port.writable.getWriter();
    let infoRequestCode = new Uint8Array([86]); // 86 is 'V', the info request code.
    await rawWriter.write(infoRequestCode);
    rawWriter.releaseLock();
    rawWriter = null;

    // Make text stream reader and read response:
    let decoder = new TextDecoderStream();
    let inputDone = port.readable.pipeTo(decoder.writable);
    let inputStream = decoder.readable;
    let reader = inputStream.getReader();
    let responseString = '';
    let streamResponse;
    while (responseString.slice(-2) != '\r\n') {
        streamResponse = await reader.read();
        if (streamResponse.value) {
            responseString += streamResponse.value;
        }
    };
    let deviceInfo = JSON.parse(responseString);

    // Put in data mode:
    await reader.cancel();
    await inputDone.catch(() => {});
    reader = null;
    inputDone = null;
    await port.close();
    await port.open({
        baudRate: dataModeBaudRate
    });

    // Make helper functions:
    rawWriter = port.writable.getWriter();
    sendMarker = (intValue) => {
        if (!rawWriter) {
            throw 'WebParMar (notReady): port not ready.'
        }
        let markerInt = new Uint8Array([intValue]);
        rawWriter.write(markerInt);
    };
    disconnect = async () => {
        rawWriter.releaseLock();
        await port.close();
        rawWriter = null
    };

    // Clear marker:
    sendMarker(0);

    // Make global object:
    if (typeof gParMar !== 'undefined') {
        var gObjScript = document.createElement("script");
        document.head.appendChild(gObjScript);
        gObjScript.innerText = "var gParMar = {};";
    }
    gParMar = {
        'sendMarker': sendMarker,
        'info': deviceInfo,
        'disconnect': disconnect
    };

    // Also return it:
    return gParMar

};