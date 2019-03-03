FROM jrottenberg/ffmpeg
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get -y install nodejs

# Create app directory 
# The idea is to have /home/<language/framework>/repository
RUN mkdir -p /home/nodejs/apps/camerasdiscovery
WORKDIR /home/nodejs/apps/camerasdiscovery

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY . .
RUN HUSKY_SKIP_INSTALL=true npm install --only-production
# RUN npm audit fix
EXPOSE 8000
# Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs
# USER nodejs

CMD ["npm", "start"]
# CMD ["npm","run","devstart"]
