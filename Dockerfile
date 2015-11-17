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

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

# Run the application
CMD npm start 
