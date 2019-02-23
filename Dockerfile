FROM node:8

# Create app directory 
# The idea is to have /home/<language/framework>/repository
RUN mkdir -p /home/nodejs/apps/expressJSproductionTemplate
WORKDIR /home/nodejs/apps/expressJSproductionTemplate

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install ---only=production
RUN npm audit fix
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8000

# Wrapping of our programs be it, nodejs, python or anything else.
# One common problem is of us is not being able to write all the necessary 
# signal handlers in our program.  As I saw, docker philosophy is about
# one process per docker only!
# so we need to wrap our program within some sort of INIT type manager which
# can be used standalone or provided by docker itself.
# if not using tini(https://github.com/krallin/tini) - the by default init wrapper for nodejs.  its even by nodejs guys
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init

# Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]


# add some user for your program and run your program via it after this USER.
RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs
USER nodejs

# Run "node server.js" & not "npm start" as it runs more number of
# wrapper processes and fucks up signal handler and GC work by kernel.
# plus it also aligns with docker philosophy.
CMD ["node", "bin/www"]
