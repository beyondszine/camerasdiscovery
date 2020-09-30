FROM ubuntu:18.04
RUN apt-get update
RUN apt-get install -y ffmpeg curl
RUN mkdir -p /home/nodejs/apps/camerasdiscovery
WORKDIR /home/nodejs/apps/camerasdiscovery
COPY . .
RUN ls && pwd
RUN bash install_nvm_node.sh
EXPOSE 8000
CMD ["bash","serve.sh"]