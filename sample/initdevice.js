(function(){
    'use strict;'
    const path = require('path');
    console.log(__dirname);
  
    const onvif=require( path.resolve(__dirname,'../lib/node-onvif.js') );
    // Create an OnvifDevice object
    let device = new onvif.OnvifDevice({
        xaddr: 'http://192.168.1.107:36000/onvif/device_service',
        user : 'beyond',
        pass : 'abcd1234'
    });

    // Initialize the OnvifDevice object
    device.init().then((info) => {
        // let url = device.getUdpStreamUrl();
        console.log(info);
    })
    .catch((error) => {
        console.error(error);
    });
})();