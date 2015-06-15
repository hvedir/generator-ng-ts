var path = require('path');
var BaseGenerator = require('../../lib/basegenerator');
var utils = require('../../lib/utils');

var ControllerGen = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },
  prompting: BaseGenerator.prototype.prompting,
  normalizeProps: function () {
    this.name = utils.normalizeViewName(this.name || '');
  },
  writing: function () {
    var basePath = this.destinationPath('app/views');
    this.fs.copyTpl(this.templatePath('view.html.ejs'), path.join(basePath, this.name), {
      viewName: this.name
    });
    this.emit('ready');
  }
});

exports = module.exports = ControllerGen;
