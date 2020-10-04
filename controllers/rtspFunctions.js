(function() {
    'use strict';
    const ffmpeg = require('fluent-ffmpeg');
    const util = require('util');
    const fs = require('fs');
    const path = require('path');
    var ffp = require("find-free-port");
    const cp = require('child_process');
    const uuidv1 = require('uuid/v1');


    var morgan = require('morgan');
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
    var STREAMING_PORT_RANGE_START = 18000;
    var STREAMING_PORT_RANGE_STOP = 20000;


    function probeStream(myurl) {
        return new Promise(function(resolve, reject) {
            ffmpeg.ffprobe(myurl, function(err, metadata) {
                if (err) {
                    reject(err);
                } else {
                    console.dir("successfully probed URL:", metadata);
                    resolve(metadata);
                }
            });
        })
    }

    function rtspTomp4Stream(myurl, sock) {
        ffmpeg(myurl)
            .on('start', function(commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('codecData', function(data) {
                console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
            })
            .on('progress', function(progress) {
                console.log('Processing: ' + JSON.stringify(progress));
            })
            // .on('stderr', function(stderrLine) {
            //     console.log('Stderr output: ' + stderrLine);
            // })
            .on('error', function(err, stdout, stderr) {
                // var emsg = err.message.split(':')[3];
                // var error_msg = {
                //     "_status": "ERR",
                //     "_message": emsg
                // };
                console.log('Error occured in ffmpg process:', err, typeof(err));
                // sock.status(400).send(err);

            })
            .on('end', function(stdout, stderr) {
                console.log('Transcoding succeeded !');
                sock.end();
            })
            .noAudio()
            // .size('?x480')
            .inputOptions('-hwaccel auto')
            .outputOptions('-vcodec copy')
            // .outputOptions('-preset ultrafast')
            .outputOptions('-crf 30')
            .outputOptions('-tune zerolatency')
            // .outputOptions('-bufsize 5M')
            .outputOptions('-f mp4')
            .duration(600)
            // .outputOptions('-s 640x480')
            .outputOptions("-movflags frag_keyframe+empty_moov+faststart")
            .outputOptions('-frag_duration 3600')
            .pipe(sock)
    }

    function streamOpsSave(streamopsObject) {
        var maxtimeout = 600;
        console.log("Stream-ops-save Called with :", JSON.stringify(streamopsObject));
        var ffmpegOptions = {
            timeout: maxtimeout,
            logger: morgan('combined', { stream: accessLogStream })
        }; // in seconds

        var transportInputOptions = '-rtsp_transport ' + (streamopsObject.videostreamOptions.transport || "tcp");
        var videocodecOption = streamopsObject.videostreamOptions.codec || 'mpeg1video';
        var fpsOption = streamopsObject.videostreamOptions.fps || "auto";
        var videosizeOption = streamopsObject.videostreamOptions.videosize || "1280x720";
        var videoformatOption = '-f ' + (streamopsObject.videostreamOptions.format || "mpegts");
        var videosaveduration = parseInt(streamopsObject.saveOptions.duration) || maxtimeout;

        var mcommand = ffmpeg(ffmpegOptions);
        mcommand
            .input(streamopsObject.url)
            .on('start', function(commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('codecData', function(data) {
                console.log('Input is ' + data.audio + ' audio ' +
                    'with ' + data.video + ' video');
            })
            .on('progress', function(progress) {
                console.log('Processing: ' + JSON.stringify(progress));
            })
            // .on('stderr', function(stderrLine) {
            //     console.log('Stderr output: ' + stderrLine);
            // })
            .on('error', function(err, stdout, stderr) {
                var emsg = err.message.split(':')[3];
                var error_msg = {
                    "_status": "ERR",
                    "_message": emsg
                };
                console.log('Error:' + JSON.stringify(error_msg));
            })
            .on('end', function(stdout, stderr) {
                console.log('Transcoding succeeded !');
            })
            // Operations
            .noAudio()
            .inputOptions(transportInputOptions)
            .duration(videosaveduration)
            .videoCodec(videocodecOption)
            .size(videosizeOption)
            .outputOptions(videoformatOption)
            .save(streamopsObject.saveOptions.filename);
    }

    function streamOpsStream(streamopsObject) {
        var maxtimeout = 600;
        console.log("Stream-ops-stream Called with :", JSON.stringify(streamopsObject));
        var ffmpegOptions = {
            timeout: maxtimeout,
            // logger : morgan('combined', { stream: accessLogStream })
        }; // in seconds

        var transportInputOptions = '-rtsp_transport ' + (streamopsObject.videostreamOptions.transport || "tcp");
        var videocodecOption = streamopsObject.videostreamOptions.codec || 'mpeg1video';
        var fpsOption = streamopsObject.videostreamOptions.fps || "auto";
        var videosizeOption = streamopsObject.videostreamOptions.videosize || "1280x720";
        var videoformatOption = '-f ' + (streamopsObject.videostreamOptions.format || "mpegts");
        var videosaveduration = parseInt(streamopsObject.saveOptions.duration) || maxtimeout;

        ffp(STREAMING_PORT_RANGE_START, STREAMING_PORT_RANGE_STOP, '127.0.0.1', 2, function(err, p1, p2, ) {
            if (err) {
                console.log("Find free port failed!");
                console.log(err);
                return;
                // send the job queue this messge
            }
            console.log("obtained ports are: " + p1 + "  " + p2);
            const websocketrelay = cp.fork(`${__dirname}/websocket-relay.js`, ["mysecret", p1, p2]);
            websocketrelay.on('message', (m) => {
                console.log('Worker Server message :', m);
            });
            websocketrelay.on('exit', (ecode, esignal) => {
                console.log('Worker Exited :', ecode, esignal);
                // update to job queue manager to update status
            });

        });

        function startffmpegstream() {
            var mcommand = ffmpeg(ffmpegOptions);
            mcommand
                .input(streamopsObject.url)
                .on('start', function(commandLine) {
                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('codecData', function(data) {
                    console.log('Input is ' + data.audio + ' audio ' +
                        'with ' + data.video + ' video');
                })
                .on('progress', function(progress) {
                    console.log('Processing: ' + JSON.stringify(progress));
                })
                // .on('stderr', function(stderrLine) {
                //     console.log('Stderr output: ' + stderrLine);
                // })
                .on('error', function(err, stdout, stderr) {
                    var emsg = err.message.split(':')[3];
                    var error_msg = {
                        "_status": "ERR",
                        "_message": emsg
                    };
                    console.log('Error:' + JSON.stringify(error_msg));
                })
                .on('end', function(stdout, stderr) {
                    console.log('Transcoding succeeded !');
                })
                // Operations
                .noAudio()
                .inputOptions(transportInputOptions)
                .duration(videosaveduration)
                .videoCodec(videocodecOption)
                .size(videosizeOption)
                .outputOptions(videoformatOption)
                .save(streamopsObject.saveOptions.filename);
        }
    }

    function getimage(myurl) {
        return new Promise(function(resolve, reject) {
            var maxtimeout = 600;
            console.log("Get-Image Called for URL:", myurl);
            var ffmpegOptions = {
                timeout: maxtimeout,
                // logger : morgan('combined', { stream: accessLogStream })
            }; // in seconds

            var baseSnapshotsDirectory = path.join(__dirname, '../', '/public/images/snapshots/')
            var outputfilename = uuidv1() + '.png';
            var outputfilenamefullpath = baseSnapshotsDirectory + outputfilename;

            // var transportInputOptions='-rtsp_transport '+ (streamopsObject.videostreamOptions.transport || "tcp");
            // var imageformatOption = '-f '+ (streamopsObject.videostreamOptions.format || "mpegts");
            try {
                var mcommand = ffmpeg(ffmpegOptions);
                mcommand
                    .input(myurl)
                    .on('start', function(commandLine) {
                        console.log('Spawned Ffmpeg with command: ' + commandLine);
                    })
                    .on('codecData', function(data) {
                        console.log('Input is ' + data.audio + ' audio ' +
                            'with ' + data.video + ' video');
                    })
                    .on('progress', function(progress) {
                        console.log('Processing: ' + JSON.stringify(progress));
                    })
                    .on('stderr', function(stderrLine) {
                        console.log('Stderr output: ' + stderrLine);
                    })
                    .on('error', function(err, stdout, stderr) {
                        console.log(JSON.stringify(err));
                        var emsg = err.message.split(':')[3];
                        var error_msg = {
                            "_status": "ERR",
                            "_message": emsg,
                            "stack": JSON.stringify(err)
                        };
                        console.log('Error:' + JSON.stringify(error_msg));

                    })
                    .on('end', function(stdout, stderr) {
                        console.log('Image Saved Successfully !');
                        resolve(outputfilenamefullpath);
                    })
                    // Operations
                    .noAudio()
                    // .inputOptions(transportInputOptions)
                    // .size(videosizeOption)
                    .outputOptions(['-f image2', '-vframes 1', '-vcodec png'])
                    .save(outputfilenamefullpath);
            } catch (ffmpeg_err) {
                console.error("ffmpeg error", ffmpeg_err);
                reject(ffmpeg_err);
            }
        });
    }

    module.exports = {
        probeStream: probeStream,
        streamOpsSave: streamOpsSave,
        streamOpsStream: streamOpsStream,
        getimage: getimage,
        rtspTomp4Stream: rtspTomp4Stream
    };

})();