'use strict';

exports = module.exports = {
  lowerize: lowerize,
  capitalize: capitalize,
  normalizeControllerName: normalizeControllerName,
  normalizeClassName: normalizeClassName,
  normalizeDiName: normalizeDiName,
  normalizeInterfaceName: normalizeInterfaceName,
  normalizeViewName: normalizeViewName,
  ns2dirs: ns2dirs,
  pathToNs: pathToNs
};

function lowerize(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function normalizeClassName(name, mainNs) {
  var parts = name.trim().split('.');
  var className = parts[parts.length -1];
  parts[parts.length -1] = capitalize(className);
  if (parts[0] != mainNs) {
    parts.unshift(mainNs);
  }
  return parts.join('.');
}

function normalizeViewName(name) {
  name  = name.trim();
  var newName = name.charAt(0).toLowerCase();
  for (var i = 1, currentChar = name.charAt(i); i < name.length; ++i, currentChar = name.charAt(i)) {
    if (currentChar != currentChar.toLowerCase()) {
      newName += '-' + currentChar.toLowerCase();
    } else {
      newName += currentChar;
    }
  }
  if (!/\.html$/.test(newName)) {
    newName += '.html';
  }
  return newName;
}

function normalizeInterfaceName(name, mainNs) {
  var parts = name.trim().split('.');
  var className = parts[parts.length -1];
  if (className.charAt(0).toLowerCase() != 'i') {
    className = 'I' + className;
  }
  parts[parts.length -1] = 'I' + className.charAt(1).toUpperCase() + className.slice(2);
  return normalizeClassName(parts.join('.'), mainNs);
}

function normalizeDiName(name) {
  name = lowerize(name.trim());
  var parts = name.split(/[ \-]+/);
  name = parts.shift();
  return parts.reduce(function (acc, part) {
    return acc + capitalize(part);
  }, name);
}

function normalizeControllerName(name) {
  name = capitalize(name);
  if (!/Ctrl$/.test(name)) {
    name += 'Ctrl';
  }
  return name;
}

function ns2dirs(ns) {
  //
}

function pathToNs(path) {
  //
}
