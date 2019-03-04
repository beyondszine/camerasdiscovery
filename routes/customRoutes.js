var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const fs = require('fs');


const onvifFunctions = require('../controllers/onvifFunctions');
const upnpFunctions = require('../controllers/upnpFunctions');
const rtspFunctions = require('../controllers/rtspFunctions');

var jsonParser = bodyParser.json();


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.route('/discovercameras')
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
    console.log("streamops route called!");
    var inputStreamOpsbody=req.body;
    function genResponse(inputStreamOpsbody){
      return new Promise(function(resolve,reject){
        var responsebody={
          "url" : inputStreamOpsbody.url,
          "requestID" : function(){
            return uuidv4();
          }(),
          "type" : function(inputStreamOpsbody){
            if (inputStreamOpsbody.type=="public"){
              return "publicFileURL";
            }
            else if(inputStreamOpsbody.type=="local"){
              return "localfilepath";
            }
            else{
              return "ERR";
            }
          }(inputStreamOpsbody),
          "saveOptions" : {
            "filename" : inputStreamOpsbody.saveOptions.filename,
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
    }

    // check for all NEEDED fields
    if(!inputStreamOpsbody.url || !inputStreamOpsbody.type){
      var err_msg="one or more Needed fileds missing";
      console.log(err_msg);
      return res.status(400).send({"_status":"ERR","_message":err_msg});
    }

    if(inputStreamOpsbody.videostreamOptions.enabled==false && inputStreamOpsbody.audiostreamOptions.enabled==false){
      var err_msg="No real job given. Kindly refer to API to give either Audio or Video streaming job!";
      console.log(err_msg);
      return res.status(400).send({"_status":"ERR","_message":err_msg});
    }

    genResponse(inputStreamOpsbody)
    .then(function(respbody){
      //Case I
      if(inputStreamOpsbody.type=="local" && inputStreamOpsbody.videostreamOptions.restream==false){
        if(inputStreamOpsbody.saveOptions.maxfilesize || inputStreamOpsbody.saveOptions.duration)
        console.log("Running local job for Saving video locally with max file size: "+inputStreamOpsbody.saveOptions.maxfilesize);
        console.log("Running local job for Saving video locally for time duration: "+inputStreamOpsbody.saveOptions.duration);
        rtspFunctions.streamOpsSave(respbody);
      }
      //Case II
      if(inputStreamOpsbody.type=="local" && inputStreamOpsbody.videostreamOptions.restream==true){
        console.log("Running local job for Streaming video locally");
        rtspFunctions.streamOpsStream(respbody);
      }
      //Case III
      if(inputStreamOpsbody.type=="cloud" && inputStreamOpsbody.videostreamOptions.restream==false){
        console.log("Running job for Saving video on cloud with max file size:",inputStreamOpsbody.saveOptions.maxfilesize);
      }

      //Case IV
      if(inputStreamOpsbody.type=="cloud" && inputStreamOpsbody.videostreamOptions.restream==true){
        console.log("Running local job for Streaming video on cloud");
      }
      return res.send(respbody);
    })
    .catch(function(err){
      return res.send({"_status":"ERR","_message":err.message});
    });
  });

router.route('/sampleurls')
  .get(function(req,res){
    console.log("All sample URLS",__dirname);
    var samplefilename=__dirname+'/sampleurls.json';
    fs.createReadStream(samplefilename)
    .pipe(res);
  });

router.route('/getimage')
  .post(jsonParser,function(req,res){
    console.log("Get Image called!");
    console.log("Requested URL to get image from:",req.body.url);
    // TODO: Figure out type of URL first. ex- file, url etc
    rtspFunctions.getimage(req.body.url)
    .then(function(savedfilename){
      return res.sendFile(savedfilename);
    })
    .catch(function(ffmpeg_err){
      console.error("Error happened in getimage promise",ffmpeg_err);
      return res.send({"_status":"ERR","_message":ffmpeg_err._message});
    });
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
