(function(){
  'use strict;'
  const path = require('path');
  const onvif=require( path.resolve(__dirname,'../lib/node-onvif.js') );


  function discoverCameras(){
    console.log('Starting the discovery process.');
    return onvif.startProbe()
  }

  function getStream(deviceObject){
    let device = new onvif.OnvifDevice(deviceObject);
      device.init().then(() => {
        let url = device.getUdpStreamUrl();
        console.log(url);
    })
    .catch((error) => {
        console.error(error);
    });
  }

  module.exports = {
    discoverCameras : discoverCameras
  };

})();