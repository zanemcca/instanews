FROM ubuntu:14.04

MAINTAINER Zane McCaig

# Update the repositories
RUN apt-get update

# install npm
RUN apt-get install -y npm

# install openssl
RUN apt-get install -y openssl

# Copy our source files into the new docker
# TODO Change this to pull them from git
COPY . /src

# Install our dependencies
RUN cd /src; \
  npm install; \
  rm server/boot/explorer.js; \
  rm -r client; \
  rm -r test; ls -alrt

# Install strongloop
#RUN npm install -g strongloop

# Link nodejs to node for compatibility
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Prepare for production
ENV NODE_ENV staging 
ENV ENCRYPT_PASSWORD  couchesareabit2fly4me

# expose our port
EXPOSE 3000
EXPOSE 3443

# Run the application
#CMD cd /src && slc run
CMD cd /src && DEBUG=loopback:* npm test 
