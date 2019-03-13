var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const fs = require('fs');


const onvifFunctions = require('../controllers/onvifFunctions');
const upnpFunctions = require('../controllers/upnpFunctions');
const rtspFunctions = require('../controllers/rtspFunctions');
const jobManager = require('../controllers/jobManager');

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
    var customJob=null;
    // check for all NEEDED fields
    var inputDataValidation = new Promise(function(resolve,reject){
      if(!inputStreamOpsbody.url || !inputStreamOpsbody.type){
        var err_msg="one or more Needed fileds missing";
        console.log(err_msg);
        reject(err_msg);
      }
      else if(inputStreamOpsbody.videostreamOptions.enabled==false && inputStreamOpsbody.audiostreamOptions.enabled==false){
        var err_msg="No real job given. Kindly refer to API to give either Audio or Video streaming job!";
        console.log(err_msg);
        reject(err_msg);
      }
      else{
        resolve();
      }
    });

    var addStreamOpsJob = new Promise(function(resolve,reject){
      if(inputStreamOpsbody.type=="local" && inputStreamOpsbody.videostreamOptions.restream==false){
        if(inputStreamOpsbody.saveOptions.maxfilesize || inputStreamOpsbody.saveOptions.duration)
        console.log("Running local job for Saving video locally with max file size: "+inputStreamOpsbody.saveOptions.maxfilesize);
        console.log("Running local job for Saving video locally for time duration: "+inputStreamOpsbody.saveOptions.duration);
        //rtspFunctions.streamOpsSave(respbody);
        jobManager.addVideoSaveJob(inputStreamOpsbody)
        .then(mjob => {
          console.log("obtained mjob is",JSON.stringify(mjob));
          // do any operation if needed on job's object!
          customJob=mjob;
          resolve();
        })
      }
      //Case II
      else if(inputStreamOpsbody.type=="local" && inputStreamOpsbody.videostreamOptions.restream==true){
        console.log("Running local job for Streaming video locally");
        //rtspFunctions.streamOpsStream(respbody);
      }
      //Case III
      else if(inputStreamOpsbody.type=="cloud" && inputStreamOpsbody.videostreamOptions.restream==false){
        console.log("Running job for Saving video on cloud with max file size:",inputStreamOpsbody.saveOptions.maxfilesize);
      }
  
      //Case IV
      else if(inputStreamOpsbody.type=="cloud" && inputStreamOpsbody.videostreamOptions.restream==true){
        console.log("Running local job for Streaming video on cloud");
      }
      else{
        reject("unknown category!!");
      }
    });

    Promise.all([inputDataValidation,addStreamOpsJob])
    .then(() => {
      console.log("returning to user jobid",customJob.id);
      return res.send({"_status":"SUCCESS","jobID":customJob.id,"_message":"all promises rresolved! some final object with jobid"});
    })
    .catch(function(err_msg){
      return res.send({"_status":"ERR","_message":err_msg});
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
