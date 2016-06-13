module.exports = app=> {
  var injectImage = user => {
    //console.log('BEFORE UPDATE USER', user);
    if (!user.get("image")) {
      user.set("image", {"url":"https://res.cloudinary.com/dhsf4vjjc/image/upload/v1462879248/ekgd/u8xgooorijbqsbxxsvcz.jpg", "width": 800, "height": 800 });
    }
  };
  app.db.model('user').addHook('beforeUpdate', injectImage);
  app.db.model('user').addHook('beforeCreate', injectImage);
};
