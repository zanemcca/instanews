FROM ubuntu:14.04

MAINTAINER Zane McCaig

# Add nodesource for 4.x
RUN apt-get install -y curl && \ 
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - && \
  apt-get update && \
  apt-get install -y nodejs openssl

# Copy our source files into the new docker
COPY . /src

# Install our dependencies
RUN cd /src && \
  npm install && \
  npm install -g grunt grunt-cli && \
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
CMD cd /src && grunt start 
#CMD cd /src && DEBUG=loopback:* node server/server.js 
