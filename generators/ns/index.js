'use strict';

var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');

var NsGen = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },
  normalizeProps: function () {
    this.name = (this.name || '').trim().replace(/[\/ \.]+/g, '.');
    var appName = this.determineAppname();
    if (this.name.indexOf(appName) != 0) {
      this.name = appName + '.' + this.name;
    }
  },
  prompting: BaseGenerator.prototype.prompting,
  writing: function () {
    var dirs  = this.name.split('.');
    var currNs = dirs.shift();
    var currPath = this.destinationPath('app/scripts');
    dirs.forEach(function(dir){
      var prevPath = currPath;
      currNs += '.' + dir;
      currPath = path.join(currPath, dir);
      var refsPath = path.join(currPath, 'refs.d.ts');
      var nsPath = path.join(currPath, 'ns.ts');
      if (!this.fs.exists(nsPath)) {
        this.fs.copyTpl(this.templatePath('ns.ts.ejs'), nsPath, {moduleName: currNs});
      }
      if (!this.fs.exists(refsPath)) {
        this.fs.write(refsPath, '///<reference path="ns.ts" />\n');
        var prevRefsPath =  path.join(prevPath, 'refs.d.ts');
        if (this.fs.exists(prevRefsPath)) {
          this.fs.write(prevRefsPath, (this.fs.read(prevRefsPath) + '\n///<reference path="' + dir + '/refs.d.ts" />\n').replace('\n\n', '\n'));
        }
      }
    }, this);
    this.emit('ready');
  },
  end: function(){
    this.log('Done.')
  }
});

exports = module.exports = NsGen;