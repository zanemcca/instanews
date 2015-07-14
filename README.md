# Instanews

Local Citizen Journalism in an elegant simple platform

## Getting Started

- Encrypt your working directory
- Install git
- Install npm (node package manager)
- ```npm install -g slc grunt grunt-cli mocha karma ionic```
- ```cd ~/working/directory```
- ```cd instanews```
- ```npm install```
- ```cd client```
- ```npm install```
- ```bower install```

### Running a headless backend
- ```slc run```
- Visit localhost:3000/explorer

### Running a headless frontend
- ```cd client```
- ```grunt serve```

### Running the full site
- ```cd client```
- ```grunt build```
- ```cd ..```
- ```slc run```
- Visit localhost:3000 or localhost:3000/explorer

### Debugging backend
#### Logs
- ```DEBUG=loopback:* slc run```
 
#### Debugger
- ```npm install -g node-inspector```
- ```node-inspector```
- In another shell ```mocha --debug-brk test```
