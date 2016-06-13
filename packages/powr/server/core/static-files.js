var express = require('express');
var staticAsset = require("./expiry");
var path = require("path");
var log = require("debug")('powr:assets');
var fs = require('fs');
var glob = require("glob");

module.exports = app => {
   if(app.get('assets')){
      if (Array.isArray(app.get('assets'))){
         app.get('assets').forEach(asset => {
            log('Asset path', asset);
            app.use(staticAsset(asset));
            app.use(express.static(asset));
            walk(asset, '**/*.*', file => {
               var p = file.indexOf('/') !== 0 ? ('/' + file) : file;
               staticAsset.assetFingerprint(p);
            });
         })
      } else {
         log('Asset path', app.get('assets'));
         app.use(staticAsset(app.get('assets')));
         app.use(express.static(app.get('assets')));
      }
   }
}

var walk = (root, pattern, cb) => {
   glob(pattern, {cwd: root}, function (er, files) {
      files.forEach(cb);
   })
}
