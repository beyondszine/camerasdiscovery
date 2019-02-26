var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');


const onvifFunctions = require('../controllers/onvifFunctions');
const upnpFunctions = require('../controllers/upnpFunctions');
const rtspFunctions = require('../controllers/rtspFunctions');

var jsonParser = bodyParser.json();


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

router.route('/probestream')
  .post(jsonParser,function(req,res){
    console.log("Probe stream called!");
    console.log("Requested URL to probe:",req.body.url);
    rtspFunctions.probeStream(req.body.url)
    .then(function(probedata){
      return res.send(probedata);
    })
    .catch(function(err){
      return res.send({"_status":"ERR","_message":err._message});
    });
  });

router.route('/streamops')
  .post(jsonParser,function(req,res){    
    console.log("stream-ops called!");
    var inputStreamOpsbody=req.body;
    console.log("Requested stream URL for operations :",inputStreamOpsbody.url);
    console.log("Requested stream URL Video operations :",inputStreamOpsbody.videostreamOptions);
    console.log("Requested stream URL Audio operations :",inputStreamOpsbody.audiostreamOptions);

    var genResponse = new Promise(function(resolve,reject){
      var responsebody={
        "url" : inputStreamOpsbody.url,
        "requestID" : function(){
          return uuidv4();
        }(),
        "saveOptions" : {
          "savelocation" : function(inputStreamOpsbody){
            if (inputStreamOpsbody.saveOptions.savelocation=="public"){
              return "publicFileURL";
            }
            else if(inputStreamOpsbody.saveOptions.savelocation=="local"){
              return "localfilepath";
            }
            else{
              return "ERR";
            }
          }(inputStreamOpsbody),
          "maxfilesize" : inputStreamOpsbody.saveOptions.maxfilesize
        },
        "videostreamOptions" :{
          "enabled" : inputStreamOpsbody.videostreamOptions.enabled,
          "restream" : function(inputStreamOpsbody){
            if (inputStreamOpsbody.videostreamOptions.restream){
              return "public stream URL";
            }
            else{
              return "NA";
            }
          }(inputStreamOpsbody),
          "fps" : inputStreamOpsbody.videostreamOptions.fps,
          "videosize" : inputStreamOpsbody.videostreamOptions.videosize,
          "codec" : inputStreamOpsbody.videostreamOptions.codec,
          "transport":inputStreamOpsbody.videostreamOptions.transport,
          "format" : inputStreamOpsbody.videostreamOptions.format
        },
        "audiostreamOptions" :{
          "enabled" : inputStreamOpsbody.audiostreamOptions.enabled
        }
      };
      resolve(responsebody);
    });

    genResponse
    .then(function(respbody){
      return res.send(respbody);
    })
    .catch(function(err){
      return res.send({"_status":"ERR","_message":err.message});
    });
  //   rtspFunctions.streamOps(inputStreamOpsbody)
  //   .then(function(response){
  //     return res.send(response);
  //   })
  //   .catch(function(err){
  //     return res.send({"_status":"ERR","_message":err._message});
  //   });
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
