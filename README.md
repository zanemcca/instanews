# Instanews

Local Citizen Journalism in an elegant simple platform

## Getting Started

- Encrypt your working directory
- Install git
- Install npm (node package manager)
- ```npm install -g slc grunt grunt-cli mocha karma ionic```
- ```cd ~/workdir```
- ```git clone https://username@github.com/instanews/instanews.git``` alternatively you can follow [this](https://help.github.com/articles/generating-ssh-keys/) tutorial first and then ```git clone git@github.com:instanews/instanews.git``` which will allow you to avoid having to use your password to login everytime
- ```npm install```
- ```cd ~/workdir/instanews/client```
- ```npm install```
- ```bower install```

### Running a headless backend
- ```cd ~/workdir/instanews```
- ```slc run```
- Visit localhost:3000/explorer

### Running a headless frontend
- ```cd ~/workdir/instanews/client```
- ```ionic serve```
- A browser should be opened automatically

### Running the full site
- ```cd ~/workdir/instanews/client```
- ```grunt build```
- ```cd ~/workdir/instanews```
- ```slc run```
- Visit localhost:3000 or localhost:3000/explorer

### Debugging backend
#### Logs
- ```DEBUG=loopback:* slc run```
 
#### Debugger
- ```npm install -g node-inspector```
- ```node-inspector```
- In another shell ```mocha --debug-brk test``` (For testcases) or ```node --debug-brk server/server.js``` (For code alone)
