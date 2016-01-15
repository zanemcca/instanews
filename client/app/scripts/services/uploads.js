
'use strict';

var app = angular.module('instanews.service.uploads', ['ionic', 'ngResource']);

app.service('Uploads', [
  '$q',
  'Camera',
  'ENV',
  'FileTransfer',
  'TextInput',
  'Platform',
  'rfc4122',
  'observable',
  'User',
  function(
    $q,
    Camera,
    ENV,
    FileTransfer,
    TextInput,
    Platform,
    rfc4122,
    observable,
    User
  ){
    var articles = [];
    var pending = [];

    var findOrCreate = function (parentId) {
      parentId = parentId || 'newArticle';

      var parent;
      articles.forEach(function(article) {
        if(article.spec.options.id === parentId) {
          console.log('Found cached copy of uploads');
          parent = article;
        }
      });

      if(!parent) {
        parent = {
          spec: {
            options: {
              id: parentId
            }
          }
        };
        parent.uploads = uploadList(parent.spec);

        parent.uploads.getSpec = function () {
          return parent.spec;
        };

        articles.push(parent);
      }

      return parent.uploads;
    };

    var moveToPending = function (parentId, newId) {
      parentId = parentId || 'newArticle';
      newId = newId || parentId;

      var i = 0;
      var pend;
      for(; i < articles.length; i++) {
        var article = articles[i];
        if(article.spec.options.id === parentId) {
          console.log('Found cached copy of uploads');
          pend = article;
          break;
        }
      }

      if(!pend) {
        console.log('Error: There are no uploads for ' + parentId);
        return;
      }

      pend = articles.splice(i,1)[0];
      pend.spec.options.id = newId;

      pending.push(pend);
      return pend;
    };

    var getPending = function () {
      var i = pending.length;
      while(i > 0) {
        i--;
        if(!pending[i].uploads.get().length) {
          pending.splice(i,1);
        }
      }
      return pending;
    };

    var uploadList = function (spec) {
      if(!spec || !spec.options || !spec.options.id) {
        console.log('Cannot create a upload list without the parent id!');
        console.log('Please set spec.options.id');
        return;
      }

      var uploadItems = [];
      var uploads = observable(spec); 

      var addUpload = function (item) {
        item.remove = function () {
          if(!item.noFile) {
            Platform.removeFile(item.options.fileName, function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log(item.options.fileName + ' was removed successfully!');
              }
            });
          }
          var removed = uploadItems.splice(uploadItems.indexOf(item), 1);
          uploads.notifyObservers();
          return removed;
        };

        item.resolve = function () {
          if(!item.resolved) {
            item.resolved = true;
            if(item.subarticle._file) {
              var getServer = function() {
                var urlBase = ENV.apiEndpoint;
                return urlBase + '/storages/' + item.container + '/upload/';
              };

              var waitForTranscoding;
              if(item.progress && item.progress.complete) {
                waitForTranscoding = item.progress.complete;
              } else {
                waitForTranscoding = $q.defer();
                waitForTranscoding.resolve();
              }

              waitForTranscoding.promise.then(function () {
                item.loaded = 0;
                FileTransfer.upload(getServer(), item.uri, item.options)
                .then(function () {
                  item.complete.resolve();
                }, function (err) {
                  item.complete.reject(err);
                  console.log(err);
                }, function (progress) {
                  item.loaded = progress.loaded/progress.total * 100;
                });
              }, function (err) {
                console.log(err);
                console.log('Error transcoding!');
              });
            } else {
              item.complete.resolve();
            }
          }
        };

        uploadItems.unshift(item);
        uploads.notifyObservers();
      };

      function video(vid) {
        function completeSetup(vid) {
          upload.subarticle._file.sources = [vid.nativeURL];
          upload.subarticle._file.size = vid.size;
          upload.subarticle._file.type = vid.type;
          upload.subarticle._file.name = vid.name;
          upload.uri = vid.nativeURL;
          upload.options.fileName = vid.name;
          upload.options.mimeType = vid.type;
        }

        var subarticle = {
          _file: {
            container: 'instanews-videos-in',
          }
        };

        var upload = {
          container: 'instanews-videos-in',
          options: {
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        if(ENV.name === 'staging') {
          subarticle._file.container = 'instanews-videos-test-in';
          upload.container = 'instanews-videos-test-in';
        }

        if( Platform.isAndroid()) {
          upload.progress = {
            current: 0,
            duration: 0,
            complete: $q.defer()
          };
          upload.loaded = 0;

          FileTransfer.createFile(Platform.getDataDir(), rfc4122.v4() + '.mp4', function(outputFile) {
            if(!outputFile) {
              console.log('Failed to create an output file for the video');
              return;
            }

            window.FilePath.resolveNativePath(vid.nativeURL, function(filePath) {
              if(!filePath) {
                console.log('Failed to resolve the filepath');
                return;
              }

              //TODO Read the input video and copy it if it is not >720p
              // instead of up transcoding it

              var ffmpegCmd = [
                '-y',
                '-i', filePath.replace('file://',''),
                '-vf', 'scale=720:720:force_original_aspect_ratio=increase',
                '-preset', 'ultrafast',
                '-strict','-2',
                outputFile.nativeURL.replace('file://', '')
              ];

              /* jshint undef: false */
              //VideoEditor.transcodeVideo(function (result) {
              VideoEditor.execFFMPEG(function (result) {
                console.log('Result: ' + result);
                FileTransfer.resolve(outputFile.nativeURL, function(fileEntry) {
                  console.log('Transcoding complete!');
                  console.log(fileEntry);
                  if(fileEntry) {
                    fileEntry.type = 'video/mp4';
                    completeSetup(fileEntry);
                    upload.progress.complete.resolve();
                  } else {
                    Platform.showToast('There was an error uploading your video. Please try again!');
                    upload.progress.complete.reject();
                  }
                });
              },
              function (err) {
                console.log(err);
                Platform.showToast('There was an error preparing your video. Please try again!');
                upload.progress.complete.reject();
              },
              {
                /*
                fileUri: vid.nativeURL,
                outputFileName: rfc4122.v4(),
                quality: VideoEditorOptions.Quality.HIGH_QUALITY,
                outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
                saveToLibrary: false,
                deleteInputFile: false,
                optimizeForNetworkUse: VideoEditorOptions.OptimizeForNetworkUse.YES,
               */
                cmd: ffmpegCmd,
                progress: function (info) {
                  console.log(info);
                  // info on android will be shell output from android-ffmpeg-java 
                  // info on ios will be a number from 0 to 100 
                  if (Platform.isIOS()) {
                    upload.loaded = info;
                    return; // the code below is for android 
                  }

                  // for android this arithmetic below can be used to track the progress  
                  // of ffmpeg by using info provided by the android-ffmpeg-java shell output 
                  // this is a modified version of http://stackoverflow.com/a/17314632/1673842 

                  // get duration of source 
                  var matches, ar;
                  if (!upload.progress.duration) {
                    matches = (info) ? info.match(/Duration: (.*?), start:/) : [];
                    if (matches && matches.length > 0) {
                      var rawDuration = matches[1];
                      // convert rawDuration from 00:00:00.00 to seconds. 
                      ar = rawDuration.split(':').reverse();
                      upload.progress.duration = parseFloat(ar[0]);
                      if (ar[1]) {
                        upload.progress.duration += parseInt(ar[1]) * 60;
                      }
                      if (ar[2]) {
                        upload.progress.duration += parseInt(ar[2]) * 60 * 60;  
                      }
                    }
                    return;
                  }

                  // get the time  
                  matches = info.match(/time=(.*?) bitrate/g);

                  if (matches && matches.length > 0) {
                    var time = 0;
                    var completed = 0;
                    var rawTime = matches.pop();
                    rawTime = rawTime.replace('time=', '').replace(' bitrate', '');

                    // convert rawTime from 00:00:00.00 to seconds. 
                    ar = rawTime.split(':').reverse();
                    time = parseFloat(ar[0]);
                    if (ar[1]) {
                      time += parseInt(ar[1]) * 60;
                    }
                    if (ar[2]) {
                      time += parseInt(ar[2]) * 60 * 60;
                    }

                    //calculate the progress 
                    completed = Math.round((time / upload.progress.duration) * 100);

                    upload.progress.current = time;
                    upload.loaded = completed; 
                  }
                 }
              });
            }, function(err) {
              console.log('Failed to resolve the filepath');
              console.log(err);
              return;
            });
          });
        } else {
          completeSetup(vid);
        }
        upload.complete = $q.defer();

        addUpload(upload);
      } 

      function picture(photo) {
        var subarticle = {
          _file: {
            name: photo.name,
            source: photo.nativeURL,
            container: 'instanews-photos-in',
            size: photo.size,
            caption: photo.caption,
            type: photo.type
          }
        };

        var upload = {
          container: 'instanews-photos-in',
          uri: photo.nativeURL,
          options: {
            fileName: photo.name,
            mimeType: photo.type,
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        if(ENV.name === 'staging') {
          subarticle._file.container = 'instanews-photos-test-in';
          upload.container = 'instanews-photos-test-in';
        }

        upload.complete = $q.defer();

        addUpload(upload);
      }

      function text(content) {
        var subarticle = {
          text: content
        };

        var upload = {
          subarticle: subarticle,
          noFile: true,
          complete: $q.defer()
        };

        addUpload(upload);
      }

      // Public functions
      uploads.get = function (){
        return uploadItems;
      };

      //Capture video using the video camera
      uploads.captureVideo = function() {
        Camera.captureVideo()
        .then( function(vid) {
          if(vid) {
            video(vid);
          }
        },
        // istanbul ignore next
        function(err) {
          console.log(err);
          Platform.showToast('There was an error capturing your video. Please try again!');
        });
      };

      //Get a photo(s) from the gallery
      uploads.getFromGallery = function() {
        Camera.openMediaGallery()
        .then( function(media) {
          if(media) {
            if(media.type.indexOf('image') > -1) {
              picture(media);
            } else if (media.type.indexOf('video') > -1) {
              video(media);
            } else {
              Platform.showToast('Sorry but you can only upload photos and videos. Please try again!');
            }
          }
        },
        // istanbul ignore next
        function(err) {
          console.log(err);
          Platform.showToast('There was an error while trying to get something from the gallery. Please try again!');
        });
      };

      //Capture a photo using the camera and store it into the new article
      uploads.capturePicture = function() {
        Camera.capturePicture()
        .then( function(photo) {
          if(photo) {
            picture(photo);
          }
        }, 
        // istanbul ignore next
        function(err) {
          console.log('Error: Failed to capture a new photo: ' + JSON.stringify(err));
          Platform.showToast('There was an error capturing your photo. Please try again!');
        });
      };

      uploads.clear = function () {
        //TODO Do a proper cleanup of uploads. aka - actually cancel the upload
        uploadItems = [];
        uploads.notifyObservers();
      };

      uploads.getText = function (txt) {
        txt = txt || {partial:''};
        var textInput = TextInput.get('modal');
        textInput.placeholder = 'What\'s the story?';
        textInput.text = txt.partial;

        textInput.open(function (newText) {
          text(newText);
          txt.partial = '';
        }, function (partialText) {
          //Interruption function
          txt.partial = partialText;
        });
      };

      return uploads;
    };

    return {
      moveToPending: moveToPending,
      getPending: getPending,
      findOrCreate: findOrCreate 
    };
  }
]);
