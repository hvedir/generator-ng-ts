var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');
var utils = require('../../lib/utils');

var ClassGen = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },
  prompting: BaseGenerator.prototype.prompting,
  normalizeProps: function () {
    this.name = utils.normalizeClassName(this.name, this.determineAppname());
  },
  writing: function () {
    var parts = this.name.split('.');
    var className = parts[parts.length -1];
    var ns = parts.slice(0, parts.length - 1).join('.');
    var basePath = this.destinationPath((['app', 'scripts'].concat(parts.slice(1, parts.length - 1))).join(path.sep));
    var refsPath = path.join(basePath, 'refs.d.ts');
    var classPath = path.join(basePath, className.toLowerCase() + '.ts');
    this.env.run('ng-ts:ns ' + ns).on('ready', function () {
      this.fs.copyTpl(this.templatePath('class.ts.ejs'), classPath, {
        nsName: ns,
        className: className
      });
      var refsContent = (this.fs.read(refsPath) + '\n///<reference path="' + className.toLowerCase() + '.ts" />\n')
        .replace('\n\n', '\n');
      this.fs.delete(refsPath);
      this.fs.commit(function () {
        this.fs.write(refsPath, refsContent);
        this.emit('ready');
      }.bind(this));
    }.bind(this))
  }
});

exports = module.exports = ClassGen;
