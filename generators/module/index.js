var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');

var ModuleGen = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },
  prompting: BaseGenerator.prototype.prompting,
  normalizeProps: function () {
    this.name = (this.name || '').trim().replace(/[\/ \.]+/g, '.');
    var appName = this.determineAppname();
    if (this.name.indexOf(appName) != 0) {
      this.name = appName + '.' + this.name;
    }
  },
  writing: function () {
    var dirs = this.name.split('.').slice(1);
    var dirPath = ['app', 'scripts'].concat(dirs).join(path.sep);
    this.fs.copyTpl(this.templatePath('module.ts.ejs'), this.destinationPath(path.join(dirPath, 'module.ts')), {
      moduleName: this.name,
      moduleDeps: '',
      mainRefsPath: dirs.map(function() {
        return '..'
      }).concat(['refs.d.ts']).join('/')
    });
    var refsPath = this.destinationPath(path.join(dirPath, 'refs.d.ts'));
    this.env.run('ng-ts:ns ' + this.name).on('ready', function () {
      var refsContent = this.fs.read(refsPath);
      this.fs.delete(refsPath);
      this.fs.write(refsPath, (refsContent + '\n///<reference path="module.ts" />\n').replace('\n\n', '\n'));
      this.emit('ready');
    }.bind(this));
  }
});

exports = module.exports = ModuleGen;
