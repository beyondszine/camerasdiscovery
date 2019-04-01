# Cameras Discovery:

### What is Cameras Discovery?
- Idea is to convert it from a library to a quickly-digestible tool including some other handy services & discovery options. 
- Support for searching via other mechanicsms like UPnP,mdns,port number based to get list of all potential cameras.

### Features?

- [x] DiscoverCameras : discover cameras in your network.  Supported scan types are Upnp, RTSP Port scan, Onvif.
- [x] Probestream : Probe a stream by giving URL as parameter.  ffprobe response is returend as json giving details like 
- [x] Stream-ops : Pass a streamURL, 
  - [x] Save the video file from stream locally.
  - [ ] Save the video file from stream on cloud.
  - [x] Get Image file from stream as Response. (One shot usage)
  - [ ] Get Image Steam from given stream as Response.  (BULK USAGE)
  - [ ] Restream the resource locally or on cloud.
  - [ ] Access the stream via websocket.
  - [ ] Access the stream on HLS.  
    
  

### Running:
- Run docker directly:
```sh
docker run --rm --name=camerasdiscovery -p 8000:8000 --network host saurabhshandy/camerasdiscovery
#OR 
bash run.sh
```
- Only Pullling docker image
```sh
docker pull saurabhshandy/camerasdiscovery
```
---------------------------------------
Dockerhub : [Link](https://hub.docker.com/r/saurabhshandy/camerasdiscovery)

### Routes with Input & Output:
List of Routes:
- `/discoverCameras` : discover cameras in your network.
  <details>
    <summary>
      <i>Code: </i>
    </summary>
    <p>

    ```sh
    curl --request GET \
    --url http://localhost:8000/v1/rpc/discoverCameras \
    --header 'content-type: application/json'
    ```
    </p>
  </details>
    <details>
    <summary>
      <i>Sample Output: </i>
    </summary>
    <p>

    ```sh
    {
      "status": "success",
      "data": [
        {
          "urn": "urn:uuid:xxxxx-xxxx-xxxx-xxxx-xxxxxxxxx",
          "name": "IPCAM",
          "hardware": "HS-Camera",
          "location": "Country:[China]",
          "types": [
            "_0:NetworkVideoTransmitter"
          ],
          "xaddrs": [
            "http://192.168.x.y:port/onvif/device_service"
          ],
          "scopes": [
            "onvif://www.onvif.org/type/NetworkVideoTransmitter",
            "onvif://www.onvif.org/location/Country:[China]",
            "onvif://www.onvif.org/name/IPCAM",
            "onvif://www.onvif.org/hardware/HS-Camera"
          ]
        },
        {
          "urn": "urn:uuid:xxxxx-xxxx-xxxx-xxxx-xxxxxxxxx",
          "name": "Avantgarde-Test",
          "hardware": "PL1234",
          "location": "shenzhen",
          "types": [
            "dn:NetworkVideoTransmitter"
          ],
          "xaddrs": [
            "http://192.168.x.y:36000/onvif/device_service"
          ],
          "scopes": [
            "onvif://www.onvif.org/type/video_encoder",
            "onvif://www.onvif.org/type/ptz",
            "onvif://www.onvif.org/type/audio_encoder",
            "onvif://www.onvif.org/hardware/PL1234",
            "onvif://www.onvif.org/name/Avantgarde-Test",
            "onvif://www.onvif.org/location/shenzhen"
          ]
        }
      ]
    }
    ```
    </p>
  </details>
  


- `/streamops` : Do operations on video stream/file like saving it locally/cloud or restream it.
  <details>
    <summary>
      <i>Code: </i>
    </summary>
    <p>

    ```sh
      curl --request POST \
        --url http://localhost:8000/v1/rpc/streamops \
        --header 'content-type: application/json' \
        --data '{
        "url" : "rtsp://192.168.x.y/live/av0?user=myuser&passwd=mypassword",
        "type" : "local",
        "saveOptions" :{
          "filename" : "myfile",
          "maxfilesize" : "100M",
          "duration": "10"
        },
        "videostreamOptions" :{
          "enabled" : true,
          "restream" : false,
          "fps" : "auto",
          "videosize" : "1280x720",
          "codec" : "mpeg1video",
          "transport":"tcp",
          "format" : "mpegts"
        },
        "audiostreamOptions" :{
          "enabled" : false
        }
      }'
    ```
    </p>
  </details>

  <details>
    <summary>
      <i>Sample Output: </i>
    </summary>
    <p>

    ```sh
    {
      "url": "rtsp://192.168.1.99/live/av0?user=myusename&passwd=mypassword",
      "requestID": "b3efd892-fe9f-4813-b5fe-09a2a4c958b0",
      "type": "localfilepath",
      "saveOptions": {
        "filename": "myfile",
        "maxfilesize": "100M"
      },
      "videostreamOptions": {
        "enabled": true,
        "restream": "public stream URL",
        "fps": "auto",
        "videosize": "1280x720",
        "codec": "mpeg1video",
        "transport": "tcp",
        "format": [
          "mpegts"
        ]
      },
      "audiostreamOptions": {
        "enabled": false
      }
    }
    ```
    </p>
  </details>

- `/probestream` : Do a `ffprobe` on the given stream.
  <details>
    <summary>
      <i>Code: </i>
    </summary>
    <p>

    ```sh
    curl --request POST \
      --url http://localhost:8000/v1/rpc/probestream \
      --header 'content-type: application/json' \
      --data '{
      "url" : "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }'
    ```
    </p>
  </details>
  <details>
    <summary>
      <i>Sample Output: </i>
    </summary>
    <p>

    ```sh
    {
      "streams": [
        {
          "index": 0,
          "codec_name": "h264",
          "codec_long_name": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
          "profile": "Baseline",
          "codec_type": "video",
          "codec_time_base": "1/50",
          "codec_tag_string": "[0][0][0][0]",
          "codec_tag": "0x0000",
          "width": 1280,
          "height": 720,
          "coded_width": 1280,
          "coded_height": 720,
          "has_b_frames": 1,
          "sample_aspect_ratio": "0:1",
          "display_aspect_ratio": "0:1",
          "pix_fmt": "yuvj420p",
          "level": 31,
          "color_range": "pc",
          "color_space": "bt709",
          "color_transfer": "bt709",
          "color_primaries": "bt709",
          "chroma_location": "left",
          "field_order": "progressive",
          "timecode": "N/A",
          "refs": 1,
          "is_avc": "false",
          "nal_length_size": 0,
          "id": "N/A",
          "r_frame_rate": "25/1",
          "avg_frame_rate": "25/1",
          "time_base": "1/90000",
          "start_pts": 21600,
          "start_time": 0.24,
          "duration_ts": "N/A",
          "duration": "N/A",
          "bit_rate": "N/A",
          "max_bit_rate": "N/A",
          "bits_per_raw_sample": 8,
          "nb_frames": "N/A",
          "nb_read_frames": "N/A",
          "nb_read_packets": "N/A",
          "disposition": {
            "default": 0,
            "dub": 0,
            "original": 0,
            "comment": 0,
            "lyrics": 0,
            "karaoke": 0,
            "forced": 0,
            "hearing_impaired": 0,
            "visual_impaired": 0,
            "clean_effects": 0,
            "attached_pic": 0,
            "timed_thumbnails": 0
          }
        },
        {
          "index": 1,
          "codec_name": "pcm_alaw",
          "codec_long_name": "PCM A-law / G.711 A-law",
          "profile": "unknown",
          "codec_type": "audio",
          "codec_time_base": "1/8000",
          "codec_tag_string": "[0][0][0][0]",
          "codec_tag": "0x0000",
          "sample_fmt": "s16",
          "sample_rate": 8000,
          "channels": 1,
          "channel_layout": "unknown",
          "bits_per_sample": 8,
          "id": "N/A",
          "r_frame_rate": "0/0",
          "avg_frame_rate": "0/0",
          "time_base": "1/8000",
          "start_pts": 0,
          "start_time": 0,
          "duration_ts": "N/A",
          "duration": "N/A",
          "bit_rate": 64000,
          "max_bit_rate": "N/A",
          "bits_per_raw_sample": "N/A",
          "nb_frames": "N/A",
          "nb_read_frames": "N/A",
          "nb_read_packets": "N/A",
          "disposition": {
            "default": 0,
            "dub": 0,
            "original": 0,
            "comment": 0,
            "lyrics": 0,
            "karaoke": 0,
            "forced": 0,
            "hearing_impaired": 0,
            "visual_impaired": 0,
            "clean_effects": 0,
            "attached_pic": 0,
            "timed_thumbnails": 0
          }
        }
      ],
      "format": {
        "filename": "rtsp://192.168.x.y/live/av0?user=myuser&passwd=mypassword",
        "nb_streams": 2,
        "nb_programs": 0,
        "format_name": "rtsp",
        "format_long_name": "RTSP input",
        "start_time": 0,
        "duration": "N/A",
        "size": "N/A",
        "bit_rate": "N/A",
        "probe_score": 100,
        "tags": {
          "title": "streamed by the Santachi RTSP server"
        }
      },
      "chapters": []
    }
    ```
    </p>
  </details>


- `/sampleurls` : Don't have streams ??  This route will give you stuff to play around.
  <details>
    <summary>
      <i>Code: </i>
    </summary>
    <p>

    ```sh
    curl --request GET --url http://localhost:8000/v1/rpc/sampleurls
    ```
    </p>
  </details>
  <details>
    <summary>
      <i>Sample Output: </i>
    </summary>
    <p>
    [sampleurls.json](https://github.com/beyondszine/camerasdiscovery/blob/master/routes/sampleurls.json)
    </p>
  </details>

- `/getimage` : Get only one image for the requested stream. (Don't abuse this route too much. For getting multiple snapshots in fast manner, use `getimagestream`).
  <details>
    <summary>
      <i>Code: </i>
    </summary>
    <p>

    ```sh
    curl --request POST \
      --url http://localhost:8000/v1/rpc/getimage \
      --header 'content-type: application/json' \
      --data '{
      "url" : "rtsp://192.168.x.y/live/av0?user=myuser&passwd=mypassword"
    }'
    ```
    </p>
  </details>

- `/getimagestream` : This enables to get recurring images in case you want image stream.
  <details>
    <summary>
      <i>Code: </i>
    </summary>
    <p>

    ```sh
    ## Nothing yet.
    ```
    </p>
  </details>


Srcs:
- https://github.com/futomi/node-onvif
- https://gist.github.com/jsturgis/3b19447b304616f18657
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [foscam-streamer](https://github.com/chpmrc/foscam_streamer)
- [ffmpeg-intro](https://sonnati.wordpress.com/2011/08/08/ffmpeg-%E2%80%93-the-swiss-army-knife-of-internet-streaming-%E2%80%93-part-ii)
- https://ffmpeg.org/
- https://github.com/phoboslab/jsmpeg
- https://stackoverflow.com/questions/32814161/how-to-make-spoiler-text-in-github-wiki-pages/39920717#39920717 ( for most import README formatting. lol)



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
