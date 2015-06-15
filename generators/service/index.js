var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');
var utils = require('../../lib/utils');

var ServiceGen = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },
  prompting: BaseGenerator.prototype.prompting,
  normalizeProps: function () {
    this.name = utils.normalizeDiName(this.name || '');
  },
  writing: function () {
    var appName = this.determineAppname();
    var basePath = this.destinationPath('app/scripts/services');
    var className = appName + '.services.' + utils.capitalize(this.name);
    var modulePath = path.join(basePath, 'module.ts');
    var refsPath = path.join(basePath, 'refs.d.ts');
    var classPath = path.join(basePath, this.name.toLowerCase() + '.ts');
    this.fs.copyTpl(this.templatePath('service.ts.ejs'), classPath, {
      className: utils.capitalize(this.name),
      appName: appName
    });
    var refsContent = (this.fs.read(refsPath) + '\n///<reference path="' + this.name.toLowerCase() + '.ts" />\n')
      .replace('\n\n', '\n');
    var moduleContent = this.fs.read(modulePath);
    moduleContent = moduleContent.replace(/( +)(\/\/\/ng\-ts\:module\-inject\/\/\/)/m,
      '$1.service(\'' + this.name + '\', ' + className + ')\n$1$2');
    this.fs.delete(refsPath);
    this.fs.delete(modulePath);
    this.fs.commit(function () {
      this.fs.write(refsPath, refsContent);
      this.fs.write(modulePath, moduleContent);
      this.emit('ready');
    }.bind(this));
  }
});

exports = module.exports = ServiceGen;
