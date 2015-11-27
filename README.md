# Instanews

Local Citizen Journalism in an elegant simple platform

## Getting Started

### Setup
- Encrypt your working directory
- Install nvm from [here](https://github.com/creationix/nvm)
- Install node v4.2.2 with `nvm install v4.2.2`
- Install npm (node package manager)
- ```npm install -g grunt-cli```
- Install git
- Follow [this](https://help.github.com/articles/generating-ssh-keys/) tutorial to enable SSH github communication
- ```git clone git@github.com:instanews/instanews.git```
- ```npm install```
- ```cd ~/workdir/instanews/client```
- ```npm install```
- ```bower install```
- Install [homebrew](http://brew.sh/) on Mac
- Install [Ruby](https://www.ruby-lang.org/en/documentation/installation/) `brew install ruby`
- Install [Compass](http://compass-style.org/install/) `gem install compass`
- Install [mongodb](https://docs.mongodb.org/manual/) `brew install mongodb` (You may need to create /data/db)

### Documentation
- ```grunt docs```

#### Generate
- ```grunt docs:gen```

#### Serve
- ```grunt docs:serve```

#### Update Client SDK and update the docs
- ```grunt sdk```

### Testing
#### Backend
- ```grunt coverage(:[unit,integration])``` (Coverage reporting and checking as well as testing)
- ```grunt coverage:open``` (Opens the generated coverage report in youe default browser)
- ```grunt check``` (Checks if the generated coverage meets the required limits)
- ```grunt test(:[unit,integration])``` (Skips coverage reporting)
- You can use `cu`, `ci`, `tu` and `ti` as shortcuts for the different tests

##### Example
- ```grunt coverage:unit```

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
NOTE: grunt serve does not seem to be working, use the backend to serve for now with
- ```grunt init```

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
- ```grunt debug:OPTION```
Where options are:
- `unit` - for unit tests
- `integration` - for integration tests
- `server` - for the server 
- `FILENAME` - any FILENAME relative to the the repo root directory
The default is `server`

### Pushing changes
- Fork a copy of instanews to your Github account
- ```cd ~/workdir/instanews```
- Check the remote Fetch and Push URLs with ```git remote -v```
- ```git remote set-url --push origin git@github.com:YOURUSERNAME/instanews.git```
- ```git remote -v``` (The push url should have been updated to point to your fork)
- ```git push```
- Make a pull request from Github
