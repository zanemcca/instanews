
'use strict';

var app = angular.module('instanews.service.uploads', ['ionic', 'ngResource']);

app.service('Uploads', [
  '$q',
  'Camera',
  'ENV',
  'FileTransfer',
  'TextInput',
  'Platform',
  'Navigate',
  'Storage',
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
    Navigate,
    Storage,
    rfc4122,
    observable,
    User
  ){

    var inProgress = {};

    var pending = [];

    var findOrCreate = function (parentId) {
      parentId = parentId || 'newArticle';

      var parent = inProgress[parentId]; 

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

        inProgress[parentId] = parent;
      }

      return parent.uploads;
    };

    var moveToPending = function (parentId, newId) {
      parentId = parentId || 'newArticle';
      newId = newId || parentId;

      var pend = inProgress[parentId];

      if(!pend) {
        console.log('Error: There are no uploads for ' + parentId);
        return;
      }

      // Clear the inProgress copy 
      inProgress[parentId] = null;

      pend.spec.options.id = newId;

      pending.push(pend);
      return pend;
    };

    var isPending = function(parentId) {
      parentId = parentId || 'newArticle';

      var found = false;
      pending.forEach(function(article) {
        if(article.spec.options.id === parentId) {
          found = true;
        }
      });
      return found;
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

      var mediaItemsCount = 0;
      var uploadItems = [];
      var uploads = observable(spec); 

      var addUpload = function (item) {
        item.remove = function () {
          if(!item.noFile) {
            mediaItemsCount--;
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
              attemptUpload();
            } else {
              item.complete.resolve();
            }
          }
        };

        var attemptUpload = function() {
          console.log(item.failed);
          var funcs = [];
          switch(item.failed) {
            case 'transcode':
              transcode(item);
              funcs = [waitForTranscoding, getUploadKey, uploadFile];
              break;
            case 'uploadFile':
              funcs = [uploadFile];
              break;
            case 'getUploadKey':
              funcs = [getUploadKey, uploadFile];
              break;
            default:
              funcs = [waitForTranscoding, getUploadKey, uploadFile];
              break;
          }

          item.failed = null;
          console.log(funcs);

          // jshint undef: false
          async.waterfall(funcs, function(err) { 
            if(err) {
              item.resolved = false;
              console.log(err);
              item.complete.reject(err);

            } else {
              item.complete.resolve();
            }
          });
        };

        var getUploadKey = function(cb) {
          Storage.getUploadKey({
            container: item.container,
            type: item.options.mimeType,
            fileName: item.options.fileName
          },
          function (res) {
            item.uploadKey = res.data;
            cb();
          },
          function(err) {
            item.failed = 'getUploadKey';
            console.log('Failed to get upload key');
            cb(err);
          });
        };

        var uploadFile = function(cb) {
          item.loaded = 0;
          item.options.chunkedMode = false;
          item.options.params = item.uploadKey.params;
          item.options.headers = {
            Connection: 'close'
          };

          /*
           * Other unused options
          item.options.httpMethod = 'PUT';
          item.options.encodeURI = false;
          item.options.headers = {
            'Content-Type': item.options.mimeType,
            'x-amz-acl': 'public-read'
          };
         */

        /*
         * Convenient tool to simulate failures for testing
        if(!item.firstUpload) {
          item.firstUpload = true;
          return cb(new Error('error'));
        }
       */

          FileTransfer.upload(item.uploadKey.url, item.uri, item.options, true)
          .then(function () {
            cb();
          },
          function (err) {
            item.failed = 'uploadFile';
            console.log('Failed to upload the file');
            cb(err);
          },
          function (progress) {
            item.loaded = progress.loaded/progress.total * 100;
          });
        };

        var waitForTranscoding = function(cb) {
          var wait;
          if(item.progress && item.progress.complete) {
            wait = item.progress.complete;
          } else {
            wait = $q.defer();
            wait.resolve();
          }

          wait.promise.then(function () {
            cb();
          },
          function (err) {
            item.failed = 'transcode';
            console.log('Error transcoding!');
            cb(err);
          });
        }; 

        uploadItems.unshift(item);
        item.resolve();
        uploads.notifyObservers();
      };

      var transcode = function(upload) {
        function completeSetup(vid) {
          upload.subarticle._file.sources = [vid.nativeURL];
          upload.subarticle._file.size = vid.size;
          upload.subarticle._file.type = vid.type;
          upload.subarticle._file.name = vid.name;
          upload.uri = vid.nativeURL;
          upload.options.fileName = vid.name;
          upload.options.mimeType = vid.type;
        }

        upload.progress = {
          current: 0,
          duration: 0,
          complete: $q.defer()
        };

        upload.loaded = 0;

        // Transcode the file
        FileTransfer.createFile(Platform.getDataDir(), rfc4122.v4() + '.mp4', function(outputFile) {
          if(!outputFile) {
            var e = new Error('Failed to create an output file for the video');
            console.log(e);
            upload.progress.complete.reject(e);
            return;
          }

          window.FilePath.resolveNativePath(upload.nativeURL, function(filePath) {
            if(!filePath) {
              var e = new Error('Failed to resolve the filepath');
              console.log(e);
              upload.progress.complete.reject(e);
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
            VideoEditor.execFFMPEG(function () {
              FileTransfer.resolve(outputFile.nativeURL, function(fileEntry) {
                if(fileEntry) {
                  fileEntry.type = 'video/mp4';
                  //TODO Get the file size
                  completeSetup(fileEntry);
                  upload.progress.complete.resolve();
                } else {
                  var e = new Error('Failed to resolve the nativeURL');
                  console.log(e);
                  upload.progress.complete.reject(e);
                }
              });
            },
            function (err) {
              console.log('Failed to transcode the video');
              console.log(err);
              upload.progress.complete.reject(err);
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
            upload.progress.complete.reject(err);
          });
        });
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
          nativeURL: vid.nativeURL,
          options: {
            headers: { 'Authorization': User.getToken()}
          },
          subarticle: subarticle
        };

        if(ENV.name === 'staging') {
          subarticle._file.container = 'instanews-videos-test-in';
          upload.container = 'instanews-videos-test-in';
        }

        if(vid.size < 500*1024*1024) {
          if( Platform.isAndroid()) {
            transcode(upload);
          } else {
            completeSetup(vid);
          }

          upload.complete = $q.defer();

          mediaItemsCount++;

          addUpload(upload);
        } else {
          console.log('Video is too large!');
          Platform.showAlert('Sorry but videos must be less than 500Mb');
        }
      } 

      function picture(photo) {
        if(photo.size < 50*1024*1024) {
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

          mediaItemsCount++;

          addUpload(upload);
        } else {
          console.log('Photo is too large!');
          Platform.showAlert('Sorry but photos must be less than 50Mb');
        }
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

      uploads.hasMediaItems = function () {
        return mediaItemsCount > 0;
      };

      //Capture video using the video camera
      uploads.captureVideo = function() {
        Navigate.ensureLogin( function () {
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
        });
      };

      //Get a photo(s) from the gallery
      uploads.getFromGallery = function() {
        Navigate.ensureLogin( function () {
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
        });
      };

      //Capture a photo using the camera and store it into the new article
      uploads.capturePicture = function() {
        Navigate.ensureLogin( function () {
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
        });
      };

      uploads.clear = function () {
        //TODO Do a proper cleanup of uploads. aka - actually cancel the upload
        uploadItems = [];
        uploads.notifyObservers();
      };

      uploads.getText = function (txt) {
        Navigate.ensureLogin( function () {
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
        });
      };

      return uploads;
    };

    return {
      moveToPending: moveToPending,
      getPending: getPending,
      isPending: isPending,
      findOrCreate: findOrCreate 
    };
  }
]);
