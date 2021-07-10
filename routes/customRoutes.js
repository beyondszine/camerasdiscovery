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
const isPortReachable = require('is-port-reachable');


router.use(function(req, res, next) {
    rDebug(`${req.method}    ${req.url}`);
    next();
});


router.get('/', function(req, res, next) {
    // rDebug(`${req.method}    ${req.url}    MSG: Test index route!`);
    return res.send('');
});

router.route('/discovercameras')
    .get(function(req, res) {
        onvifFunctions.discoverCameras()
            .then(devices_list => {
                rDebug("obtained devices list: ", devices_list);
                return res.send({ "status": "success", "data": devices_list });
            })
            .catch((error) => {
                console.error(error);
                return res.send(error);
            });
    });

router.route('/getstreams')
    .post(jsonParser, function(req, res) {
        var mresp = [];
        var parray = [];

        var getStreamPromise = function(obj) {
            return new Promise(function(resolve, reject) {
                onvifFunctions.getStream(obj)
                    .then((rtspurl) => {
                        //mods to object recieved.
                        return Object.assign(obj, { "url": rtspurl });
                    })
                    .then((toadd) => {
                        // console.log("adding obj in resp array",toadd);
                        mresp.push(toadd);
                        resolve();
                    })
                    // .catch(err => {
                    //     throw new Error(err);
                    // });
            });
        };

        if (req.body instanceof Array) {
            console.log("array recieved!");
            req.body.forEach(function(devObj) {
                parray.push(getStreamPromise(devObj));
            });
            Promise.all(parray)
                .then(() => {
                    console.log("Promises Resolved: ", parray.length);
                    console.log("resp obj:", mresp);
                    return res.send(mresp);
                })
                .catch(function(err) {
                    console.log('error occured in all promises for getting stream', err);
                    throw new Error(err);
                });
        } else {
            console.log("single object recieved!", req.body);
            onvifFunctions.getStream(req.body)
                .then((rtspurl) => {
                    return res.send(Object.assign(req.body, { "url": rtspurl }));
                })
                .catch(err => {
                    // throw new Error(err);
                    console.log('error while getting stream', err, typeof(err));
                    console.log('error in string', err.toString());
                    return res.status(400).send({
                        err: "ERR",
                        msg: err.toString()
                    });
                });
        }
    });

router.route('/probestream')
    .post(jsonParser, function(req, res) {
        console.log("Probe stream called!");
        console.log("Requested URL to probe:", req.body.url);
        rtspFunctions.probeStream(req.body.url)
            .then(function(probedata) {
                console.log("probing finished!");
                return res.send(probedata);
            })
            .catch(function(err) {
                return res.send({ "_status": "ERR", "_message": err._message });
            });
    });

router.route('/streamops')
    .post(jsonParser, function(req, res) {
        console.log("streamops route called!");
        var inputStreamOpsbody = req.body;
        // check for all NEEDED fields
        var dataPresenceValidation = new Promise(function(resolve, reject) {
            if (!inputStreamOpsbody.url || !inputStreamOpsbody.type) {
                var err_msg = "one or more Needed fileds missing";
                console.log(err_msg);
                reject(err_msg);
            } else if (inputStreamOpsbody.videostreamOptions.enabled == false && inputStreamOpsbody.audiostreamOptions.enabled == false) {
                var err_msg = "No real job given. Kindly refer to API to give either Audio or Video streaming job!";
                console.log(err_msg);
                reject(err_msg);
            } else {
                console.log("Data presence Validation Passed!");
                resolve();
            }
        });

        // check for all stream specific operations validity like local or cloud
        var OpsTypeValidation = new Promise(function(resolve, reject) {
            // local validation
            console.log(`Running validations for type: ${inputStreamOpsbody.type}, Restreaming:,${inputStreamOpsbody.videostreamOptions.restream}`);
            if (inputStreamOpsbody.type == "local" && inputStreamOpsbody.videostreamOptions.restream == false) {
                if (inputStreamOpsbody.saveOptions.maxfilesize || inputStreamOpsbody.saveOptions.duration) {
                    // some other validations, if needed to be done.  For ex:
                    if (inputStreamOpsbody.saveOptions.maxfilesize > 100) {
                        reject("Max file size reached!  Input less than 100M");
                    }
                    // if everything is alright
                    else {
                        console.log("Valid Ops type found! Resolving");
                        resolve();
                    }
                } else {
                    reject("Invalid Options for type local! Enter either max. file size or duration for saving.");
                }
            } else if (inputStreamOpsbody.type == "local" && inputStreamOpsbody.videostreamOptions.restream == true) {
                // TODO: necessary checks for re-stream & set defaults
                console.log("Valid Ops type found! Resolving");
                resolve();
            }
            // cloud validation
            else if (inputStreamOpsbody.type == "cloud") {
                console.log("rejecting this as going to implement afterwards");
                reject("Not yet implemented!");
            } else {
                console.log("rejecting this as going to implement afterwards");
                reject("Not yet implemented!");
            }
        });

        // add a stream job
        var addStreamOpsJob = new Promise(function(resolve) {
            console.log("seding a job add request to ", req.headers.host);
            fetch('http://localhost:8000/v1/jobmanager/Jobs', {
                    method: 'POST',
                    body: JSON.stringify(inputStreamOpsbody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(resp => {
                    return resp.json();
                })
                .then(resp => {
                    console.log("obtained mjob is", JSON.stringify(resp));
                    // do any operation if needed on job's object!
                    console.log("job's data:", resp._data);
                    resolve(resp._data);
                })
                .catch(err => {
                    throw new Error(err);
                });
        });

        Promise.all([dataPresenceValidation, OpsTypeValidation])
            .then(() => {
                console.log("Now adding job for given stream Operation");
                return addStreamOpsJob;
            })
            .then((customJob) => {
                console.log("returning to user jobid", customJob.id);
                return res.send({ "_status": "SUCCESS", "jobID": customJob.id, "_message": "all promises rresolved! some final object with jobid" });
            })
            .catch(function(err_msg) {
                return res.send({ "_status": "ERR", "_message": err_msg });
            });
    });

router.route('/sampleurls')
    .get(function(req, res) {
        console.log("All sample URLS", __dirname);
        var samplefilename = __dirname + '/sampleurls.json';
        fs.createReadStream(samplefilename)
            .pipe(res);
    });



// /v1/rpc/mp4stream?camerastream=rtsp%3A%2F%2Fadmin%3AVedaLabs%40192.168.0.85%3A554%2FStreaming%2FChannels%2F101%3Ftransportmode%3Dunicast%26profile%3DProfile_1
router.route('/mp4stream')
    .get(async(req, res) => {
        console.log('get mp4 stream called!', req.query);
        let rtspUrl = req.query.camerastream;

        if (!rtspUrl) {
            return res.status(400).send({
                status: "err",
                msg: "bad/invalid stream url"
            })
        }
        // let rtspUrl = "rtsp://192.168.0.110:554/live/av0?user=admin&passwd=admin";
        // let probeheaders = await rtspFunctions.probeStream(rtspUrl);
        let probeheaders = {};
        let streamHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Connection': 'Keep-Alive',
            'Content-Type': 'video/mp4'
        };

        let allHeaders = Object.assign({}, probeheaders, streamHeaders);
        // res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setHeader('Connection', 'Keep-Alive');
        // res.setHeader('Content-Type', 'video/mp4');

        res.writeHead(200, allHeaders);
        rtspFunctions.rtspTomp4Stream(rtspUrl, res, req);
    })

router.route('/getimage')
    .post(jsonParser, function(req, res) {
        console.log("Get Image called!");
        console.log("Requested URL to get image from:", req.body.url);
        // TODO: Figure out type of URL first. ex- file, url etc
        rtspFunctions.getimage(req.body.url)
            .then(function(savedfilename) {
                return res.sendFile(savedfilename);
            })
            .catch(function(ffmpeg_err) {
                console.error("Error happened in getimage promise", ffmpeg_err);
                return res.send({ "_status": "ERR", "_message": ffmpeg_err._message });
            });
    });

router.route('/upnp')
    .get(function(req, res) {
        upnpFunctions.getUpnpMappings()
            .then(upnpresults => {
                console.log("got upnpresults", upnpresults)
                return res.send(upnpresults);
            })
    });

/**
 * @param req.body must be json of following schema
 * {
	"strategy": "portknock",
	"camerasList": [{
		"address": "192.168.0.109",
		"port": 554
	}]
    }
 *  @description this method is to check the liveliness of the cameras.
    Three strategies are put in place.
    1. port knocking: check camera is alive by port knocking. port number given by user. (default: 554)
    2. framegrab: get a picture from the streamurl supplied in json body by user & true/false as per image frame availability
    3. streamanalysis: give back true/false as per probing availability & return back probe response.

    #response: [
        {
            "status": true,
            "address": "192.168.0.109",
            "port": 554
        }
    ]
*/

router.route('/liveliness')
    .post( jsonParser, (req,res) => {
        console.debug('camera liveliness check called!',req.body);
        let requestBody = null;
        let cameraCheckStrategy=null;
        const cameraCheckStrategies = ["portknock","framegrab", "streamanalysis"];

        requestBody = req.body;
        
        cameraCheckStrategy = requestBody['strategy'] || "portknock";
        if(!cameraCheckStrategies.includes(cameraCheckStrategy))
            return res.status(400).send("Invalid checking strategy");


        let camerasList = requestBody['camerasList']
        console.log("json parsed cameraslist",camerasList);
        let camsStatus = camerasList.map( (cams) => {
            return new Promise( async (resolv,rejct) => {
                let status = await isPortReachable(cams.port, {host: cams.address, timeout: 3000} );
                resolv({
                    status: status,
                    ...cams
                })
            });
        });

        Promise.all(camsStatus)
            .then(camstatuses => {
                console.debug("all cams status",camstatuses);
                return res.send(camstatuses);
            })
    })


    async function geResource(resource,query){
        return new Promise( (resolve,reject) =>{

        });
    }

module.exports = router;