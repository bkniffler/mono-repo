// Config values
var path = require("path");

module.exports = function () {
  return {
    app: path.resolve(__dirname, 'app', 'app.js'),
    root: path.resolve(__dirname, '..'),
    alias: {
      admn: path.resolve(__dirname, '..', 'src')
    },
    assets: [
      path.resolve(__dirname, 'www', 'assets'),
    ],
    backup: {
      folder: path.resolve(__dirname, 'backup'),
      // auto: 60*1000,
      restore: true,
      exclude: 'model'
    },
    database: {
      sync: true,
      dialect: 'postgres',
      logging: false,
      db: "admn",
      username: "admn",
      password: "admn",
      host: "localhost"
    },
    upload: {
      uploadDir: "/uploads",
      urlUpload: "/upload",
      urlDownload: "/dl",
      cloudinary: {
        cloud_name: 'dhsf4vjjc',
        api_key: '611265577387889',
        api_secret: 'hLVj9zgfTL2qUM9eDN_rJhNEaAE',
        folder: "test"
      }
    }
  }
}
