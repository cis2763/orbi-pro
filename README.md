Orbi-Pro
========
Last updated 12/29/2018.

Orbi-Pro is a library that provides a programmatic interface to the web 
API of the Orbi Pro. It is implemented via screen scraping.

Tutorial
--------
To create a client:

    const orbiPro = require("orbi-pro");
    
    const client = new orbiPro.Client({
        baseUrl: "https://10.0.0.1", // defaults to routerlogin.net
        password: "insertYourPasswordHere"
    });

To fetch information about network:

    client.refresh().then(() => {
        // logs internet status
        console.log(client.status);
        for(const device of client.devices) {
            console.log(device.ip); // ip address
            console.log(device.mac); // mac address
            // ... and much much more!
        }
    });