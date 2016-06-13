sudo npm install powr --save
sudo npm install powr-dev --save-dev

For sqlite
sudo npm install sqlite3 --save

```jsx
// config.js
module.exports = function () {
   return {
      // app entry point
      app: path.resolve(__dirname, 'app', 'app.js'),
      // database settings
      database: {
         dialect: 'sqlite',
         storage: './data.db'
      }
      //ssr: true
   }
}
```

For postgres
sudo npm install pg pg-hstore --save

```jsx
// config.js
module.exports = function () {
   return {
      // app entry point
      app: path.resolve(__dirname, 'app', 'app.js'),
      // database settings
       database: {
         sync: true,
         dialect: 'postgres',
         db: "test",
         username: "test",
         password: "test",
         host: "localhost"
      }
   }
}
```

For other databases, check the sequelize docs.
