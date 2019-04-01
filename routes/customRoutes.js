var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const fetch = require('node-fetch');
const rDebug = require('debug')('routes');
const onvifFunctions = require('../controllers/onvifFunctions');
const upnpFunctions = require('../controllers/upnpFunctions');
const rtspFunctions = require('../controllers/rtspFunctions');
var jsonParser = bodyParser.json();

router.use(function(req,res,next){
  rDebug(`${req.method}    ${req.url}`);
  next();
});


router.get('/', function(req, res, next) {
  // rDebug(`${req.method}    ${req.url}    MSG: Test index route!`);
  return res.send('');
});

router.route('/discovercameras')
  .get(function(req,res){
    onvifFunctions.discoverCameras()
    .then(devices_list => {
      rDebug("obtained devices list: ",devices_list);
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
        console.log("probing finished!");
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
    // check for all NEEDED fields
    var dataPresenceValidation = new Promise(function(resolve,reject){
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

    // check for all stream specific operations validity like local or cloud
    var OpsTypeValidation =  new Promise(function(resolve,reject){
      // local validation
      if(inputStreamOpsbody.type=="local"){
        console.log("Running validations for type: local");
        if(inputStreamOpsbody.saveOptions.maxfilesize || inputStreamOpsbody.saveOptions.duration){
          // some other validations, if needed to be done.  For ex:
          if(inputStreamOpsbody.saveOptions.maxfilesize > 100){
            reject("Max file size reached!  Input less than 100M"); 
          }
          // if everything is alright
          else{
            resolve();
          }
        }
        else{
          reject("Invalid Options for type local! Enter either max. file size or duration for saving."); 
        }
      } // cloud validation
      else if(inputStreamOpsbody.type=="cloud"){
        console.log("Running validations for type: Cloud");
        console.log("rejecting this as going to implement afterwards");
        reject("Not yet implemented!");
      }
      else{
        console.log("Invalid ops type!");
        reject("invalid ops type!");
      }
    });
    
    // add a stream job
    var addStreamOpsJob = new Promise(function(resolve){
      console.log("seding a job add request to ",req.headers.host);
      fetch('http://localhost:8000/v1/jobmanager/Jobs',{
        method:'POST',
        body:JSON.stringify(inputStreamOpsbody),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(resp => {
        return resp.json();
      })
      .then(resp => {
        console.log("obtained mjob is",JSON.stringify(resp));
        // do any operation if needed on job's object!
        resolve(resp._data);
      })
      .catch(err => {
        throw new Error(err);
      });
    });

    Promise.all([dataPresenceValidation,OpsTypeValidation])
    .then(() => {
      console.log("Now adding job for given stream Operation");
      return addStreamOpsJob;
    })
    .then((customJob) => {
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
