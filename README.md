# Cameras Discovery:

### What is Cameras Discovery?
- Idea is to convert it from a library to a quickly-digestible tool including some other handy services & discovery options. 
- Support for searching via other mechanicsms like UPnP,mdns,port number based to get list of all potential cameras.

### How it works?


### Installing:
Local run
- bash ./run.sh

Docker pull
```sh
docker pull saurabhshandy/camerasdiscovery
```
---------------------------------------

### Objects:

- streamops
Input
```
{
    "url" : "rtsp://192.168.1.99/live/av0?user=myusename&passwd=mypassword",
    "saveOptions" :{
        "savelocation" : "local/public",
        "maxfilesize" : "100M"  
    },
    "videostreamOptions" :{
    "enabled" : true,
    "re-stream" : true,
    "fps" : "auto",
    "video-size" : '1280x720',
    "codec" : "mpeg1video",
    "transport":"tcp",
    "format" : "mpegts"
    },
    "audiostreamOptions" :{
    "enabled" : false
    }
}
```
Output Object:
```
{
    "url" : inputObject.videostreamOptions.url,
    "requestID" : your-unique-request-id,
    "saveOptions" : {
    "savelocation" : function(inputObject){
        if (inputObject.saveOptions.location=="public"){
            return "publicFileURL";
        }
        else if(inputObject.saveOptions.location=="local"){
            return "localfilepath";
        }
    },
    "maxfilesize" : "100M"
    },
    "videostreamOptions" :{
    "enabled" : inputObject.videostreamOptions.enabled,
    "re-stream" : function(inputObject){
        if (inputObject.videostreamOptions.re-stream){
            return "public stream URL";
        }
        else{
            return "NA";
        }
    },
    "fps" : inputObject.videostreamOptions.fps,
    "video-size" : inputObject.videostreamOptions.video-size,
    "codec" : inputObject.videostreamOptions.codec,
    "transport":inputObject.videostreamOptions.transport,
    "format" : inputObject.videostreamOptions.format
    },
    "audiostreamOptions" :{
    "enabled" : false
    }
}
```

## <a id="License"> License</a>

The MIT License (MIT)

Copyright (c) @ Saurabh Shandilya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
