FROM ubuntu:14.04

MAINTAINER Zane McCaig

# Update the repositories
RUN apt-get update

# install npm
RUN apt-get install -y npm

# Link nodejs to node for compatibility
RUN ln -s /usr/bin/nodejs /usr/bin/node

# install openssl
RUN apt-get install -y openssl

# Copy our source files into the new docker
COPY . /src

# Install our dependencies
RUN cd /src && \
  npm install && \
  rm server/boot/explorer.js && \
  rm -r client && \
  rm -r test

# Install strongloop
#RUN npm install -g strongloop

# Prepare for production
ENV NODE_ENV production 

# expose our port
EXPOSE 3000
EXPOSE 3443

# Run the application
CMD cd /src && node server/server.js 
#CMD cd /src && DEBUG=loopback:* node server/server.js 
