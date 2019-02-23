FROM node:8-alpine

# Create app directory 
# The idea is to have /home/<language/framework>/repository
RUN mkdir -p /home/nodejs/apps/
WORKDIR /home/nodejs/apps/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm audit fix
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8000

ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]


# add some user for your program and run your program via it after this USER.
# RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs
# USER nodejs

# Run "node server.js" & not "npm start" as it runs more number of
# wrapper processes and fucks up signal handler and GC work by kernel.
# plus it also aligns with docker philosophy.
CMD ["npm", "start"]
# CMD ["npm","run","devstart"]
