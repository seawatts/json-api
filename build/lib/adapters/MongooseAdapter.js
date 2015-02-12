// Generated by LiveScript 1.2.0
(function(){
  var Q, mongoose, prelude, defaultInflector, Resource, Collection, ErrorResource, advice, utils, MongooseAdapter, toString$ = {}.toString;
  Q = require('q');
  mongoose = require('mongoose');
  prelude = require('prelude-ls');
  defaultInflector = require('pluralize');
  Resource = require('../types/Resource');
  Collection = require('../types/Collection');
  ErrorResource = require('../types/ErrorResource');
  advice = require('../util/advice');
  utils = require('../util/utils');
  MongooseAdapter = (function(){
    MongooseAdapter.displayName = 'MongooseAdapter';
    var prototype = MongooseAdapter.prototype, constructor = MongooseAdapter;
    function MongooseAdapter(models, inflector, idGenerator){
      this.models = models || mongoose.models;
      this.inflector = inflector || defaultInflector;
      this.idGenerator = idGenerator;
    }
    /**
     * Returns a Promise for an array or resources. The first item in the 
     * promised array is the primary Resource or Collection being looked up.
     * The second item is an array of "extra resources". See the comments within
     * this method for a description of those.
     * 
     * Note: The correct behavior if idOrIds is an empty array is to return no
     * documents, as happens below. If it's undefined, though, we're not filtering
     * by id and should return all documents.
     */
    prototype.find = function(type, idOrIds, filters, fields, sorts, includePaths){
      var model, refPaths, queryBuilder, pluralize, idQuery, mode, extraResources, extraFieldsToRefTypes, extraDocumentsPromises, duplicateQuery, i$, len$, pathParts, addDocAsExternalResource, primaryDocumentsPromise, extraResourcesPromise, primaryResourcesPromise, this$ = this;
      model = this.getModel(constructor.getModelName(type));
      refPaths = constructor.getReferencePaths(model);
      queryBuilder = new mongoose.Query(null, null, model, model.collection);
      pluralize = this.inflector.plural;
      if (idOrIds) {
        switch (typeof idOrIds) {
        case "string":
          idQuery = idOrIds;
          mode = "findOne";
          break;
        default:
          idQuery = {
            '$in': idOrIds
          };
          mode = "find";
        }
        queryBuilder[mode]({
          '_id': idQuery
        });
      } else {
        queryBuilder.find();
      }
      if (toString$.call(filters).slice(8, -1) === "Object") {
        queryBuilder.where(filters);
      }
      if (fields instanceof Array) {
        queryBuilder.select(fields.map(function(it){
          var ref$;
          if ((ref$ = it.charAt(0)) === '+' || ref$ === '-') {
            return it.substr(1);
          } else {
            return it;
          }
        }).join(' '));
      }
      if (sorts instanceof Array) {
        queryBuilder.sort(sorts.join(' '));
      }
      if (includePaths) {
        extraResources = {};
        extraFieldsToRefTypes = {};
        extraDocumentsPromises = [];
        duplicateQuery = queryBuilder.toConstructor();
        includePaths = includePaths.map(function(it){
          return it.split('.');
        });
        for (i$ = 0, len$ = includePaths.length; i$ < len$; ++i$) {
          pathParts = includePaths[i$];
          if (!in$(pathParts[0], constructor.getReferencePaths(model))) {
            continue;
          }
          if (pathParts.length === 1) {
            if (fields && !in$(pathParts[0], fields)) {
              queryBuilder.select(pathParts[0]);
              extraFieldsToRefTypes[pathParts[0]] = constructor.getType(constructor.getReferencedModelName(model, pathParts[0]), pluralize);
            }
            queryBuilder.populate(pathParts[0]);
          } else {
            fn$();
          }
        }
        addDocAsExternalResource = function(doc, collectionType){
          if (doc && !extraResources[collectionType].some(function(it){
            return it.id === doc.id;
          })) {
            return extraResources[collectionType].push(constructor.docToResource(doc, pluralize));
          }
        };
        primaryDocumentsPromise = Q(queryBuilder.exec()).then(function(docs){
          utils.forEachArrayOrVal(docs, function(doc){
            var field, ref$, refType, refDocs;
            for (field in ref$ = extraFieldsToRefTypes) {
              refType = ref$[field];
              if (!extraResources[refType]) {
                extraResources[refType] = [];
              }
              refDocs = doc[field] instanceof Array
                ? doc[field]
                : [doc[field]];
              refDocs.forEach(fn$);
              doc[field] = undefined;
            }
            function fn$(it){
              return addDocAsExternalResource(it, refType);
            }
          });
          return docs;
        });
        extraResourcesPromise = Q.all(extraDocumentsPromises).then(function(docSets){
          var i$, len$, ref$, type, docSet;
          for (i$ = 0, len$ = docSets.length; i$ < len$; ++i$) {
            ref$ = docSets[i$], type = ref$.type, docSet = ref$.docSet;
            if (!extraResources[type]) {
              extraResources[type] = [];
            }
            if (!(docSet instanceof Array)) {
              docSet = [docSet];
            }
            docSet.forEach(fn$);
          }
          return primaryDocumentsPromise.then(function(){
            return extraResources;
          });
          function fn$(it){
            return addDocAsExternalResource(it, type);
          }
        });
      } else {
        primaryDocumentsPromise = Q(queryBuilder.exec());
        extraResourcesPromise = Q(undefined);
      }
      primaryResourcesPromise = primaryDocumentsPromise.then(function(it){
        return constructor.docsToResourceOrCollection(it, type, pluralize);
      });
      return Q.all([primaryResourcesPromise, extraResourcesPromise])['catch'](function(it){
        return [constructor.errorHandler(it), undefined];
      });
      function fn$(){
        var lastModelName;
        lastModelName = model.modelName;
        return extraDocumentsPromises.push(pathParts.reduce(function(resourcePromises, part){
          return resourcePromises.then(function(resources){
            if (resources) {
              lastModelName = constructor.getReferencedModelName(this$.getModel(lastModelName), part);
              return Q.npost(this$.getModel(lastModelName), "populate", [
                resources, {
                  path: part
                }
              ]);
            }
          }).then(function(it){
            var flatten, mapped;
            if (!it || (it instanceof Array && !it.length)) {
              return it;
            }
            if (!(it instanceof Array)) {
              return it[part];
            } else {
              flatten = it[0][part] instanceof Array;
              mapped = it.map(function(it){
                return it[part];
              });
              if (flatten) {
                return mapped.reduce(function(a, b){
                  return a.concat(b);
                });
              } else {
                return mapped;
              }
            }
          });
        }, Q(duplicateQuery().select(pathParts[0]).exec())).then(function(resources){
          if (!resources) {
            return {};
          }
          return {
            "type": constructor.getType(lastModelName, pluralize),
            "docSet": resources
          };
        }));
      }
    };
    prototype.create = function(resourceOrCollection){
      var model, docs, generator, this$ = this;
      model = this.getModel(constructor.getModelName(resourceOrCollection.type));
      docs = utils.mapResources(resourceOrCollection, constructor.resourceToPlainObject);
      generator = this.idGenerator;
      if (typeof generator === "function") {
        utils.forEachArrayOrVal(docs, function(doc){
          doc._id = generator(doc);
        });
      }
      return Q.ninvoke(model, "create", docs).then(function(it){
        return constructor.docsToResourceOrCollection(it, resourceOrCollection.type, this$.inflector.plural);
      }, constructor.errorHandler);
    };
    prototype.update = function(type, idOrIds, changeSets){
      var model, idQuery, mode, this$ = this;
      model = this.getModel(constructor.getModelName(type));
      switch (typeof idOrIds) {
      case "string":
        idQuery = idOrIds;
        mode = "findOne";
        break;
      default:
        idQuery = {
          '$in': idOrIds
        };
        mode = "find";
      }
      return Q(model[mode]({
        '_id': idQuery
      }).exec()).then(function(docs){
        var successfulSavesPromises;
        successfulSavesPromises = [];
        utils.forEachArrayOrVal(docs, function(it){
          it.set(changeSets[it.id]);
          return successfulSavesPromises.push(Q.Promise(function(resolve, reject){
            return it.save(function(err, doc){
              if (err) {
                reject(err);
              }
              return resolve(doc);
            });
          }));
        });
        return Q.all(successfulSavesPromises);
      }).then(function(docs){
        return constructor.docsToResourceOrCollection(docs, type, this$.inflector.plural);
      })['catch'](constructor.errorHandler);
    };
    prototype['delete'] = function(type, idOrIds){
      var model, idQuery, mode, this$ = this;
      model = this.getModel(constructor.getModelName(type));
      switch (typeof idOrIds) {
      case "string":
        idQuery = idOrIds;
        mode = "findOne";
        break;
      default:
        idQuery = {
          '$in': idOrIds
        };
        mode = "find";
      }
      return Q(model[mode]({
        '_id': idQuery
      }).exec()).then(function(docs){
        utils.forEachArrayOrVal(docs, function(it){
          return it.remove();
        });
        return docs;
      })['catch'](constructor.errorHandler);
    };
    prototype.getModel = function(modelName){
      return this.models[modelName];
    };
    MongooseAdapter.errorHandler = function(err){
      var errors, key, ref$, thisError, x$, generatedError;
      if (err.errors != null) {
        errors = [];
        for (key in ref$ = err.errors) {
          thisError = ref$[key];
          x$ = generatedError = {};
          x$['status'] = err.name === "ValidationError"
            ? 400
            : thisError.status || 500;
          x$['title'] = thisError.message;
          if (thisError.path != null) {
            x$['path'] = thisError.path;
          }
          errors.push(new ErrorResource(null, generatedError));
        }
        return new Collection(errors, null, "errors");
      } else if (err.isJSONAPIDisplayReady) {
        return new ErrorResource(null, {
          title: err.message,
          status: err.status || 500
        });
      } else {
        return new ErrorResource(null, {
          "status": 400,
          "title": "An error occurred while trying to find, create, or modify the requested resource(s)."
        });
      }
    };
    /**
     * @param docs The docs to turn into a resource or collection
     * @param type The type to use for the Collection, if one's being made. 
     * @param pluralize An inflector function for setting the Resource's type
     */
    MongooseAdapter.docsToResourceOrCollection = function(docs, type, pluralize){
      var makeCollection, this$ = this;
      if (!docs) {
        return new ErrorResource(null, {
          status: 404,
          title: "No matching resource found."
        });
      }
      makeCollection = docs instanceof Array;
      if (!makeCollection) {
        docs = [docs];
      }
      docs = docs.map(function(it){
        return constructor.docToResource(it, pluralize);
      });
      if (makeCollection) {
        return new Collection(docs, null, type);
      } else {
        return docs[0];
      }
    };
    MongooseAdapter.resourceToPlainObject = function(resource){
      var res, key, ref$, value;
      res = import$({}, resource.attrs);
      if (resource.links != null) {
        for (key in ref$ = resource.links) {
          value = ref$[key];
          res[key] = value.ids || value.id;
        }
      }
      return res;
    };
    MongooseAdapter.docToResource = function(doc, pluralize){
      var type, refPaths, attrs, schemaOptions, links, resource;
      type = constructor.getType(doc.constructor.modelName, pluralize);
      refPaths = constructor.getReferencePaths(doc.constructor);
      attrs = doc.toObject();
      schemaOptions = doc.constructor.schema.options;
      delete attrs['_id'], delete attrs[schemaOptions.versionKey], delete attrs[schemaOptions.discriminatorKey];
      links = {};
      refPaths.forEach(function(path){
        var pathParts, valAtPath, jsonValAtPath, isToOneRelationship, resources, this$ = this;
        pathParts = path.split('.');
        valAtPath = pathParts.reduce(function(obj, part){
          return obj[part];
        }, doc);
        jsonValAtPath = pathParts.reduce(function(obj, part){
          return obj[part];
        }, attrs);
        utils.deleteNested(path, attrs);
        if (!valAtPath || (valAtPath instanceof Array && valAtPath.length === 0)) {
          return;
        }
        isToOneRelationship = false;
        if (!(valAtPath instanceof Array)) {
          valAtPath = [valAtPath];
          jsonValAtPath = [jsonValAtPath];
          isToOneRelationship = true;
        }
        resources = [];
        valAtPath.forEach(function(docOrId, i){
          var id, type;
          if (docOrId instanceof mongoose.Document) {
            return resources.push(constructor.docToResource(docOrId, pluralize));
          } else {
            id = jsonValAtPath[i];
            type = constructor.getType(constructor.getReferencedModelName(doc.constructor, path), pluralize);
            return resources.push(new Resource(type, id));
          }
        });
        return links[path] = isToOneRelationship
          ? resources[0]
          : new Collection(resources);
      });
      resource = new Resource(type, doc.id, attrs, !prelude.Obj.empty(links) ? links : void 8);
      return constructor.handleSubDocs(doc, resource);
    };
    MongooseAdapter.handleSubDocs = function(doc, resource){
      return resource;
    };
    MongooseAdapter.getReferencePaths = function(model){
      var paths, this$ = this;
      paths = [];
      model.schema.eachPath(function(name, type){
        if (constructor.isReferencePath(type)) {
          return paths.push(name);
        }
      });
      return paths;
    };
    MongooseAdapter.getStandardizedSchema = function(model){
      var schema, schemaOptions, standardSchema, _getStandardType, this$ = this;
      schema = model.schema;
      schemaOptions = model.schema.options;
      standardSchema = {};
      _getStandardType = function(path, schemaType){
        var isArray, rawType, refModel, res;
        if (path === '_id') {
          return 'Id';
        }
        isArray = schemaType.options.type instanceof Array;
        rawType = isArray
          ? schemaType.options.type[0].type.name
          : schemaType.options.type.name;
        refModel = constructor.getReferencedModelName(model, path);
        res = isArray ? 'Array[' : '';
        res += refModel ? refModel + 'Id' : rawType;
        res += isArray ? ']' : '';
        return res;
      };
      model.schema.eachPath(function(name, type){
        var standardType, required, enumValues, ref$, defaultVal;
        if (name === schemaOptions.versionKey || name === schemaOptions.discriminatorKey) {
          return;
        }
        standardType = _getStandardType(name, type);
        if (name === '_id') {
          name = 'id';
        }
        required = type.options.required;
        enumValues = (ref$ = type.options['enum']) != null ? ref$.values : void 8;
        defaultVal = name === 'id' || (standardType === 'Date' && (name === 'created' || name === 'modified') && typeof type.options['default'] === 'function')
          ? '(auto generated)'
          : type.options['default'] != null && typeof type.options['default'] !== 'function' ? type.options['default'] : void 8;
        return standardSchema[name] = {
          type: standardType,
          'default': defaultVal,
          enumValues: enumValues,
          required: required
        };
      });
      return standardSchema;
    };
    MongooseAdapter.isReferencePath = function(schemaType){
      var ref$;
      return ((ref$ = (schemaType.caster || schemaType).options) != null ? ref$.ref : void 8) != null;
    };
    MongooseAdapter.getReferencedModelName = function(model, path){
      var schemaType, ref$;
      schemaType = model.schema.path(path);
      return (ref$ = (schemaType.caster || schemaType).options) != null ? ref$.ref : void 8;
    };
    MongooseAdapter.getChildTypes = function(model, pluralize){
      var this$ = this;
      if (model.discriminators) {
        return Object.keys(model.discriminators).map(function(it){
          return constructor.getType(it, pluralize);
        });
      } else {
        return [];
      }
    };
    MongooseAdapter.getType = function(modelName, pluralize){
      pluralize = pluralize || defaultInflector.plural;
      return pluralize(modelName.replace(/([A-Z])/g, '-$1').slice(1).toLowerCase());
    };
    MongooseAdapter.getModelName = function(type, singularize){
      var words;
      singularize = singularize || defaultInflector.singular;
      words = type.split('-');
      words[words.length - 1] = singularize(words[words.length - 1]);
      return words.map(function(it){
        return it.charAt(0).toUpperCase() + it.slice(1);
      }).join('');
    };
    MongooseAdapter.getNestedSchemaPaths = function(model){};
    return MongooseAdapter;
  }());
  module.exports = MongooseAdapter;
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
