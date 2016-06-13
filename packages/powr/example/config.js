// Config values
var path = require("path");

module.exports = function () {
   return {
      app: path.resolve(__dirname, 'app', 'app.js'),
      root: path.resolve(__dirname, '..'),
      database: {
         sync: true,
         dialect: 'postgres',
         logging: false,
         db: "powr",
         username: "powr",
         password: "powr",
         host: "localhost"
      },
      upload: {
         uploadDir: "/uploads",
         urlUpload: "/upload",
         urlDownload: "/dl",
         cloudinary: {
         }
      }
      //ssr: true
   }
}
