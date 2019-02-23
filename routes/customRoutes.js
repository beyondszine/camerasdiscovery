var express = require('express');
var router = express.Router();
const onvifFunctions = require('../controllers/onvifFunctions');
const upnpFunctions = require('../controllers/upnp');


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.route('/discoverCameras')
  .get(function(req,res){
    onvifFunctions.discoverCameras()
    .then(devices_list => {
      console.log("obtained devices list: ",devices_list);
      return res.send({"status":"success","data":devices_list});
    })
    .catch((error) => {
      console.error(error);
      return res.send(error);
    });
  });

router.route('/getStream')
  .get(function(req,res){
   let deviceObject={
      xaddr: "http://192.168.1.122:8899/onvif/device_service",
      user : 'admin',
      pass : 'VedaLabs@pirate'
  }
  });

router.route('/upnp')
  .get(function(req,res){
    upnpFunctions.getUpnpMappings()
    .then(upnpresults =>{
      console.log("got upnpresults",upnpresults)
      return res.send(upnpresults);
    })
  });

module.exports = router;
