(function(){
    'use strict;'
    const path = require('path');
    console.log(__dirname);
  
    const onvif=require( path.resolve(__dirname,'../lib/node-onvif.js') );
    // Create an OnvifDevice object
    let device = new onvif.OnvifDevice({
        xaddr: 'http://192.168.1.107:36000/onvif/device_service',
        user : 'admin',
        pass : 'VedaLabs@pirate'
    });

    // Initialize the OnvifDevice object
    device.init().then(() => {
        let url = device.getUdpStreamUrl();
        console.log(url);
    })
    .catch((error) => {
        console.error(error);
    });
})();