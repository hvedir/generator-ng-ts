'use strict';

var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');

var AppGen = BaseGenerator.extend({
  constructor: function () {
    this._namePromptConfig = {
      name: 'name',
      message: 'Application name',
      default: function () {
        return this.determineAppname();
      }.bind(this)
    };
    BaseGenerator.apply(this, arguments);
    this.angularModules = ['ng', 'ngMaterial'];
    this.addPromptOption({
      name    : 'description',
      message : 'Your project description',
      default : function (answers) {
        var name = this.name || (answers || {}).name;
        return name ? ('Description of ' + name) : undefined;
      }.bind(this)
    });
    this.addPromptOption({
      name    : 'version',
      message : 'Your project version',
      default : '0.0.1'
    });
  },
  prompting: BaseGenerator.prototype.prompting,
  configuring: function () {
    this.config.set('appName', this.name);
    var bowerJson = this.fs.readJSON(this.commonPath('bower.json'));
    var packageJson = this.fs.readJSON(this.commonPath('package.json'));
    bowerJson.name = packageJson.name = this.name;
    bowerJson.description = packageJson.description = this.description;
    bowerJson.version = packageJson.version = this.version;
    this.fs.writeJSON(this.destinationPath('bower.json'), bowerJson);
    this.fs.writeJSON(this.destinationPath('package.json'), packageJson);
  },
  install: function () {
    if (!this.options['skip-install']) {
      this.log('Installing dependencies');
      this.bowerInstall();
      this.npmInstall().on('npmInstall:end', function () {
        this.spawnCommand('tsd', ['reinstall']);
      }.bind(this));
    } else {
      this.log('Skipping dependecies installation.');
    }
  },
  writing: function () {
    var tplData = {
      appName: this.name,
      angularModules: '"' + this.angularModules.join('", "') + '"'
    };
    this.fs.copyTpl(this.templatePath('app.ts.ejs'), this.destinationPath('app/scripts/app.ts'), tplData);
    this.fs.copy(this.commonPath('refs.d.ts'), this.destinationPath('app/scripts/refs.d.ts'));
    this.fs.copy(this.commonPath('tsd.json'), this.destinationPath('tsd.json'));
    this.fs.copy(this.commonPath('.editorconfig'), this.destinationPath('.editorconfig'));
    this.fs.copy(this.commonPath('.gitignore'), this.destinationPath('.gitignore'));
    this.fs.copy(this.commonPath('.bowerrc'), this.destinationPath('.bowerrc'));
    this.fs.copy(this.commonPath('index.html'), this.destinationPath('app/index.html'));
    this.fs.copy(this.commonPath('tsc.d.ts'), this.destinationPath('typings/tsc.d.ts'));
    this.env.run('ng-ts:module services');
    this.env.run('ng-ts:module views');
    this.env.run('ng-ts:module directives');
    this.env.run('ng-ts:module controllers').on('ready', function () {
      this.env.run('ng-ts:controller main');
    }.bind(this));
    this.env.run('ng-ts:view main');
  },
  end: function(){
    this.config.save();
    this.log('Done.');
  }
});


exports = module.exports = AppGen;