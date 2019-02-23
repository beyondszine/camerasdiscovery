### Cameras Discovery:

- Its a fork from @futomi/node-onvif which is a Node.js module, allows you to communicate with the network camera which supports the ONVIF specifications.
- I have added support for searching via other mechanicsms like UPnP,mdns,port number based to get list of all potential cameras.

- Idea is to convert it from a library to a quickly-digestible tool including some other handy services & discovery options.

TLDR run
- bash ./run.sh

Example docker Usage:
Docker pull
```sh
docker pull saurabhshandy/camerasdiscovery
```

Example docker Usage:
```
$ docker run --rm --name=onvifdiscover --network host saurabhshandy/camerasdiscovery 
Start the discovery process.
1 devices were found.
  - Avantgarde-Test
{"urn":"urn:uuid:d74f3d21-1fb3-4ea2-887e-73e8ad986447","name":"Avantgarde-Test","hardware":"PL1130","location":"shenzhen","types":["dn:NetworkVideoTransmitter"],"xaddrs":["http://192.168.1.107:36000/onvif/device_service"],"scopes":["onvif://www.onvif.org/type/video_encoder","onvif://www.onvif.org/type/ptz","onvif://www.onvif.org/type/audio_encoder","onvif://www.onvif.org/hardware/PL1130","onvif://www.onvif.org/name/Avantgarde-Test","onvif://www.onvif.org/location/shenzhen"]}


---------------------------------------
## <a id="License"> License</a>

The MIT License (MIT)

Copyright (c) 2016 - 2018 Futomi Hatano

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
