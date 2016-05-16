
'use strict';

var app = angular.module('instanews.service.shares', ['ionic', 'ngResource']);

app.service('Shares', [
  'User',
  'Journalist',
  'list',
  function(
    User,
    Journalist,
    list
  ){

    var filter = {
      limit: 1000000,
      order: 'id DESC'
    };

    //Order by id descending
    var sortingFunction = function(a,b) {
      if(a.clickableId < b.clickableId) {
        return -1;
      } else if(a.clickableId > b.clickableId) {
        return 1;
      } else {
        return 0;
      }
    };

    var spec = {
      find: Journalist.shares,
      sortingFunction: sortingFunction,
      options: {
        filter: filter
      }
    };

    // Create a list for articles within view
    var shares = list(spec);

    var user = User.get();

    var updateShares = function () {
      var usr = User.get();
      // If the user changes in any way then we explicitely clear the shares
      if((!user || !usr || usr.userId !== user.userId)) {
        shares.clear();
        user = usr;
      }

      // Only reload if we have a user
      if(usr) {
        spec.options.id = usr.userId;
        shares.reload();
      }
    };

    var findShares = function (Shares, click) {
      var shares = Shares.get();
      //Binary search over the sorted list of shares (ordered by clickableId)
      var max = shares.length - 1;
      var min = 0;
      var pivot;
      while(min <= max) { 
        pivot = Math.floor((max + min)/2);
        if(shares[pivot].clickableId === click.id) {
          if(shares[pivot]. clickableType === click.modelName) {
            return [shares[pivot]];
          } else {
            console.log('Error: votableId should be globablly unique');
            break;
          }
        } else if(shares[pivot].clickableId < click.id) {
          min = pivot + 1;
        } else {
          max = pivot - 1;
        }
      }

      return [];
    };

    var remove = function(Shares, click) {
      Shares.remove(function(share) {
        return (share.clickableType === click.modelName &&
                share.clickableId === click.id);
      });
    };

    User.registerObserver(updateShares);

    updateShares();

    var that = {
      find: findShares.bind(findShares, shares),
      registerObserver: shares.registerObserver,
      add: shares.add,
      reload: shares.reload,
      remove: remove.bind(remove, shares)
    };

    return that;
  }
]);
