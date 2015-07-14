# Instanews

Local Citizen Journalism in an elegant simple platform

## Getting Started

### Setup
- Encrypt your working directory
- Install git
- Install npm (node package manager)
- ```npm install -g slc grunt grunt-cli mocha karma ionic```
- ```cd ~/workdir```
- Follow [this](https://help.github.com/articles/generating-ssh-keys/) tutorial to enable SSH github communication
- ```git clone git@github.com:instanews/instanews.git```
- ```npm install```
- ```cd ~/workdir/instanews/client```
- ```npm install```
- ```bower install```

### Testing
#### Backend
- ```cd ~/workdir/instanews```
- ```npm test```

#### Frontend
- ```cd ~/workdir/instanews/client```
- ```grunt karma```

### Running the site
#### Headless backend
- ```cd ~/workdir/instanews```
- ```slc run```
- Visit localhost:3000/explorer

#### Headless frontend
- ```cd ~/workdir/instanews/client```
- ```ionic serve```
- A browser should be opened automatically

#### Full site
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

### Pushing changes
- Fork a copy of instanews to your Github account
- ```cd ~/workdir/instanews```
- Check the remote Fetch and Push URLs with ```git remote -v```
- ```git remote set-url --push origin git@github.com:YOURUSERNAME/instanews.git```
- ```git remote -v``` (The push url should have been updated to point to your fork)
- ```git push```
- Make a pull request from Github
