var glob = require("glob");
var staticAsset = require("./server/core/expiry");

module.exports = config => {
  if(config.assets){
    if (Array.isArray(config.assets)){
      config.assets.forEach(asset => {
        staticAsset(asset);
        walk(asset, '**/*.*', file => {
          console.log(staticAsset.assetFingerprint(file));
        });
      })
    } else {
      staticAsset(config.assets)
      walk(config.assets, '**/*.*', file => {
        console.log(staticAsset.assetFingerprint(file));
      });
    }
  }
}

var walk = (root, pattern, cb) => {
  glob(pattern, {cwd: root}, function (er, files) {
    files.forEach(cb);
  })
}
