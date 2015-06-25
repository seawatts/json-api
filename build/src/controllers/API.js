"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _typesHTTPResponse = require("../types/HTTP/Response");

var _typesHTTPResponse2 = _interopRequireDefault(_typesHTTPResponse);

var _typesDocument = require("../types/Document");

var _typesDocument2 = _interopRequireDefault(_typesDocument);

var _typesCollection = require("../types/Collection");

var _typesCollection2 = _interopRequireDefault(_typesCollection);

var _typesAPIError = require("../types/APIError");

var _typesAPIError2 = _interopRequireDefault(_typesAPIError);

var _stepsHttpValidateRequest = require("../steps/http/validate-request");

var requestValidators = _interopRequireWildcard(_stepsHttpValidateRequest);

var _stepsHttpContentNegotiationNegotiateContentType = require("../steps/http/content-negotiation/negotiate-content-type");

var _stepsHttpContentNegotiationNegotiateContentType2 = _interopRequireDefault(_stepsHttpContentNegotiationNegotiateContentType);

var _stepsHttpContentNegotiationValidateContentType = require("../steps/http/content-negotiation/validate-content-type");

var _stepsHttpContentNegotiationValidateContentType2 = _interopRequireDefault(_stepsHttpContentNegotiationValidateContentType);

var _stepsPreQueryLabelToIds = require("../steps/pre-query/label-to-ids");

var _stepsPreQueryLabelToIds2 = _interopRequireDefault(_stepsPreQueryLabelToIds);

var _stepsPreQueryParseRequestPrimary = require("../steps/pre-query/parse-request-primary");

var _stepsPreQueryParseRequestPrimary2 = _interopRequireDefault(_stepsPreQueryParseRequestPrimary);

var _stepsPreQueryValidateDocument = require("../steps/pre-query/validate-document");

var _stepsPreQueryValidateDocument2 = _interopRequireDefault(_stepsPreQueryValidateDocument);

var _stepsPreQueryValidateResources = require("../steps/pre-query/validate-resources");

var _stepsPreQueryValidateResources2 = _interopRequireDefault(_stepsPreQueryValidateResources);

var _stepsApplyTransform = require("../steps/apply-transform");

var _stepsApplyTransform2 = _interopRequireDefault(_stepsApplyTransform);

var _stepsDoQueryDoGet = require("../steps/do-query/do-get");

var _stepsDoQueryDoGet2 = _interopRequireDefault(_stepsDoQueryDoGet);

var _stepsDoQueryDoPost = require("../steps/do-query/do-post");

var _stepsDoQueryDoPost2 = _interopRequireDefault(_stepsDoQueryDoPost);

var _stepsDoQueryDoPatch = require("../steps/do-query/do-patch");

var _stepsDoQueryDoPatch2 = _interopRequireDefault(_stepsDoQueryDoPatch);

var _stepsDoQueryDoDelete = require("../steps/do-query/do-delete");

var _stepsDoQueryDoDelete2 = _interopRequireDefault(_stepsDoQueryDoDelete);

var supportedExt = [];

var APIController = (function () {
  function APIController(registry) {
    _classCallCheck(this, APIController);

    this.registry = registry;
  }

  _createClass(APIController, [{
    key: "handle",

    /**
     * @param {Request} request The Request this controller will use to generate
     *    the Response.
     * @param {Object} frameworkReq This should be the request object generated by
     *    the framework that you're using. But, really, it can be absolutely
     *    anything, as this controller won't use it for anything except passing it
     *    to user-provided functions that it calls (like transforms and id mappers).
     * @param {Object} frameworkRes Theoretically, the response objcet generated
     *     by your http framework but, like with frameworkReq, it can be anything.
     */
    value: function handle(request, frameworkReq, frameworkRes) {
      var response = new _typesHTTPResponse2["default"]();
      var registry = this.registry;

      // Kick off the chain for generating the response.
      return (0, _co2["default"])(_regeneratorRuntime.mark(function callee$2$0() {
        var parsedPrimary, mappedLabel, mappedIsEmptyArray, errorsArr, apiErrors;
        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              context$3$0.prev = 0;
              context$3$0.next = 3;
              return requestValidators.checkBodyExistence(request);

            case 3:
              context$3$0.next = 5;
              return (0, _stepsHttpContentNegotiationNegotiateContentType2["default"])(request.accepts, ["application/vnd.api+json"]);

            case 5:
              response.contentType = context$3$0.sent;

              // No matter what, though, we're varying on Accept. See:
              // https://github.com/ethanresnick/json-api/issues/22
              response.headers.vary = "Accept";

              if (registry.type(request.type)) {
                context$3$0.next = 9;
                break;
              }

              throw new _typesAPIError2["default"](404, undefined, request.type + " is not a valid type.");

            case 9:
              if (!request.hasBody) {
                context$3$0.next = 23;
                break;
              }

              context$3$0.next = 12;
              return (0, _stepsHttpContentNegotiationValidateContentType2["default"])(request, supportedExt);

            case 12:
              context$3$0.next = 14;
              return (0, _stepsPreQueryValidateDocument2["default"])(request.body);

            case 14:
              context$3$0.next = 16;
              return (0, _stepsPreQueryParseRequestPrimary2["default"])(request.body.data, request.aboutRelationship);

            case 16:
              parsedPrimary = context$3$0.sent;

              if (request.aboutRelationship) {
                context$3$0.next = 20;
                break;
              }

              context$3$0.next = 20;
              return (0, _stepsPreQueryValidateResources2["default"])(request.type, parsedPrimary, registry);

            case 20:
              context$3$0.next = 22;
              return (0, _stepsApplyTransform2["default"])(parsedPrimary, "beforeSave", registry, frameworkReq, frameworkRes);

            case 22:
              request.primary = context$3$0.sent;

            case 23:
              if (!(request.idOrIds && request.allowLabel)) {
                context$3$0.next = 30;
                break;
              }

              context$3$0.next = 26;
              return (0, _stepsPreQueryLabelToIds2["default"])(request.type, request.idOrIds, registry, frameworkReq);

            case 26:
              mappedLabel = context$3$0.sent;

              // set the idOrIds on the request context
              request.idOrIds = mappedLabel;

              mappedIsEmptyArray = Array.isArray(mappedLabel) && !mappedLabel.length;

              if (mappedLabel === null || mappedLabel === undefined || mappedIsEmptyArray) {
                response.primary = mappedLabel ? new _typesCollection2["default"]() : null;
              }

            case 30:
              if (!(typeof response.primary === "undefined")) {
                context$3$0.next = 45;
                break;
              }

              context$3$0.t0 = request.method;
              context$3$0.next = context$3$0.t0 === "get" ? 34 : context$3$0.t0 === "post" ? 37 : context$3$0.t0 === "patch" ? 40 : context$3$0.t0 === "delete" ? 43 : 45;
              break;

            case 34:
              context$3$0.next = 36;
              return (0, _stepsDoQueryDoGet2["default"])(request, response, registry);

            case 36:
              return context$3$0.abrupt("break", 45);

            case 37:
              context$3$0.next = 39;
              return (0, _stepsDoQueryDoPost2["default"])(request, response, registry);

            case 39:
              return context$3$0.abrupt("break", 45);

            case 40:
              context$3$0.next = 42;
              return (0, _stepsDoQueryDoPatch2["default"])(request, response, registry);

            case 42:
              return context$3$0.abrupt("break", 45);

            case 43:
              context$3$0.next = 45;
              return (0, _stepsDoQueryDoDelete2["default"])(request, response, registry);

            case 45:
              context$3$0.next = 53;
              break;

            case 47:
              context$3$0.prev = 47;
              context$3$0.t1 = context$3$0["catch"](0);
              errorsArr = Array.isArray(context$3$0.t1) ? context$3$0.t1 : [context$3$0.t1];
              apiErrors = errorsArr.map(_typesAPIError2["default"].fromError);

              // Leave the error response's content type as JSON if we negotiated
              // for that, but otherwise force it to JSON API, since that's the only
              // other error format we know how to generate.
              if (response.contentType !== "application/json") {
                response.contentType = "application/vnd.api+json";
              }

              // Set the other key fields on the response
              response.errors = response.errors.concat(apiErrors);
              //console.log("API CONTROLLER ERRORS", errorsArr[0], errorsArr[0].stack);

            case 53:
              if (!response.errors.length) {
                context$3$0.next = 57;
                break;
              }

              response.status = pickStatus(response.errors.map(function (v) {
                return Number(v.status);
              }));
              response.body = new _typesDocument2["default"](response.errors).get(true);
              return context$3$0.abrupt("return", response);

            case 57:
              context$3$0.next = 59;
              return (0, _stepsApplyTransform2["default"])(response.primary, "beforeRender", registry, frameworkReq, frameworkRes);

            case 59:
              response.primary = context$3$0.sent;
              context$3$0.next = 62;
              return (0, _stepsApplyTransform2["default"])(response.included, "beforeRender", registry, frameworkReq, frameworkRes);

            case 62:
              response.included = context$3$0.sent;

              if (response.status !== 204) {
                response.body = new _typesDocument2["default"](response.primary, response.included, undefined, registry.urlTemplates(), request.uri).get(true);
              }

              return context$3$0.abrupt("return", response);

            case 65:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[0, 47]]);
      }));
    }
  }], [{
    key: "responseFromExternalError",
    value: function responseFromExternalError(request, error) {
      var response = new _typesHTTPResponse2["default"]();
      response.errors = [_typesAPIError2["default"].fromError(error)];
      response.status = pickStatus(response.errors.map(function (v) {
        return Number(v.status);
      }));
      response.body = new _typesDocument2["default"](response.errors).get(true);

      return (0, _stepsHttpContentNegotiationNegotiateContentType2["default"])(request.accepts, ["application/vnd.api+json"]).then(function (contentType) {
        response.contentType = contentType.toLowerCase() === "application/json" ? contentType : "application/vnd.api+json";
        return response;
      }, function () {
        // if we couldn't find any acceptable content-type,
        // just ignore the accept header, as http allows.
        response.contentType = "application/vnd.api+json";
        return response;
      });
    }
  }]);

  return APIController;
})();

APIController.supportedExt = supportedExt;

exports["default"] = APIController;

/**
 * Returns the status code that best represents a set of error statuses.
 */
function pickStatus(errStatuses) {
  return errStatuses[0];
}
module.exports = exports["default"];

// throw if the body is supposed to be present but isn't (or vice-versa).

// Try to negotiate the content type (may fail, and we may need to
// deviate from the negotiated value if we have to return an error
// body, rather than our expected response).
// If the type requested in the endpoint hasn't been registered, we 404.

// If the request has a body, validate it and parse its resources.

// validate the request's resources.

// Map label to idOrIds, if applicable.
// if our new ids are null/undefined or an empty array, we can set
// the primary resources too! (Note: one could argue that we should
// 404 rather than return null when the label matches no ids.)

// Actually fulfill the request!
// If we've already populated the primary resources, which is possible
// because the label may have mapped to no id(s), we don't need to query.

// Add errors to the response converting them, if necessary, to
// APIError instances first. Might be needed if, e.g., the error was
// unexpected (and so uncaught and not transformed) in one of prior steps
// or the user couldn't throw an APIError for compatibility with other code.

// If we have errors, which could have come from prior steps not just
// throwing, return here and don't bother with transforms.

// apply transforms pre-send