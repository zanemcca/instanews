FROM node:4.2.2

MAINTAINER Zane McCaig

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# expose our port
EXPOSE 3000
EXPOSE 3443

# Prepare for production
ENV NODE_ENV production 
# ** Ensure ENCRYPT_PASSWORD is set before node goes live

# Install universal tools
RUN npm install -g bower grunt
RUN apt-get update && apt-get install -y ruby-full rubygems
RUN gem update --system && gem install sass compass

# Install backend dependencies
COPY package.json /usr/src/app/
RUN npm install --production

# Install frontend depencencies
COPY client/package.json /usr/src/app/client/
COPY client/bower.json /usr/src/app/client/
RUN cd client && npm install --production
RUN cd client && bower install --allow-root
 
# Copy the source code over
COPY . /usr/src/app

# Compress the frontend for production 
RUN cd client && grunt compress

# Run the application
CMD npm start 
