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
