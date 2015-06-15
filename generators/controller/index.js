var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');
var utils = require('../../lib/utils');

var ControllerGen = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },
  prompting: BaseGenerator.prototype.prompting,
  normalizeProps: function () {
    this.name = utils.normalizeControllerName(this.name || '');
  },
  writing: function () {
    var appName = this.determineAppname();
    var basePath = this.destinationPath('app/scripts/controllers');
    var className = appName + '.controllers.' + this.name;
    var modulePath = path.join(basePath, 'module.ts');
    var refsPath = path.join(basePath, 'refs.d.ts');
    var classPath = path.join(basePath, this.name.toLowerCase() + '.ts');
    this.fs.copyTpl(this.templatePath('ctrl.ts.ejs'), classPath, {
      controllerName: this.name,
      appName: appName
    });
    var refsContent = (this.fs.read(refsPath) + '\n///<reference path="' + this.name.toLowerCase() + '.ts" />\n')
      .replace('\n\n', '\n');
    var moduleContent = this.fs.read(modulePath);
    moduleContent = moduleContent.replace(/( +)(\/\/\/ng\-ts\:module\-inject\/\/\/)/m,
      '$1.controller(\'' + this.name + '\', ' + className + ')\n$1$2');
    this.fs.delete(refsPath);
    this.fs.delete(modulePath);
    this.fs.commit(function () {
      this.fs.write(refsPath, refsContent);
      this.fs.write(modulePath, moduleContent);
      this.emit('ready');
    }.bind(this));
  }
});

exports = module.exports = ControllerGen;
