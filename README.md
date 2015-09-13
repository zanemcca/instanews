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

### Documentation
- ```grunt docs```
#### Generate
- ```grunt docs:gen```
#### Serve
- ```grunt docs:serve```
#### Update Client SDK and update the docs
-```grunt sdk```

### Testing
#### Backend
- ```grunt coverage(:[unit,integration])``` (Coverage reporting and checking as well as testing)
- ```grunt coverage:open``` (Opens the generated coverage report in youe default browser)
- ```grunt check``` (Checks if the generated coverage meets the required limits)
- ```grunt test(:[unit,integration])``` (Skips coverage reporting)

#### Frontend
- ```cd ~/workdir/instanews/client```
- ```grunt karma```

### Running the site
#### Backend
- ```grunt start``` (Starts a headless backend on localhost:3000)
- ```grunt serve``` (Same as start but it also opens localhost:3000 in your default browser)
- ```grunt explorer``` (Same as start but it also opens localhost:3000/explorer in your default browser)

#### Frontend
- ```cd client```
- ```grunt serve``` (Builds the client from app to www and serves it)

#### Full site (livereload backend)
- ```cd client```
- ```grunt build```
- ```cd ..```
- ```grunt serve```

#### Full site (livereload frontend)
- ```grunt start```
- ```cd client```
- ```grunt serve```

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
