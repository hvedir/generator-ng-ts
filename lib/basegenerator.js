'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var utils = require('./utils');

var BaseGenerator = generators.Base.extend({
  constructor: function () {
    this._namePromptConfig = this._namePromptConfig || {
      name    : 'name',
      message : 'Name'
    };
    generators.Base.apply(this, arguments);
    this.argument('name', { type: String, required: false });
    this.option('quiet', { type: String, description: 'Run without quiet prompts (using defaults).'});
    this._asyncCb = null;
    this._promptOptions = [];
    if (!this.constructor.prototype.hasOwnProperty('prompting')) {
      this.constructor.prototype.prompting = this.prompting;
    }
    this.rootDir = path.resolve(path.join(this.sourceRoot(), '../../..'));
    this.commonRoot = path.join(this.rootDir, 'common');
    this.sourceRoot(path.join(this.rootDir, 'templates'));
    var generatorsDir = path.join(this.rootDir, 'generators');
    this._runQueue = [];
    this.getDependentGenerators().forEach(function (name) {
      this.env.register(require.resolve(path.join(generatorsDir, name)), 'ng-ts:' + name);
    }, this);
  },
  getDependentGenerators: function () {
    return [];
  },
  commonPath: function (file) {
    return path.resolve(this.commonRoot, file);
  },
  prompting: function () {
    // Name
    if (!this.name) {
      this._promptOptions.unshift(this._namePromptConfig);
    } else {
      this.normalizeProps();
    }
    this._checkPrompts();
  },
  addPromptOption: function (config) {
    var argConfig = {
      required: false,
      type: String
    };
    this.argument(config.name, argConfig);
    this._promptOptions.push(config);
  },
  _checkPrompts: function () {
    var promptsToRun = [];
    this._promptOptions.forEach(function (propConfig) {
      var propName = propConfig.name;
      if (!this[propName]) {
        var defaultValue = 'function' == typeof propConfig.default ? propConfig.default.call(this) : propConfig.default;
        if (this.options.quiet && 'undefined' != typeof defaultValue) {
          this[propName] = defaultValue;
        } else {
           promptsToRun.push(propConfig);
        }
      }
    }, this);
    if(promptsToRun.length) {
      this._asyncCb = this.async();
      this.prompt(promptsToRun, this._handlePromptResults.bind(this));
    } else {
      this.normalizeProps();
    }
  },
  _handlePromptResults: function (props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
    this.normalizeProps();
    this.resolveAsync();
  },
  runGenerators: function (runArgs) {
    this._asyncCb = this.async();
    this._runQueue = runArgs;
    this._afterRunCallback();
  },
  _afterRunCallback: function () {
    if (this._runQueue.length) {
      var args = this._runQueue.shift();
      this.log("env.run :");
      this.log(args);
      args.push(this._afterRunCallback.bind(this));
      this.env.run.apply(this.env, args);
    } else {
      this.log("env.run ended;");
      this.resolveAsync();
    }
  },
  resolveAsync: function () {
    var asyncCb = this._asyncCb;
    if (asyncCb) {
      this._asyncCb = null;
      asyncCb();
    }
  },
  normalizeProps: function () {}
});


exports = module.exports = BaseGenerator;