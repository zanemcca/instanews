(function(window, angular, undefined) {'use strict';

/* jshint ignore:start */
var urlBase = ('https:' === document.location.protocol ?
   /*'https://172.20.10.9:3443/api' :
   'http://172.20.10.9:3000/api');
*/
   "https://192.168.1.2:3443/api" :
   "http://192.168.1.2:3000/api");
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

        // INTERNAL. Use Subarticle.article() instead.
        "prototype$__get__article": {
          url: urlBase + "/subarticles/:id/article",
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

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$__get__file
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Fetches hasOne relation file.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `Subarticle` object.)
         * </em>
         */
        "prototype$__get__file": {
          url: urlBase + "/subarticles/:id/file",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$__create__file
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Creates a new instance in file of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        "prototype$__create__file": {
          url: urlBase + "/subarticles/:id/file",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$__update__file
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Update file of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        "prototype$__update__file": {
          url: urlBase + "/subarticles/:id/file",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#prototype$__destroy__file
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Deletes file of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        "prototype$__destroy__file": {
          url: urlBase + "/subarticles/:id/file",
          method: "DELETE"
        },

        // INTERNAL. Use Subarticle.upVotes.findById() instead.
        "prototype$__findById__upVotes": {
          url: urlBase + "/subarticles/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.upVotes.destroyById() instead.
        "prototype$__destroyById__upVotes": {
          url: urlBase + "/subarticles/:id/upVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Subarticle.downVotes.findById() instead.
        "prototype$__findById__downVotes": {
          url: urlBase + "/subarticles/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.downVotes.destroyById() instead.
        "prototype$__destroyById__downVotes": {
          url: urlBase + "/subarticles/:id/downVotes/:fk",
          method: "DELETE"
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

        // INTERNAL. Use Subarticle.upVotes() instead.
        "prototype$__get__upVotes": {
          isArray: true,
          url: urlBase + "/subarticles/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.upVotes.create() instead.
        "prototype$__create__upVotes": {
          url: urlBase + "/subarticles/:id/upVotes",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.upVotes.count() instead.
        "prototype$__count__upVotes": {
          url: urlBase + "/subarticles/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.downVotes() instead.
        "prototype$__get__downVotes": {
          isArray: true,
          url: urlBase + "/subarticles/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.downVotes.create() instead.
        "prototype$__create__downVotes": {
          url: urlBase + "/subarticles/:id/downVotes",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.downVotes.count() instead.
        "prototype$__count__downVotes": {
          url: urlBase + "/subarticles/:id/downVotes/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#create
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * Update an existing model instance or insert a new one into the data source.
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
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * Delete a model instance by id from the data source.
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
         * Count instances of the model matched by where from the data source.
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
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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

        // INTERNAL. Use Journalist.subarticles.findById() instead.
        "::findById::journalist::subarticles": {
          url: urlBase + "/journalists/:id/subarticles/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.subarticles.destroyById() instead.
        "::destroyById::journalist::subarticles": {
          url: urlBase + "/journalists/:id/subarticles/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.subarticles.updateById() instead.
        "::updateById::journalist::subarticles": {
          url: urlBase + "/journalists/:id/subarticles/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.subarticles() instead.
        "::get::journalist::subarticles": {
          isArray: true,
          url: urlBase + "/journalists/:id/subarticles",
          method: "GET"
        },

        // INTERNAL. Use Journalist.subarticles.create() instead.
        "::create::journalist::subarticles": {
          url: urlBase + "/journalists/:id/subarticles",
          method: "POST"
        },

        // INTERNAL. Use Journalist.subarticles.destroyAll() instead.
        "::delete::journalist::subarticles": {
          url: urlBase + "/journalists/:id/subarticles",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.subarticles.count() instead.
        "::count::journalist::subarticles": {
          url: urlBase + "/journalists/:id/subarticles/count",
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
         * Update an existing model instance or insert a new one into the data source.
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
         * Delete a model instance by id from the data source.
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
         * Delete a model instance by id from the data source.
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
         * @name lbServices.Subarticle#article
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Fetches belongsTo relation article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.article = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::get::subarticle::article"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle#journalist
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Fetches belongsTo relation journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         * Delete a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Find a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Update a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
    /**
     * @ngdoc object
     * @name lbServices.Subarticle.upVotes
     * @header lbServices.Subarticle.upVotes
     * @object
     * @description
     *
     * The object `Subarticle.upVotes` groups methods
     * manipulating `UpVote` instances related to `Subarticle`.
     *
     * Call {@link lbServices.Subarticle#upVotes Subarticle.upVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Subarticle#upVotes
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Queries upVotes of subarticle.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::get::subarticle::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.upVotes#count
         * @methodOf lbServices.Subarticle.upVotes
         *
         * @description
         *
         * Counts upVotes of subarticle.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.upVotes.count = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::count::subarticle::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.upVotes#create
         * @methodOf lbServices.Subarticle.upVotes
         *
         * @description
         *
         * Creates a new instance in upVotes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.create = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::create::subarticle::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.upVotes#destroyById
         * @methodOf lbServices.Subarticle.upVotes
         *
         * @description
         *
         * Delete a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
        R.upVotes.destroyById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::destroyById::subarticle::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.upVotes#findById
         * @methodOf lbServices.Subarticle.upVotes
         *
         * @description
         *
         * Find a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.findById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::findById::subarticle::upVotes"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Subarticle.downVotes
     * @header lbServices.Subarticle.downVotes
     * @object
     * @description
     *
     * The object `Subarticle.downVotes` groups methods
     * manipulating `DownVote` instances related to `Subarticle`.
     *
     * Call {@link lbServices.Subarticle#downVotes Subarticle.downVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Subarticle#downVotes
         * @methodOf lbServices.Subarticle
         *
         * @description
         *
         * Queries downVotes of subarticle.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::get::subarticle::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.downVotes#count
         * @methodOf lbServices.Subarticle.downVotes
         *
         * @description
         *
         * Counts downVotes of subarticle.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.downVotes.count = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::count::subarticle::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.downVotes#create
         * @methodOf lbServices.Subarticle.downVotes
         *
         * @description
         *
         * Creates a new instance in downVotes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.create = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::create::subarticle::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.downVotes#destroyById
         * @methodOf lbServices.Subarticle.downVotes
         *
         * @description
         *
         * Delete a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
        R.downVotes.destroyById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::destroyById::subarticle::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Subarticle.downVotes#findById
         * @methodOf lbServices.Subarticle.downVotes
         *
         * @description
         *
         * Find a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.findById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::findById::subarticle::downVotes"];
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

        // INTERNAL. Use Article.upVotes.findById() instead.
        "prototype$__findById__upVotes": {
          url: urlBase + "/articles/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.upVotes.destroyById() instead.
        "prototype$__destroyById__upVotes": {
          url: urlBase + "/articles/:id/upVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.downVotes.findById() instead.
        "prototype$__findById__downVotes": {
          url: urlBase + "/articles/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.downVotes.destroyById() instead.
        "prototype$__destroyById__downVotes": {
          url: urlBase + "/articles/:id/downVotes/:fk",
          method: "DELETE"
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

        // INTERNAL. Use Article.upVotes() instead.
        "prototype$__get__upVotes": {
          isArray: true,
          url: urlBase + "/articles/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Article.upVotes.create() instead.
        "prototype$__create__upVotes": {
          url: urlBase + "/articles/:id/upVotes",
          method: "POST"
        },

        // INTERNAL. Use Article.upVotes.count() instead.
        "prototype$__count__upVotes": {
          url: urlBase + "/articles/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Article.downVotes() instead.
        "prototype$__get__downVotes": {
          isArray: true,
          url: urlBase + "/articles/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Article.downVotes.create() instead.
        "prototype$__create__downVotes": {
          url: urlBase + "/articles/:id/downVotes",
          method: "POST"
        },

        // INTERNAL. Use Article.downVotes.count() instead.
        "prototype$__count__downVotes": {
          url: urlBase + "/articles/:id/downVotes/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Article#create
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * Update an existing model instance or insert a new one into the data source.
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
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * Delete a model instance by id from the data source.
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
         * Count instances of the model matched by where from the data source.
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
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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

        // INTERNAL. Use Subarticle.article() instead.
        "::get::subarticle::article": {
          url: urlBase + "/subarticles/:id/article",
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

        // INTERNAL. Use Journalist.articles.link() instead.
        "::link::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/rel/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.articles.unlink() instead.
        "::unlink::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/rel/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.articles.exists() instead.
        "::exists::journalist::articles": {
          url: urlBase + "/journalists/:id/articles/rel/:fk",
          method: "HEAD"
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
         * @name lbServices.Article#updateOrCreate
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * Delete a model instance by id from the data source.
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
         * Delete a model instance by id from the data source.
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         * Delete a related item by id for subarticles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Find a related item by id for subarticles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Update a related item by id for subarticles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         * Find a related item by id for journalists.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         * Delete a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Find a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Update a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
    /**
     * @ngdoc object
     * @name lbServices.Article.upVotes
     * @header lbServices.Article.upVotes
     * @object
     * @description
     *
     * The object `Article.upVotes` groups methods
     * manipulating `UpVote` instances related to `Article`.
     *
     * Call {@link lbServices.Article#upVotes Article.upVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Article#upVotes
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Queries upVotes of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::get::article::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.upVotes#count
         * @methodOf lbServices.Article.upVotes
         *
         * @description
         *
         * Counts upVotes of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.upVotes.count = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::count::article::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.upVotes#create
         * @methodOf lbServices.Article.upVotes
         *
         * @description
         *
         * Creates a new instance in upVotes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.create = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::create::article::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.upVotes#destroyById
         * @methodOf lbServices.Article.upVotes
         *
         * @description
         *
         * Delete a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
        R.upVotes.destroyById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::destroyById::article::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.upVotes#findById
         * @methodOf lbServices.Article.upVotes
         *
         * @description
         *
         * Find a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.findById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::findById::article::upVotes"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Article.downVotes
     * @header lbServices.Article.downVotes
     * @object
     * @description
     *
     * The object `Article.downVotes` groups methods
     * manipulating `DownVote` instances related to `Article`.
     *
     * Call {@link lbServices.Article#downVotes Article.downVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Article#downVotes
         * @methodOf lbServices.Article
         *
         * @description
         *
         * Queries downVotes of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::get::article::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.downVotes#count
         * @methodOf lbServices.Article.downVotes
         *
         * @description
         *
         * Counts downVotes of article.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.downVotes.count = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::count::article::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.downVotes#create
         * @methodOf lbServices.Article.downVotes
         *
         * @description
         *
         * Creates a new instance in downVotes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.create = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::create::article::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.downVotes#destroyById
         * @methodOf lbServices.Article.downVotes
         *
         * @description
         *
         * Delete a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
        R.downVotes.destroyById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::destroyById::article::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Article.downVotes#findById
         * @methodOf lbServices.Article.downVotes
         *
         * @description
         *
         * Find a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.findById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::findById::article::downVotes"];
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

        // INTERNAL. Use Journalist.articles.link() instead.
        "prototype$__link__articles": {
          url: urlBase + "/journalists/:id/articles/rel/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.articles.unlink() instead.
        "prototype$__unlink__articles": {
          url: urlBase + "/journalists/:id/articles/rel/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.articles.exists() instead.
        "prototype$__exists__articles": {
          url: urlBase + "/journalists/:id/articles/rel/:fk",
          method: "HEAD"
        },

        // INTERNAL. Use Journalist.subarticles.findById() instead.
        "prototype$__findById__subarticles": {
          url: urlBase + "/journalists/:id/subarticles/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.subarticles.destroyById() instead.
        "prototype$__destroyById__subarticles": {
          url: urlBase + "/journalists/:id/subarticles/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.subarticles.updateById() instead.
        "prototype$__updateById__subarticles": {
          url: urlBase + "/journalists/:id/subarticles/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.upVotes.findById() instead.
        "prototype$__findById__upVotes": {
          url: urlBase + "/journalists/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.downVotes.findById() instead.
        "prototype$__findById__downVotes": {
          url: urlBase + "/journalists/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.notifications.findById() instead.
        "prototype$__findById__notifications": {
          url: urlBase + "/journalists/:id/notifications/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.notifications.destroyById() instead.
        "prototype$__destroyById__notifications": {
          url: urlBase + "/journalists/:id/notifications/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.notifications.updateById() instead.
        "prototype$__updateById__notifications": {
          url: urlBase + "/journalists/:id/notifications/:fk",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#prototype$__create__accessTokens
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Creates a new instance in accessTokens of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        "prototype$__create__accessTokens": {
          url: urlBase + "/journalists/:id/accessTokens",
          method: "POST"
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

        // INTERNAL. Use Journalist.subarticles() instead.
        "prototype$__get__subarticles": {
          isArray: true,
          url: urlBase + "/journalists/:id/subarticles",
          method: "GET"
        },

        // INTERNAL. Use Journalist.subarticles.create() instead.
        "prototype$__create__subarticles": {
          url: urlBase + "/journalists/:id/subarticles",
          method: "POST"
        },

        // INTERNAL. Use Journalist.subarticles.destroyAll() instead.
        "prototype$__delete__subarticles": {
          url: urlBase + "/journalists/:id/subarticles",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.subarticles.count() instead.
        "prototype$__count__subarticles": {
          url: urlBase + "/journalists/:id/subarticles/count",
          method: "GET"
        },

        // INTERNAL. Use Journalist.upVotes() instead.
        "prototype$__get__upVotes": {
          isArray: true,
          url: urlBase + "/journalists/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Journalist.upVotes.count() instead.
        "prototype$__count__upVotes": {
          url: urlBase + "/journalists/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Journalist.downVotes() instead.
        "prototype$__get__downVotes": {
          isArray: true,
          url: urlBase + "/journalists/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Journalist.downVotes.count() instead.
        "prototype$__count__downVotes": {
          url: urlBase + "/journalists/:id/downVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Journalist.notifications() instead.
        "prototype$__get__notifications": {
          isArray: true,
          url: urlBase + "/journalists/:id/notifications",
          method: "GET"
        },

        // INTERNAL. Use Journalist.notifications.create() instead.
        "prototype$__create__notifications": {
          url: urlBase + "/journalists/:id/notifications",
          method: "POST"
        },

        // INTERNAL. Use Journalist.notifications.destroyAll() instead.
        "prototype$__delete__notifications": {
          url: urlBase + "/journalists/:id/notifications",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.notifications.count() instead.
        "prototype$__count__notifications": {
          url: urlBase + "/journalists/:id/notifications/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Journalist#create
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * Update an existing model instance or insert a new one into the data source.
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
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * Delete a model instance by id from the data source.
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
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * Login a user with username/email and password.
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
         *  - `redirect` – `{string=}` -
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

        // INTERNAL. Use UpVote.journalist() instead.
        "::get::upVote::journalist": {
          url: urlBase + "/upVotes/:id/journalist",
          method: "GET"
        },

        // INTERNAL. Use DownVote.journalist() instead.
        "::get::downVote::journalist": {
          url: urlBase + "/downVotes/:id/journalist",
          method: "GET"
        },

        // INTERNAL. Use Notification.journalist() instead.
        "::get::notification::journalist": {
          url: urlBase + "/notifications/:id/journalist",
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
         * Update an existing model instance or insert a new one into the data source.
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
         * Delete a model instance by id from the data source.
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
         * Delete a model instance by id from the data source.
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
     * manipulating `Article` instances related to `Journalist`.
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
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R.articles = function() {
          var TargetResource = $injector.get("Article");
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
         *  - `id` – `{*}` - voteUser id
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
          var TargetResource = $injector.get("Article");
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
         *  - `id` – `{*}` - voteUser id
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
        R.articles.create = function() {
          var TargetResource = $injector.get("Article");
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
         * Delete a related item by id for articles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::destroyById::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#exists
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Check the existence of articles relation to an item by id.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R.articles.exists = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::exists::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#findById
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Find a related item by id for articles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R.articles.findById = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::findById::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#link
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Add a related item by id for articles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R.articles.link = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::link::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#unlink
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Remove the articles relation to an item by id.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        R.articles.unlink = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::unlink::journalist::articles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.articles#updateById
         * @methodOf lbServices.Journalist.articles
         *
         * @description
         *
         * Update a related item by id for articles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Article` object.)
         * </em>
         */
        R.articles.updateById = function() {
          var TargetResource = $injector.get("Article");
          var action = TargetResource["::updateById::journalist::articles"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Journalist.subarticles
     * @header lbServices.Journalist.subarticles
     * @object
     * @description
     *
     * The object `Journalist.subarticles` groups methods
     * manipulating `Subarticle` instances related to `Journalist`.
     *
     * Call {@link lbServices.Journalist#subarticles Journalist.subarticles()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Journalist#subarticles
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Queries subarticles of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var action = TargetResource["::get::journalist::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.subarticles#count
         * @methodOf lbServices.Journalist.subarticles
         *
         * @description
         *
         * Counts subarticles of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var action = TargetResource["::count::journalist::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.subarticles#create
         * @methodOf lbServices.Journalist.subarticles
         *
         * @description
         *
         * Creates a new instance in subarticles of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var action = TargetResource["::create::journalist::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.subarticles#destroyAll
         * @methodOf lbServices.Journalist.subarticles
         *
         * @description
         *
         * Deletes all subarticles of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        R.subarticles.destroyAll = function() {
          var TargetResource = $injector.get("Subarticle");
          var action = TargetResource["::delete::journalist::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.subarticles#destroyById
         * @methodOf lbServices.Journalist.subarticles
         *
         * @description
         *
         * Delete a related item by id for subarticles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var action = TargetResource["::destroyById::journalist::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.subarticles#findById
         * @methodOf lbServices.Journalist.subarticles
         *
         * @description
         *
         * Find a related item by id for subarticles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var action = TargetResource["::findById::journalist::subarticles"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.subarticles#updateById
         * @methodOf lbServices.Journalist.subarticles
         *
         * @description
         *
         * Update a related item by id for subarticles.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
          var action = TargetResource["::updateById::journalist::subarticles"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Journalist.upVotes
     * @header lbServices.Journalist.upVotes
     * @object
     * @description
     *
     * The object `Journalist.upVotes` groups methods
     * manipulating `UpVote` instances related to `Journalist`.
     *
     * Call {@link lbServices.Journalist#upVotes Journalist.upVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Journalist#upVotes
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Queries upVotes of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::get::journalist::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.upVotes#count
         * @methodOf lbServices.Journalist.upVotes
         *
         * @description
         *
         * Counts upVotes of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        R.upVotes.count = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::count::journalist::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.upVotes#findById
         * @methodOf lbServices.Journalist.upVotes
         *
         * @description
         *
         * Find a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.findById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::findById::journalist::upVotes"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Journalist.downVotes
     * @header lbServices.Journalist.downVotes
     * @object
     * @description
     *
     * The object `Journalist.downVotes` groups methods
     * manipulating `DownVote` instances related to `Journalist`.
     *
     * Call {@link lbServices.Journalist#downVotes Journalist.downVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Journalist#downVotes
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Queries downVotes of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::get::journalist::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.downVotes#count
         * @methodOf lbServices.Journalist.downVotes
         *
         * @description
         *
         * Counts downVotes of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        R.downVotes.count = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::count::journalist::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.downVotes#findById
         * @methodOf lbServices.Journalist.downVotes
         *
         * @description
         *
         * Find a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.findById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::findById::journalist::downVotes"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Journalist.notifications
     * @header lbServices.Journalist.notifications
     * @object
     * @description
     *
     * The object `Journalist.notifications` groups methods
     * manipulating `Notification` instances related to `Journalist`.
     *
     * Call {@link lbServices.Journalist#notifications Journalist.notifications()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Journalist#notifications
         * @methodOf lbServices.Journalist
         *
         * @description
         *
         * Queries notifications of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        R.notifications = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::get::journalist::notifications"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.notifications#count
         * @methodOf lbServices.Journalist.notifications
         *
         * @description
         *
         * Counts notifications of journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        R.notifications.count = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::count::journalist::notifications"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.notifications#create
         * @methodOf lbServices.Journalist.notifications
         *
         * @description
         *
         * Creates a new instance in notifications of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        R.notifications.create = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::create::journalist::notifications"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.notifications#destroyAll
         * @methodOf lbServices.Journalist.notifications
         *
         * @description
         *
         * Deletes all notifications of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
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
        R.notifications.destroyAll = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::delete::journalist::notifications"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.notifications#destroyById
         * @methodOf lbServices.Journalist.notifications
         *
         * @description
         *
         * Delete a related item by id for notifications.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
         *
         *  - `fk` – `{*}` - Foreign key for notifications
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
        R.notifications.destroyById = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::destroyById::journalist::notifications"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.notifications#findById
         * @methodOf lbServices.Journalist.notifications
         *
         * @description
         *
         * Find a related item by id for notifications.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
         *
         *  - `fk` – `{*}` - Foreign key for notifications
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        R.notifications.findById = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::findById::journalist::notifications"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Journalist.notifications#updateById
         * @methodOf lbServices.Journalist.notifications
         *
         * @description
         *
         * Update a related item by id for notifications.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - voteUser id
         *
         *  - `fk` – `{*}` - Foreign key for notifications
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        R.notifications.updateById = function() {
          var TargetResource = $injector.get("Notification");
          var action = TargetResource["::updateById::journalist::notifications"];
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

        // INTERNAL. Use Comment.upVotes.findById() instead.
        "prototype$__findById__upVotes": {
          url: urlBase + "/comments/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Comment.upVotes.destroyById() instead.
        "prototype$__destroyById__upVotes": {
          url: urlBase + "/comments/:id/upVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Comment.downVotes.findById() instead.
        "prototype$__findById__downVotes": {
          url: urlBase + "/comments/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Comment.downVotes.destroyById() instead.
        "prototype$__destroyById__downVotes": {
          url: urlBase + "/comments/:id/downVotes/:fk",
          method: "DELETE"
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

        // INTERNAL. Use Comment.upVotes() instead.
        "prototype$__get__upVotes": {
          isArray: true,
          url: urlBase + "/comments/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Comment.upVotes.create() instead.
        "prototype$__create__upVotes": {
          url: urlBase + "/comments/:id/upVotes",
          method: "POST"
        },

        // INTERNAL. Use Comment.upVotes.count() instead.
        "prototype$__count__upVotes": {
          url: urlBase + "/comments/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Comment.downVotes() instead.
        "prototype$__get__downVotes": {
          isArray: true,
          url: urlBase + "/comments/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Comment.downVotes.create() instead.
        "prototype$__create__downVotes": {
          url: urlBase + "/comments/:id/downVotes",
          method: "POST"
        },

        // INTERNAL. Use Comment.downVotes.count() instead.
        "prototype$__count__downVotes": {
          url: urlBase + "/comments/:id/downVotes/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#create
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * This usually means the response is a `Comment` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/comments",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#findById
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
        "findById": {
          url: urlBase + "/comments/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#find
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
        "find": {
          isArray: true,
          url: urlBase + "/comments",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Comment#findOne
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * Delete a model instance by id from the data source.
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
         * Count instances of the model matched by where from the data source.
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
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Delete a model instance by id from the data source.
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
         * Delete a model instance by id from the data source.
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         *  - `id` – `{*}` - votes id
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
         * Delete a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Find a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Update a related item by id for comments.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * Fetches belongsTo relation journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
    /**
     * @ngdoc object
     * @name lbServices.Comment.upVotes
     * @header lbServices.Comment.upVotes
     * @object
     * @description
     *
     * The object `Comment.upVotes` groups methods
     * manipulating `UpVote` instances related to `Comment`.
     *
     * Call {@link lbServices.Comment#upVotes Comment.upVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Comment#upVotes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Queries upVotes of comment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::get::comment::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.upVotes#count
         * @methodOf lbServices.Comment.upVotes
         *
         * @description
         *
         * Counts upVotes of comment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.upVotes.count = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::count::comment::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.upVotes#create
         * @methodOf lbServices.Comment.upVotes
         *
         * @description
         *
         * Creates a new instance in upVotes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.create = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::create::comment::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.upVotes#destroyById
         * @methodOf lbServices.Comment.upVotes
         *
         * @description
         *
         * Delete a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
        R.upVotes.destroyById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::destroyById::comment::upVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.upVotes#findById
         * @methodOf lbServices.Comment.upVotes
         *
         * @description
         *
         * Find a related item by id for upVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for upVotes
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R.upVotes.findById = function() {
          var TargetResource = $injector.get("UpVote");
          var action = TargetResource["::findById::comment::upVotes"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Comment.downVotes
     * @header lbServices.Comment.downVotes
     * @object
     * @description
     *
     * The object `Comment.downVotes` groups methods
     * manipulating `DownVote` instances related to `Comment`.
     *
     * Call {@link lbServices.Comment#downVotes Comment.downVotes()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.Comment#downVotes
         * @methodOf lbServices.Comment
         *
         * @description
         *
         * Queries downVotes of comment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::get::comment::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.downVotes#count
         * @methodOf lbServices.Comment.downVotes
         *
         * @description
         *
         * Counts downVotes of comment.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
        R.downVotes.count = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::count::comment::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.downVotes#create
         * @methodOf lbServices.Comment.downVotes
         *
         * @description
         *
         * Creates a new instance in downVotes of this model.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.create = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::create::comment::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.downVotes#destroyById
         * @methodOf lbServices.Comment.downVotes
         *
         * @description
         *
         * Delete a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
        R.downVotes.destroyById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::destroyById::comment::downVotes"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Comment.downVotes#findById
         * @methodOf lbServices.Comment.downVotes
         *
         * @description
         *
         * Find a related item by id for downVotes.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - votes id
         *
         *  - `fk` – `{*}` - Foreign key for downVotes
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R.downVotes.findById = function() {
          var TargetResource = $injector.get("DownVote");
          var action = TargetResource["::findById::comment::downVotes"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.Storage
 * @header lbServices.Storage
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Storage` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Storage",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/storages/:id",
      { 'id': '@id' },
      {

        /**
         * @ngdoc method
         * @name lbServices.Storage#getContainers
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
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
         * This usually means the response is a `Storage` object.)
         * </em>
         */
        "getContainers": {
          isArray: true,
          url: urlBase + "/storages",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#createContainer
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
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
         * This usually means the response is a `Storage` object.)
         * </em>
         */
        "createContainer": {
          url: urlBase + "/storages",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#destroyContainer
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `container` – `{string=}` -
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
         *  - `` – `{undefined=}` -
         */
        "destroyContainer": {
          url: urlBase + "/storages/:container",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#getContainer
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `container` – `{string=}` -
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
         * This usually means the response is a `Storage` object.)
         * </em>
         */
        "getContainer": {
          url: urlBase + "/storages/:container",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#getFiles
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `container` – `{string=}` -
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
         * This usually means the response is a `Storage` object.)
         * </em>
         */
        "getFiles": {
          isArray: true,
          url: urlBase + "/storages/:container/files",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#getFile
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `container` – `{string=}` -
         *
         *  - `file` – `{string=}` -
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
         * This usually means the response is a `Storage` object.)
         * </em>
         */
        "getFile": {
          url: urlBase + "/storages/:container/files/:file",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#removeFile
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `container` – `{string=}` -
         *
         *  - `file` – `{string=}` -
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
         *  - `` – `{undefined=}` -
         */
        "removeFile": {
          url: urlBase + "/storages/:container/files/:file",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#upload
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *   This method does not accept any parameters.
         *   Supply an empty object or omit this argument altogether.
         *
         * @param {Object} postData Request data.
         *
         *  - `req` – `{object=}` -
         *
         *  - `res` – `{object=}` -
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
         *  - `result` – `{object=}` -
         */
        "upload": {
          url: urlBase + "/storages/:container/upload",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Storage#download
         * @methodOf lbServices.Storage
         *
         * @description
         *
         * <em>
         * (The remote method definition does not provide any description.)
         * </em>
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `container` – `{string=}` -
         *
         *  - `file` – `{string=}` -
         *
         *  - `res` – `{object=}` -
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
        "download": {
          url: urlBase + "/storages/:container/download/:file",
          method: "GET"
        },
      }
    );




    /**
    * @ngdoc property
    * @name lbServices.Storage#modelName
    * @propertyOf lbServices.Storage
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Storage`.
    */
    R.modelName = "Storage";


    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.UpVote
 * @header lbServices.UpVote
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `UpVote` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "UpVote",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/upVotes/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use UpVote.journalist() instead.
        "prototype$__get__journalist": {
          url: urlBase + "/upVotes/:id/journalist",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#prototype$__get__votable
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Fetches belongsTo relation votable.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - vote id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "prototype$__get__votable": {
          url: urlBase + "/upVotes/:id/votable",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#create
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/upVotes",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#upsert
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/upVotes",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#exists
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
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
         * Data properties:
         *
         *  - `exists` – `{boolean=}` -
         */
        "exists": {
          url: urlBase + "/upVotes/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#findById
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/upVotes/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#find
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/upVotes",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#findOne
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/upVotes/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#updateAll
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        "updateAll": {
          url: urlBase + "/upVotes/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#deleteById
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
          url: urlBase + "/upVotes/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#count
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
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
          url: urlBase + "/upVotes/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.UpVote#prototype$updateAttributes
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - vote id
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/upVotes/:id",
          method: "PUT"
        },

        // INTERNAL. Use Subarticle.upVotes.findById() instead.
        "::findById::subarticle::upVotes": {
          url: urlBase + "/subarticles/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.upVotes.destroyById() instead.
        "::destroyById::subarticle::upVotes": {
          url: urlBase + "/subarticles/:id/upVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Subarticle.upVotes() instead.
        "::get::subarticle::upVotes": {
          isArray: true,
          url: urlBase + "/subarticles/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.upVotes.create() instead.
        "::create::subarticle::upVotes": {
          url: urlBase + "/subarticles/:id/upVotes",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.upVotes.count() instead.
        "::count::subarticle::upVotes": {
          url: urlBase + "/subarticles/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Article.upVotes.findById() instead.
        "::findById::article::upVotes": {
          url: urlBase + "/articles/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.upVotes.destroyById() instead.
        "::destroyById::article::upVotes": {
          url: urlBase + "/articles/:id/upVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.upVotes() instead.
        "::get::article::upVotes": {
          isArray: true,
          url: urlBase + "/articles/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Article.upVotes.create() instead.
        "::create::article::upVotes": {
          url: urlBase + "/articles/:id/upVotes",
          method: "POST"
        },

        // INTERNAL. Use Article.upVotes.count() instead.
        "::count::article::upVotes": {
          url: urlBase + "/articles/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Journalist.upVotes.findById() instead.
        "::findById::journalist::upVotes": {
          url: urlBase + "/journalists/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.upVotes() instead.
        "::get::journalist::upVotes": {
          isArray: true,
          url: urlBase + "/journalists/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Journalist.upVotes.count() instead.
        "::count::journalist::upVotes": {
          url: urlBase + "/journalists/:id/upVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Comment.upVotes.findById() instead.
        "::findById::comment::upVotes": {
          url: urlBase + "/comments/:id/upVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Comment.upVotes.destroyById() instead.
        "::destroyById::comment::upVotes": {
          url: urlBase + "/comments/:id/upVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Comment.upVotes() instead.
        "::get::comment::upVotes": {
          isArray: true,
          url: urlBase + "/comments/:id/upVotes",
          method: "GET"
        },

        // INTERNAL. Use Comment.upVotes.create() instead.
        "::create::comment::upVotes": {
          url: urlBase + "/comments/:id/upVotes",
          method: "POST"
        },

        // INTERNAL. Use Comment.upVotes.count() instead.
        "::count::comment::upVotes": {
          url: urlBase + "/comments/:id/upVotes/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.UpVote#updateOrCreate
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `UpVote` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.UpVote#update
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.UpVote#destroyById
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
         * @name lbServices.UpVote#removeById
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
    * @name lbServices.UpVote#modelName
    * @propertyOf lbServices.UpVote
    * @description
    * The name of the model represented by this $resource,
    * i.e. `UpVote`.
    */
    R.modelName = "UpVote";


        /**
         * @ngdoc method
         * @name lbServices.UpVote#journalist
         * @methodOf lbServices.UpVote
         *
         * @description
         *
         * Fetches belongsTo relation journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - vote id
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
          var action = TargetResource["::get::upVote::journalist"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.DownVote
 * @header lbServices.DownVote
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `DownVote` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "DownVote",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/downVotes/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use DownVote.journalist() instead.
        "prototype$__get__journalist": {
          url: urlBase + "/downVotes/:id/journalist",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#prototype$__get__votable
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Fetches belongsTo relation votable.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - vote id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "prototype$__get__votable": {
          url: urlBase + "/downVotes/:id/votable",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#create
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/downVotes",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#upsert
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/downVotes",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#exists
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
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
         * Data properties:
         *
         *  - `exists` – `{boolean=}` -
         */
        "exists": {
          url: urlBase + "/downVotes/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#findById
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/downVotes/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#find
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/downVotes",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#findOne
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/downVotes/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#updateAll
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        "updateAll": {
          url: urlBase + "/downVotes/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#deleteById
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
          url: urlBase + "/downVotes/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#count
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
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
          url: urlBase + "/downVotes/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.DownVote#prototype$updateAttributes
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - vote id
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/downVotes/:id",
          method: "PUT"
        },

        // INTERNAL. Use Subarticle.downVotes.findById() instead.
        "::findById::subarticle::downVotes": {
          url: urlBase + "/subarticles/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.downVotes.destroyById() instead.
        "::destroyById::subarticle::downVotes": {
          url: urlBase + "/subarticles/:id/downVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Subarticle.downVotes() instead.
        "::get::subarticle::downVotes": {
          isArray: true,
          url: urlBase + "/subarticles/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Subarticle.downVotes.create() instead.
        "::create::subarticle::downVotes": {
          url: urlBase + "/subarticles/:id/downVotes",
          method: "POST"
        },

        // INTERNAL. Use Subarticle.downVotes.count() instead.
        "::count::subarticle::downVotes": {
          url: urlBase + "/subarticles/:id/downVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Article.downVotes.findById() instead.
        "::findById::article::downVotes": {
          url: urlBase + "/articles/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Article.downVotes.destroyById() instead.
        "::destroyById::article::downVotes": {
          url: urlBase + "/articles/:id/downVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Article.downVotes() instead.
        "::get::article::downVotes": {
          isArray: true,
          url: urlBase + "/articles/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Article.downVotes.create() instead.
        "::create::article::downVotes": {
          url: urlBase + "/articles/:id/downVotes",
          method: "POST"
        },

        // INTERNAL. Use Article.downVotes.count() instead.
        "::count::article::downVotes": {
          url: urlBase + "/articles/:id/downVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Journalist.downVotes.findById() instead.
        "::findById::journalist::downVotes": {
          url: urlBase + "/journalists/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.downVotes() instead.
        "::get::journalist::downVotes": {
          isArray: true,
          url: urlBase + "/journalists/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Journalist.downVotes.count() instead.
        "::count::journalist::downVotes": {
          url: urlBase + "/journalists/:id/downVotes/count",
          method: "GET"
        },

        // INTERNAL. Use Comment.downVotes.findById() instead.
        "::findById::comment::downVotes": {
          url: urlBase + "/comments/:id/downVotes/:fk",
          method: "GET"
        },

        // INTERNAL. Use Comment.downVotes.destroyById() instead.
        "::destroyById::comment::downVotes": {
          url: urlBase + "/comments/:id/downVotes/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Comment.downVotes() instead.
        "::get::comment::downVotes": {
          isArray: true,
          url: urlBase + "/comments/:id/downVotes",
          method: "GET"
        },

        // INTERNAL. Use Comment.downVotes.create() instead.
        "::create::comment::downVotes": {
          url: urlBase + "/comments/:id/downVotes",
          method: "POST"
        },

        // INTERNAL. Use Comment.downVotes.count() instead.
        "::count::comment::downVotes": {
          url: urlBase + "/comments/:id/downVotes/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.DownVote#updateOrCreate
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `DownVote` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.DownVote#update
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.DownVote#destroyById
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
         * @name lbServices.DownVote#removeById
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
    * @name lbServices.DownVote#modelName
    * @propertyOf lbServices.DownVote
    * @description
    * The name of the model represented by this $resource,
    * i.e. `DownVote`.
    */
    R.modelName = "DownVote";


        /**
         * @ngdoc method
         * @name lbServices.DownVote#journalist
         * @methodOf lbServices.DownVote
         *
         * @description
         *
         * Fetches belongsTo relation journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - vote id
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
          var action = TargetResource["::get::downVote::journalist"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.Notification
 * @header lbServices.Notification
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Notification` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Notification",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/notifications/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use Notification.journalist() instead.
        "prototype$__get__journalist": {
          url: urlBase + "/notifications/:id/journalist",
          method: "GET"
        },

        // INTERNAL. Use Notification.installation() instead.
        "prototype$__get__installation": {
          url: urlBase + "/notifications/:id/installation",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#create
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/notifications",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#upsert
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/notifications",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#exists
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
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
         * Data properties:
         *
         *  - `exists` – `{boolean=}` -
         */
        "exists": {
          url: urlBase + "/notifications/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#findById
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/notifications/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#find
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/notifications",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#findOne
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/notifications/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#updateAll
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        "updateAll": {
          url: urlBase + "/notifications/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#deleteById
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
          url: urlBase + "/notifications/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#count
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
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
          url: urlBase + "/notifications/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Notification#prototype$updateAttributes
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Notification id
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/notifications/:id",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.notifications.findById() instead.
        "::findById::journalist::notifications": {
          url: urlBase + "/journalists/:id/notifications/:fk",
          method: "GET"
        },

        // INTERNAL. Use Journalist.notifications.destroyById() instead.
        "::destroyById::journalist::notifications": {
          url: urlBase + "/journalists/:id/notifications/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.notifications.updateById() instead.
        "::updateById::journalist::notifications": {
          url: urlBase + "/journalists/:id/notifications/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Journalist.notifications() instead.
        "::get::journalist::notifications": {
          isArray: true,
          url: urlBase + "/journalists/:id/notifications",
          method: "GET"
        },

        // INTERNAL. Use Journalist.notifications.create() instead.
        "::create::journalist::notifications": {
          url: urlBase + "/journalists/:id/notifications",
          method: "POST"
        },

        // INTERNAL. Use Journalist.notifications.destroyAll() instead.
        "::delete::journalist::notifications": {
          url: urlBase + "/journalists/:id/notifications",
          method: "DELETE"
        },

        // INTERNAL. Use Journalist.notifications.count() instead.
        "::count::journalist::notifications": {
          url: urlBase + "/journalists/:id/notifications/count",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.Notification#updateOrCreate
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `Notification` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.Notification#update
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.Notification#destroyById
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
         * @name lbServices.Notification#removeById
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
    * @name lbServices.Notification#modelName
    * @propertyOf lbServices.Notification
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Notification`.
    */
    R.modelName = "Notification";


        /**
         * @ngdoc method
         * @name lbServices.Notification#journalist
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Fetches belongsTo relation journalist.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Notification id
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
          var action = TargetResource["::get::notification::journalist"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.Notification#installation
         * @methodOf lbServices.Notification
         *
         * @description
         *
         * Fetches belongsTo relation installation.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Notification id
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        R.installation = function() {
          var TargetResource = $injector.get("Installation");
          var action = TargetResource["::get::notification::installation"];
          return action.apply(R, arguments);
        };

    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.Installation
 * @header lbServices.Installation
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Installation` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "Installation",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/installations/:id",
      { 'id': '@id' },
      {

        /**
         * @ngdoc method
         * @name lbServices.Installation#findByApp
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Find installations by application id
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `deviceType` – `{string=}` - Device type
         *
         *  - `appId` – `{string=}` - Application id
         *
         *  - `appVersion` – `{string=}` - Application version
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "findByApp": {
          url: urlBase + "/installations/byApp",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#findByUser
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Find installations by user id
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `deviceType` – `{string=}` - Device type
         *
         *  - `userId` – `{string=}` - User id
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "findByUser": {
          url: urlBase + "/installations/byUser",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#findBySubscriptions
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Find installations by subscriptions
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `deviceType` – `{string=}` - Device type
         *
         *  - `subscriptions` – `{string=}` - Subscriptions
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "findBySubscriptions": {
          url: urlBase + "/installations/bySubscriptions",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#create
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/installations",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#upsert
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/installations",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#exists
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
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
         * Data properties:
         *
         *  - `exists` – `{boolean=}` -
         */
        "exists": {
          url: urlBase + "/installations/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#findById
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/installations/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#find
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/installations",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#findOne
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/installations/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#updateAll
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        "updateAll": {
          url: urlBase + "/installations/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#deleteById
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
          url: urlBase + "/installations/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#count
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
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
          url: urlBase + "/installations/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.Installation#prototype$updateAttributes
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Installation id
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/installations/:id",
          method: "PUT"
        },

        // INTERNAL. Use Notification.installation() instead.
        "::get::notification::installation": {
          url: urlBase + "/notifications/:id/installation",
          method: "GET"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.Installation#updateOrCreate
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `Installation` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.Installation#update
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.Installation#destroyById
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
         * @name lbServices.Installation#removeById
         * @methodOf lbServices.Installation
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
    * @name lbServices.Installation#modelName
    * @propertyOf lbServices.Installation
    * @description
    * The name of the model represented by this $resource,
    * i.e. `Installation`.
    */
    R.modelName = "Installation";


    return R;
  }]);

/**
 * @ngdoc object
 * @name lbServices.App
 * @header lbServices.App
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `App` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "App",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/apps/:id",
      { 'id': '@id' },
      {

        /**
         * @ngdoc method
         * @name lbServices.App#create
         * @methodOf lbServices.App
         *
         * @description
         *
         * Create a new instance of the model and persist it into the data source.
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/apps",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#upsert
         * @methodOf lbServices.App
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/apps",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#exists
         * @methodOf lbServices.App
         *
         * @description
         *
         * Check whether a model instance exists in the data source.
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
         * Data properties:
         *
         *  - `exists` – `{boolean=}` -
         */
        "exists": {
          url: urlBase + "/apps/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#findById
         * @methodOf lbServices.App
         *
         * @description
         *
         * Find a model instance by id from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Model id
         *
         *  - `filter` – `{object=}` - Filter defining fields and include
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/apps/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#find
         * @methodOf lbServices.App
         *
         * @description
         *
         * Find all instances of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/apps",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#findOne
         * @methodOf lbServices.App
         *
         * @description
         *
         * Find first instance of the model matched by filter from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/apps/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#updateAll
         * @methodOf lbServices.App
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        "updateAll": {
          url: urlBase + "/apps/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#deleteById
         * @methodOf lbServices.App
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
          url: urlBase + "/apps/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#count
         * @methodOf lbServices.App
         *
         * @description
         *
         * Count instances of the model matched by where from the data source.
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
          url: urlBase + "/apps/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.App#prototype$updateAttributes
         * @methodOf lbServices.App
         *
         * @description
         *
         * Update attributes for a model instance and persist it into the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `id` – `{*}` - Application id
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/apps/:id",
          method: "PUT"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.App#updateOrCreate
         * @methodOf lbServices.App
         *
         * @description
         *
         * Update an existing model instance or insert a new one into the data source.
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
         * This usually means the response is a `App` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.App#update
         * @methodOf lbServices.App
         *
         * @description
         *
         * Update instances of the model matched by where from the data source.
         *
         * @param {Object=} parameters Request parameters.
         *
         *  - `where` – `{object=}` - Criteria to match model instances
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
        R["update"] = R["updateAll"];

        /**
         * @ngdoc method
         * @name lbServices.App#destroyById
         * @methodOf lbServices.App
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
         * @name lbServices.App#removeById
         * @methodOf lbServices.App
         *
         * @description
         *
         * Delete a model instance by id from the data source.
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
    * @name lbServices.App#modelName
    * @propertyOf lbServices.App
    * @description
    * The name of the model represented by this $resource,
    * i.e. `App`.
    */
    R.modelName = "App";


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

/* jshint ignore:end */
})(window, window.angular);
