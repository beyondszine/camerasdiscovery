(function(){
    'use strict';
    const ffmpeg = require('fluent-ffmpeg');
    const util = require('util');    
    const fs = require('fs');

    function probeStream(myurl){
        return new Promise(function(resolve,reject){
            ffmpeg.ffprobe(myurl, function(err, metadata) {
                if(err){
                    reject(err);
                }
                else{
                    console.dir("successfully probed URL:",metadata);
                    resolve(metadata);
                }
            });
        })
    }

    function streamOps(myurl,outputsize,sockettosend){
        console.log("Start Stream Called!!");
        var outputVideoSize='1280x720' || outputsize;
        console.log('Final output Video Size:',outputVideoSize);
        ffmpeg(myurl)
        // Global Events 
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
            var emsg=err.message.split(':')[3];
            var error_msg={
                "_status" : "ERR",
                "_message": emsg
            };
            console.log('Error:' + JSON.stringify(error_msg));
        })
        .on('end', function(stdout, stderr) {
            console.log('Transcoding succeeded !');
        })
        // Operations
        .noAudio()
        .inputOptions('-rtsp_transport tcp')
        .videoCodec('mpeg1video')
        .size(outputVideoSize)
        .outputOptions('-f mpegts')
        .pipe(sockettosend)
        // .save('/tmp/myvideo.ts');
    }




    function something(){
        let deviceObject={
            xaddr: "http://192.168.1.122:8899/onvif/device_service",
            user : 'admin',
            pass : 'VedaLabs@pirate'
        };
    };

    module.exports = {
        probeStream : probeStream,
        streamOps : streamOps
      };
    
})();
