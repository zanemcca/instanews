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
  rm server/boot/explorer.js 

# Install strongloop
#RUN npm install -g strongloop

# Prepare for staging 
ENV NODE_ENV staging 
ENV ENCRYPT_PASSWORD couchesareabit2fly4me

# expose our port
EXPOSE 3000
EXPOSE 3443

# Run the application
#CMD cd /src && slc run
CMD cd /src && grunt coverage 
