FROM node:8-alpine

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
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs
# USER nodejs

CMD ["npm", "start"]
# CMD ["npm","run","devstart"]
