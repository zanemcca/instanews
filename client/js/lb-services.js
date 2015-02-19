(function(window, angular, undefined) {'use strict';

var urlBase = "/api";
var authHeader = 'authorization';

/**
 * @ngdoc overview
 * @name lbServices
 * @module
 * @description
 *
 * The `lbServices` module provides services for interacting with
 * the models exposed by the LoopBack server via the REST API.
 *
 */
var module = angular.module("lbServices", ['ngResource']);

/**
 * @ngdoc object
 * @name lbServices.Subarticle
 * @header lbServices.Subarticle
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Subarticle` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Subarticle",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/subarticles/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use Subarticle.parent() instead.
        "prototype$__get__parent": {
          url: urlBase + "/subarticles/:id/parent",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.journalist() instead.
        "prototype$__get__journalist": {
          url: urlBase + "/subarticles/:id/journalist",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.comments.findById() instead.
        "prototype$__findById__comments": {
          url: urlBase + "/subarticles/:id/comments/:fk",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.comments.destroyById() instead.
        "prototype$__destroyById__comments": {
          url: urlBase + "/subarticles/:id/comments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Subarticle.comments.updateById() instead.
        "prototype$__updateById__comments": {
          url: urlBase + "/subarticles/:id/comments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Subarticle.comments() instead.
        "prototype$__get__comments": {
          isArray: true,
          url: urlBase + "/subarticles/:id/comments",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.comments.create() instead.
        "prototype$__create__comments": {
          url: urlBase + "/subarticles/:id/comments",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.comments.count() instead.
        "prototype$__count__comments": {
          url: urlBase + "/subarticles/:id/comments/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#create
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/subarticles",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#upsert
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/subarticles",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#findById
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Find a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/subarticles/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#findOne
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, orderBy, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/subarticles/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#deleteById
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/subarticles/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#count
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Count instances of the model matched by where from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        "count": {
          url: urlBase + "/subarticles/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$updateAttributes
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/subarticles/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$upvote
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method does not accept any data. Supply an empty object.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `status` – `{string=}` -
         */
        "prototype$upvote": {
          url: urlBase + "/subarticles/:id/upvote",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$downvote
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method does not accept any data. Supply an empty object.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `status` – `{string=}` -
         */
        "prototype$downvote": {
          url: urlBase + "/subarticles/:id/downvote",
          method: "POST"
        },

        // INTERNAL. Use Article.subarticles.findById() instead.
        "::findById::article::subarticles": {
          url: urlBase + "/articles/:id/subarticles/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.subarticles.destroyById() instead.
        "::destroyById::article::subarticles": {
          url: urlBase + "/articles/:id/subarticles/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.subarticles.updateById() instead.
        "::updateById::article::subarticles": {
          url: urlBase + "/articles/:id/subarticles/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Article.subarticles() instead.
        "::get::article::subarticles": {
          isArray: true,
          url: urlBase + "/articles/:id/subarticles",
          method: "GET"
        },

        // INTERNAL. Use Article.subarticles.create() instead.
        "::create::article::subarticles": {
          url: urlBase + "/articles/:id/subarticles",
          method: "POST"
        },

        // INTERNAL. Use Article.subarticles.count() instead.
        "::count::article::subarticles": {
          url: urlBase + "/articles/:id/subarticles/count",
          method: "GET"
        },

        // INTERNAL. Use Journalist.articles.findById() instead.
        "::findById::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.articles.destroyById() instead.
        "::destroyById::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.articles.updateById() instead.
        "::updateById::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.articles() instead.
        "::get::journalist::articles": {
          isArray: true,
          url: urlBase + "/journalists/:id/articles",
          method: "GET"
        },

        // INTERNAL. Use Journalist.articles.create() instead.
        "::create::journalist::articles": {
          url: urlBase + "/journalists/:id/articles",
          method: "POST"
        },

        // INTERNAL. Use Journalist.articles.count() instead.
        "::count::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.Subarticle#updateOrCreate
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#destroyById
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#removeById
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.Subarticle#modelName
    * @propertyOf lbServices.Subarticle
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Subarticle`.
    */
    R.modelName = "Subarticle";


        /**
         * @ngdoc method
         * @name lbServices.Subarticle#parent
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Fetches belongsTo relation parent
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `refresh` – `{boolean=}` -
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R.parent = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::get::subarticle::parent"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#journalist
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Fetches belongsTo relation journalist
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `refresh` – `{boolean=}` -
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        R.journalist = function() {
          var TargetResource = $injector.get("Journalist");
          var action = TargetResource["::get::subarticle::journalist"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Subarticle.comments
     * @header lbServices.Subarticle.comments
     * @object
     * @description
     *
     * The object `Subarticle.comments` groups methods
     * manipulating `Comment` instances related to `Subarticle`.
     *
     * Call {@link lbServices.Subarticle#comments Subarticle.comments()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Subarticle#comments
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Queries comments of subarticle.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` -
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::get::subarticle::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.comments#count
         * @methodOf lbServices.Subarticle.comments
         *
         * @description
         *
         * Counts comments of subarticle.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        R.comments.count = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::count::subarticle::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.comments#create
         * @methodOf lbServices.Subarticle.comments
         *
         * @description
         *
         * Creates a new instance in comments of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.create = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::create::subarticle::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.comments#destroyById
         * @methodOf lbServices.Subarticle.comments
         *
         * @description
         *
         * Delete a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.comments.destroyById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::destroyById::subarticle::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.comments#findById
         * @methodOf lbServices.Subarticle.comments
         *
         * @description
         *
         * Find a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.findById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::findById::subarticle::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.comments#updateById
         * @methodOf lbServices.Subarticle.comments
         *
         * @description
         *
         * Update a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.updateById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::updateById::subarticle::comments"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.Article
 * @header lbServices.Article
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Article` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Article",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/articles/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use Article.subarticles.findById() instead.
        "prototype$__findById__subarticles": {
          url: urlBase + "/articles/:id/subarticles/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.subarticles.destroyById() instead.
        "prototype$__destroyById__subarticles": {
          url: urlBase + "/articles/:id/subarticles/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.subarticles.updateById() instead.
        "prototype$__updateById__subarticles": {
          url: urlBase + "/articles/:id/subarticles/:fk",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#prototype$__get__votes
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Fetches hasOne relation votes
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `refresh` – `{boolean=}` -
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "prototype$__get__votes": {
          url: urlBase + "/articles/:id/votes",
          method: "GET"
        },

        // INTERNAL. Use Article.journalists.findById() instead.
        "prototype$__findById__journalists": {
          url: urlBase + "/articles/:id/journalists/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.comments.findById() instead.
        "prototype$__findById__comments": {
          url: urlBase + "/articles/:id/comments/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.comments.destroyById() instead.
        "prototype$__destroyById__comments": {
          url: urlBase + "/articles/:id/comments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.comments.updateById() instead.
        "prototype$__updateById__comments": {
          url: urlBase + "/articles/:id/comments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Article.subarticles() instead.
        "prototype$__get__subarticles": {
          isArray: true,
          url: urlBase + "/articles/:id/subarticles",
          method: "GET"
        },

        // INTERNAL. Use Article.subarticles.create() instead.
        "prototype$__create__subarticles": {
          url: urlBase + "/articles/:id/subarticles",
          method: "POST"
        },

        // INTERNAL. Use Article.subarticles.count() instead.
        "prototype$__count__subarticles": {
          url: urlBase + "/articles/:id/subarticles/count",
          method: "GET"
        },

        // INTERNAL. Use Article.journalists() instead.
        "prototype$__get__journalists": {
          isArray: true,
          url: urlBase + "/articles/:id/journalists",
          method: "GET"
        },

        // INTERNAL. Use Article.journalists.count() instead.
        "prototype$__count__journalists": {
          url: urlBase + "/articles/:id/journalists/count",
          method: "GET"
        },

        // INTERNAL. Use Article.comments() instead.
        "prototype$__get__comments": {
          isArray: true,
          url: urlBase + "/articles/:id/comments",
          method: "GET"
        },

        // INTERNAL. Use Article.comments.create() instead.
        "prototype$__create__comments": {
          url: urlBase + "/articles/:id/comments",
          method: "POST"
        },

        // INTERNAL. Use Article.comments.count() instead.
        "prototype$__count__comments": {
          url: urlBase + "/articles/:id/comments/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#create
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/articles",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#upsert
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/articles",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#findById
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Find a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/articles/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#find
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, orderBy, offset, and limit
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/articles",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#findOne
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, orderBy, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/articles/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#deleteById
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/articles/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#count
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Count instances of the model matched by where from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        "count": {
          url: urlBase + "/articles/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#prototype$updateAttributes
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/articles/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#prototype$upvote
         * @methodOf lbServices.Article
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method does not accept any data. Supply an empty object.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `status` – `{string=}` -
         */
        "prototype$upvote": {
          url: urlBase + "/articles/:id/upvote",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#prototype$downvote
         * @methodOf lbServices.Article
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method does not accept any data. Supply an empty object.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `status` – `{string=}` -
         */
        "prototype$downvote": {
          url: urlBase + "/articles/:id/downvote",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.parent() instead.
        "::get::subarticle::parent": {
          url: urlBase + "/subarticles/:id/parent",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.Article#updateOrCreate
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.Article#destroyById
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.Article#removeById
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.Article#modelName
    * @propertyOf lbServices.Article
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Article`.
    */
    R.modelName = "Article";

    /**
     * @ngdoc object
     * @name lbServices.Article.subarticles
     * @header lbServices.Article.subarticles
     * @object
     * @description
     *
     * The object `Article.subarticles` groups methods
     * manipulating `Subarticle` instances related to `Article`.
     *
     * Call {@link lbServices.Article#subarticles Article.subarticles()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Article#subarticles
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Queries subarticles of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` -
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.subarticles = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::get::article::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.subarticles#count
         * @methodOf lbServices.Article.subarticles
         *
         * @description
         *
         * Counts subarticles of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        R.subarticles.count = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::count::article::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.subarticles#create
         * @methodOf lbServices.Article.subarticles
         *
         * @description
         *
         * Creates a new instance in subarticles of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.subarticles.create = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::create::article::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.subarticles#destroyById
         * @methodOf lbServices.Article.subarticles
         *
         * @description
         *
         * Delete a related item by id for subarticles
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for subarticles
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.subarticles.destroyById = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::destroyById::article::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.subarticles#findById
         * @methodOf lbServices.Article.subarticles
         *
         * @description
         *
         * Find a related item by id for subarticles
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for subarticles
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.subarticles.findById = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::findById::article::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.subarticles#updateById
         * @methodOf lbServices.Article.subarticles
         *
         * @description
         *
         * Update a related item by id for subarticles
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for subarticles
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.subarticles.updateById = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::updateById::article::subarticles"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Article.journalists
     * @header lbServices.Article.journalists
     * @object
     * @description
     *
     * The object `Article.journalists` groups methods
     * manipulating `Journalist` instances related to `Article`.
     *
     * Call {@link lbServices.Article#journalists Article.journalists()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Article#journalists
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Queries journalists of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` -
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        R.journalists = function() {
          var TargetResource = $injector.get("Journalist");
          var action = TargetResource["::get::article::journalists"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.journalists#count
         * @methodOf lbServices.Article.journalists
         *
         * @description
         *
         * Counts journalists of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        R.journalists.count = function() {
          var TargetResource = $injector.get("Journalist");
          var action = TargetResource["::count::article::journalists"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.journalists#findById
         * @methodOf lbServices.Article.journalists
         *
         * @description
         *
         * Find a related item by id for journalists
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for journalists
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        R.journalists.findById = function() {
          var TargetResource = $injector.get("Journalist");
          var action = TargetResource["::findById::article::journalists"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Article.comments
     * @header lbServices.Article.comments
     * @object
     * @description
     *
     * The object `Article.comments` groups methods
     * manipulating `Comment` instances related to `Article`.
     *
     * Call {@link lbServices.Article#comments Article.comments()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Article#comments
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Queries comments of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` -
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::get::article::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.comments#count
         * @methodOf lbServices.Article.comments
         *
         * @description
         *
         * Counts comments of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        R.comments.count = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::count::article::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.comments#create
         * @methodOf lbServices.Article.comments
         *
         * @description
         *
         * Creates a new instance in comments of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.create = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::create::article::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.comments#destroyById
         * @methodOf lbServices.Article.comments
         *
         * @description
         *
         * Delete a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.comments.destroyById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::destroyById::article::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.comments#findById
         * @methodOf lbServices.Article.comments
         *
         * @description
         *
         * Find a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.findById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::findById::article::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.comments#updateById
         * @methodOf lbServices.Article.comments
         *
         * @description
         *
         * Update a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.updateById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::updateById::article::comments"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.Journalist
 * @header lbServices.Journalist
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Journalist` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Journalist",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/journalists/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use Journalist.articles.findById() instead.
        "prototype$__findById__articles": {
          url: urlBase + "/journalists/:id/articles/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.articles.destroyById() instead.
        "prototype$__destroyById__articles": {
          url: urlBase + "/journalists/:id/articles/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.articles.updateById() instead.
        "prototype$__updateById__articles": {
          url: urlBase + "/journalists/:id/articles/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.articles() instead.
        "prototype$__get__articles": {
          isArray: true,
          url: urlBase + "/journalists/:id/articles",
          method: "GET"
        },

        // INTERNAL. Use Journalist.articles.create() instead.
        "prototype$__create__articles": {
          url: urlBase + "/journalists/:id/articles",
          method: "POST"
        },

        // INTERNAL. Use Journalist.articles.count() instead.
        "prototype$__count__articles": {
          url: urlBase + "/journalists/:id/articles/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#create
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/journalists",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#upsert
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/journalists",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#findById
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Find a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/journalists/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#find
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, orderBy, offset, and limit
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/journalists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#findOne
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, orderBy, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/journalists/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#deleteById
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/journalists/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#prototype$updateAttributes
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/journalists/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#login
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Login a user with username/email and password
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `include` – `{string=}` - Related objects to include in the response. See the description of return value for more details.
         *   Default value: `user`.
         *
         *  - `rememberMe` - `boolean` - Whether the authentication credentials
         *     should be remembered in localStorage across app/browser restarts.
         *     Default: `true`.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * The response body contains properties of the AccessToken created on login.
         * Depending on the value of `include` parameter, the body may contain additional properties:
         *
         *   - `user` - `{User}` - Data of the currently logged in user. (`include=user`)
         *
         *
         */
        "login": {
          params: {
            include: "user"
          },
          interceptor: {
            response: function(response) {
              var accessToken = response.data;
              LoopBackAuth.setUser(accessToken.id, accessToken.userId, accessToken.user);
              LoopBackAuth.rememberMe = response.config.params.rememberMe !== false;
              LoopBackAuth.save();
              return response.resource;
            }
          },
          url: urlBase + "/journalists/login",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#logout
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Logout a user with access token
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         *  - `access_token` – `{string}` - Do not supply this argument, it is automatically extracted from request headers.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "logout": {
          interceptor: {
            response: function(response) {
              LoopBackAuth.clearUser();
              LoopBackAuth.clearStorage();
              return response.resource;
            }
          },
          url: urlBase + "/journalists/logout",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#confirm
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Confirm a user registration with email verification token
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `uid` – `{string}` -
         *
         *  - `token` – `{string}` -
         *
         *  - `redirect` – `{string}` -
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "confirm": {
          url: urlBase + "/journalists/confirm",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#resetPassword
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Reset password for a user with email
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "resetPassword": {
          url: urlBase + "/journalists/reset",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.journalist() instead.
        "::get::subarticle::journalist": {
          url: urlBase + "/subarticles/:id/journalist",
          method: "GET"
        },

        // INTERNAL. Use Article.journalists.findById() instead.
        "::findById::article::journalists": {
          url: urlBase + "/articles/:id/journalists/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.journalists() instead.
        "::get::article::journalists": {
          isArray: true,
          url: urlBase + "/articles/:id/journalists",
          method: "GET"
        },

        // INTERNAL. Use Article.journalists.count() instead.
        "::count::article::journalists": {
          url: urlBase + "/articles/:id/journalists/count",
          method: "GET"
        },

        // INTERNAL. Use Comment.journalist() instead.
        "::get::comment::journalist": {
          url: urlBase + "/comments/:id/journalist",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#getCurrent
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Get data of the currently logged user. Fail with HTTP result 401
         * when there is no user logged in.
         *
         * @param {function(Object,Object)=} successCb
         *    Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *    `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         */
        "getCurrent": {
           url: urlBase + "/journalists" + "/:id",
           method: "GET",
           params: {
             id: function() {
              var id = LoopBackAuth.currentUserId;
              if (id == null) id = '__anonymous__';
              return id;
            },
          },
          interceptor: {
            response: function(response) {
              LoopBackAuth.currentUserData = response.data;
              return response.resource;
            }
          },
          __isGetCurrentUser__ : true
        }
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.Journalist#updateOrCreate
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.Journalist#destroyById
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.Journalist#removeById
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.Journalist#getCachedCurrent
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Get data of the currently logged user that was returned by the last
         * call to {@link lbServices.Journalist#login} or
         * {@link lbServices.Journalist#getCurrent}. Return null when there
         * is no user logged in or the data of the current user were not fetched
         * yet.
         *
         * @returns {Object} A Journalist instance.
         */
        R.getCachedCurrent = function() {
          var data = LoopBackAuth.currentUserData;
          return data ? new R(data) : null;
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist#isAuthenticated
         * @methodOf lbServices.Journalist
         *
         * @returns {boolean} True if the current user is authenticated (logged in).
         */
        R.isAuthenticated = function() {
          return this.getCurrentId() != null;
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist#getCurrentId
         * @methodOf lbServices.Journalist
         *
         * @returns {Object} Id of the currently logged-in user or null.
         */
        R.getCurrentId = function() {
          return LoopBackAuth.currentUserId;
        };

    /**
    * @ngdoc property
    * @name lbServices.Journalist#modelName
    * @propertyOf lbServices.Journalist
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Journalist`.
    */
    R.modelName = "Journalist";

    /**
     * @ngdoc object
     * @name lbServices.Journalist.articles
     * @header lbServices.Journalist.articles
     * @object
     * @description
     *
     * The object `Journalist.articles` groups methods
     * manipulating `Subarticle` instances related to `Journalist`.
     *
     * Call {@link lbServices.Journalist#articles Journalist.articles()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Journalist#articles
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Queries articles of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         *  - `filter` – `{object=}` -
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.articles = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::get::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#count
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Counts articles of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        R.articles.count = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::count::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#create
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Creates a new instance in articles of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.articles.create = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::create::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#destroyById
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Delete a related item by id for articles
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         *  - `fk` – `{*}` - Foreign key for articles
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.articles.destroyById = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::destroyById::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#findById
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Find a related item by id for articles
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         *  - `fk` – `{*}` - Foreign key for articles
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.articles.findById = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::findById::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#updateById
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Update a related item by id for articles
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - User id
         *
         *  - `fk` – `{*}` - Foreign key for articles
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        R.articles.updateById = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::updateById::journalist::articles"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.Comment
 * @header lbServices.Comment
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Comment` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Comment",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/comments/:id",
      { 'id': '@id' },
      {

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$__get__votes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Fetches hasOne relation votes
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `refresh` – `{boolean=}` -
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        "prototype$__get__votes": {
          url: urlBase + "/comments/:id/votes",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$__create__votes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Creates a new instance in votes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        "prototype$__create__votes": {
          url: urlBase + "/comments/:id/votes",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$__update__votes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Update votes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        "prototype$__update__votes": {
          url: urlBase + "/comments/:id/votes",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$__destroy__votes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Deletes votes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "prototype$__destroy__votes": {
          url: urlBase + "/comments/:id/votes",
          method: "DELETE"
        },

        // INTERNAL. Use Comment.comments.findById() instead.
        "prototype$__findById__comments": {
          url: urlBase + "/comments/:id/comments/:fk",
          method: "GET"
        },

        // INTERNAL. Use Comment.comments.destroyById() instead.
        "prototype$__destroyById__comments": {
          url: urlBase + "/comments/:id/comments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Comment.comments.updateById() instead.
        "prototype$__updateById__comments": {
          url: urlBase + "/comments/:id/comments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Comment.journalist() instead.
        "prototype$__get__journalist": {
          url: urlBase + "/comments/:id/journalist",
          method: "GET"
        },

        // INTERNAL. Use Comment.comments() instead.
        "prototype$__get__comments": {
          isArray: true,
          url: urlBase + "/comments/:id/comments",
          method: "GET"
        },

        // INTERNAL. Use Comment.comments.create() instead.
        "prototype$__create__comments": {
          url: urlBase + "/comments/:id/comments",
          method: "POST"
        },

        // INTERNAL. Use Comment.comments.count() instead.
        "prototype$__count__comments": {
          url: urlBase + "/comments/:id/comments/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#findOne
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, orderBy, offset, and limit
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/comments/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#deleteById
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/comments/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#count
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Count instances of the model matched by where from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        "count": {
          url: urlBase + "/comments/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$updateAttributes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/comments/:id",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$upvote
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method does not accept any data. Supply an empty object.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `status` – `{string=}` -
         */
        "prototype$upvote": {
          url: urlBase + "/comments/:id/upvote",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#prototype$downvote
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method does not accept any data. Supply an empty object.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `status` – `{string=}` -
         */
        "prototype$downvote": {
          url: urlBase + "/comments/:id/downvote",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.comments.findById() instead.
        "::findById::subarticle::comments": {
          url: urlBase + "/subarticles/:id/comments/:fk",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.comments.destroyById() instead.
        "::destroyById::subarticle::comments": {
          url: urlBase + "/subarticles/:id/comments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Subarticle.comments.updateById() instead.
        "::updateById::subarticle::comments": {
          url: urlBase + "/subarticles/:id/comments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Subarticle.comments() instead.
        "::get::subarticle::comments": {
          isArray: true,
          url: urlBase + "/subarticles/:id/comments",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.comments.create() instead.
        "::create::subarticle::comments": {
          url: urlBase + "/subarticles/:id/comments",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.comments.count() instead.
        "::count::subarticle::comments": {
          url: urlBase + "/subarticles/:id/comments/count",
          method: "GET"
        },

        // INTERNAL. Use Article.comments.findById() instead.
        "::findById::article::comments": {
          url: urlBase + "/articles/:id/comments/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.comments.destroyById() instead.
        "::destroyById::article::comments": {
          url: urlBase + "/articles/:id/comments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.comments.updateById() instead.
        "::updateById::article::comments": {
          url: urlBase + "/articles/:id/comments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Article.comments() instead.
        "::get::article::comments": {
          isArray: true,
          url: urlBase + "/articles/:id/comments",
          method: "GET"
        },

        // INTERNAL. Use Article.comments.create() instead.
        "::create::article::comments": {
          url: urlBase + "/articles/:id/comments",
          method: "POST"
        },

        // INTERNAL. Use Article.comments.count() instead.
        "::count::article::comments": {
          url: urlBase + "/articles/:id/comments/count",
          method: "GET"
        },

        // INTERNAL. Use Comment.comments.findById() instead.
        "::findById::comment::comments": {
          url: urlBase + "/comments/:id/comments/:fk",
          method: "GET"
        },

        // INTERNAL. Use Comment.comments.destroyById() instead.
        "::destroyById::comment::comments": {
          url: urlBase + "/comments/:id/comments/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Comment.comments.updateById() instead.
        "::updateById::comment::comments": {
          url: urlBase + "/comments/:id/comments/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Comment.comments() instead.
        "::get::comment::comments": {
          isArray: true,
          url: urlBase + "/comments/:id/comments",
          method: "GET"
        },

        // INTERNAL. Use Comment.comments.create() instead.
        "::create::comment::comments": {
          url: urlBase + "/comments/:id/comments",
          method: "POST"
        },

        // INTERNAL. Use Comment.comments.count() instead.
        "::count::comment::comments": {
          url: urlBase + "/comments/:id/comments/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.Comment#destroyById
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["destroyById"] = R["deleteById"];

        /**
         * @ngdoc method
         * @name lbServices.Comment#removeById
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Delete a model instance by id from the data source
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R["removeById"] = R["deleteById"];


    /**
    * @ngdoc property
    * @name lbServices.Comment#modelName
    * @propertyOf lbServices.Comment
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Comment`.
    */
    R.modelName = "Comment";

    /**
     * @ngdoc object
     * @name lbServices.Comment.comments
     * @header lbServices.Comment.comments
     * @object
     * @description
     *
     * The object `Comment.comments` groups methods
     * manipulating `Comment` instances related to `Comment`.
     *
     * Call {@link lbServices.Comment#comments Comment.comments()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Comment#comments
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Queries comments of comment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `filter` – `{object=}` -
         *
         * @param {function(Array.<Object>,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Array.<Object>} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::get::comment::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.comments#count
         * @methodOf lbServices.Comment.comments
         *
         * @description
         *
         * Counts comments of comment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `where` – `{object=}` - Criteria to match model instances
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * Data properties:
         *
         *  - `count` – `{number=}` -
         */
        R.comments.count = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::count::comment::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.comments#create
         * @methodOf lbServices.Comment.comments
         *
         * @description
         *
         * Creates a new instance in comments of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.create = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::create::comment::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.comments#destroyById
         * @methodOf lbServices.Comment.comments
         *
         * @description
         *
         * Delete a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * This method returns no data.
         */
        R.comments.destroyById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::destroyById::comment::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.comments#findById
         * @methodOf lbServices.Comment.comments
         *
         * @description
         *
         * Find a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.findById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::findById::comment::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.comments#updateById
         * @methodOf lbServices.Comment.comments
         *
         * @description
         *
         * Update a related item by id for comments
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `fk` – `{*}` - Foreign key for comments
         *
         * @param {Object} postData Request data.
         *
         * This method expects a subset of model properties as request parameters.
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        R.comments.updateById = function() {
          var TargetResource = $injector.get("Comment");
          var action = TargetResource["::updateById::comment::comments"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment#journalist
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Fetches belongsTo relation journalist
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - PersistedModel id
         *
         *  - `refresh` – `{boolean=}` -
         *
         * @param {function(Object,Object)=} successCb
         *   Success callback with two arguments: `value`, `responseHeaders`.
         *
         * @param {function(Object)=} errorCb Error callback with one argument:
         *   `httpResponse`.
         *
         * @returns {Object} An empty reference that will be
         *   populated with the actual data once the response is returned
         *   from the server.
         *
         * <em>
         * (The remote method definition does not provide any description.
         * This usually means the response is a `Journalist` object.)
         * </em>
         */
        R.journalist = function() {
          var TargetResource = $injector.get("Journalist");
          var action = TargetResource["::get::comment::journalist"];
          return action.apply(R, arguments);
        };

    return R;
  }]);


module
  .factory('LoopBackAuth', function() {
    var props = ['accessTokenId', 'currentUserId'];
    var propsPrefix = '$LoopBack$';

    function LoopBackAuth() {
      var self = this;
      props.forEach(function(name) {
        self[name] = load(name);
      });
      this.rememberMe = undefined;
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.save = function() {
      var self = this;
      var storage = this.rememberMe ? localStorage : sessionStorage;
      props.forEach(function(name) {
        save(storage, name, self[name]);
      });
    };

    LoopBackAuth.prototype.setUser = function(accessTokenId, userId, userData) {
      this.accessTokenId = accessTokenId;
      this.currentUserId = userId;
      this.currentUserData = userData;
    }

    LoopBackAuth.prototype.clearUser = function() {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.clearStorage = function() {
      props.forEach(function(name) {
        save(sessionStorage, name, null);
        save(localStorage, name, null);
      });
    };

    return new LoopBackAuth();

    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    function save(storage, name, value) {
      var key = propsPrefix + name;
      if (value == null) value = '';
      storage[key] = value;
    }

    function load(name) {
      var key = propsPrefix + name;
      return localStorage[key] || sessionStorage[key] || null;
    }
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
  }])
  .factory('LoopBackAuthRequestInterceptor', [ '$q', 'LoopBackAuth',
    function($q, LoopBackAuth) {
      return {
        'request': function(config) {

          // filter out non urlBase requests
          if (config.url.substr(0, urlBase.length) !== urlBase) {
            return config;
          }

          if (LoopBackAuth.accessTokenId) {
            config.headers[authHeader] = LoopBackAuth.accessTokenId;
          } else if (config.__isGetCurrentUser__) {
            // Return a stub 401 error for User.getCurrent() when
            // there is no user logged in
            var res = {
              body: { error: { status: 401 } },
              status: 401,
              config: config,
              headers: function() { return undefined; }
            };
            return $q.reject(res);
          }
          return config || $q.when(config);
        }
      }
    }])

  /**
   * @ngdoc object
   * @name lbServices.LoopBackResourceProvider
   * @header lbServices.LoopBackResourceProvider
   * @description
   * Use `LoopBackResourceProvider` to change the global configuration
   * settings used by all models. Note that the provider is available
   * to Configuration Blocks only, see
   * {@link https://docs.angularjs.org/guide/module#module-loading-dependencies Module Loading & Dependencies}
   * for more details.
   *
   * ## Example
   *
   * ```js
   * angular.module('app')
   *  .config(function(LoopBackResourceProvider) {
   *     LoopBackResourceProvider.setAuthHeader('X-Access-Token');
   *  });
   * ```
   */
  .provider('LoopBackResource', function LoopBackResourceProvider() {
    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} header The header name to use, e.g. `X-Access-Token`
     * @description
     * Configure the REST transport to use a different header for sending
     * the authentication token. It is sent in the `Authorization` header
     * by default.
     */
    this.setAuthHeader = function(header) {
      authHeader = header;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} url The URL to use, e.g. `/api` or `//example.com/api`.
     * @description
     * Change the URL of the REST API server. By default, the URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.setUrlBase = function(url) {
      urlBase = url;
    };

    this.$get = ['$resource', function($resource) {
      return function(url, params, actions) {
        var resource = $resource(url, params, actions);

        // Angular always calls POST on $save()
        // This hack is based on
        // http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
        resource.prototype.$save = function(success, error) {
          // Fortunately, LoopBack provides a convenient `upsert` method
          // that exactly fits our needs.
          var result = resource.upsert.call(this, {}, this, success, error);
          return result.$promise || result;
        };
        return resource;
      };
    }];
  });

})(window, window.angular);
