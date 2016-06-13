var util = require('util');
var LocalStrategy = require('passport-local').Strategy;
var Sequelize = require('sequelize');
var crypto = require('bluebird').promisifyAll(require('crypto'));

// The default option values
var defaultOptions = {
  activationkeylen: 8,
  resetPasswordkeylen: 8,
  saltlen: 32,
  iterations: 12000,
  keylen: 512,
  usernameField: 'email',
  usernameLowerCase: true,
  activationRequired: false,
  hashField: 'hash',
  saltField: 'salt',
  activationKeyField: 'activationKey',
  resetPasswordKeyField: 'resetPasswordKey',
  incorrectPasswordError: 'Incorrect password',
  incorrectUsernameError: 'Incorrect username',
  userNotActiveError: 'User is not active',
  invalidActivationKeyError: 'Invalid activation key',
  invalidResetPasswordKeyError: 'Invalid reset password key',
  missingUsernameError: 'Field %s is not set',
  missingFieldError: 'Field %s is not set',
  missingPasswordError: 'Password argument not set!',
  userExistsError: 'User already exists with %s',
  activationError: 'Email activation required'
};

var attach = function (UserSchema, options) {
// Get our options with default values for things not passed in
  options = Object.assign({}, defaultOptions, options);

  var toJson = UserSchema.Instance.prototype.toJSON;
  UserSchema.Instance.prototype.toJSON = function () {
    var ret = toJson.call(this);
    delete ret[options.saltField];
    delete ret[options.hashField];
    delete ret[options.activationKeyField];
    delete ret[options.resetPasswordKeyField];
    return ret;
  };

  UserSchema.beforeCreate(user => {
    if (options.usernameLowerCase) {
      user[options.usernameField] = user[options.usernameField].toLowerCase();
    }
    return Promise.resolve(user);
  });

  UserSchema.setPassword = (user, password) => {
    if (!password) {
      return Promise.reject(new Error(options.missingPasswordError));
    }
    return crypto.randomBytesAsync(options.saltlen)
      .then(buf => buf.toString('hex'))
      .then(salt => Promise.all([
        crypto.pbkdf2Async(password, salt, options.iterations, options.keylen),
        Promise.resolve(salt)
      ])).then(results => {
        user.set(options.hashField, new Buffer(results[0], 'binary').toString('hex'));
        user.set(options.saltField, results[1]);
        return user.save();
      });
  };

  UserSchema.setActivationKey = user => {
    if (!options.activationRequired) {
      return Promise.resolve(user);
    }
    return crypto.randomBytesAsync(options.activationkeylen).then(buf => {
      var randomHex = buf.toString('hex');
      user.set(options.activationKeyField, randomHex);
      return user.save();
    });
  };

  UserSchema.authenticate = (username, password) => {
    return UserSchema.findByUsername(username, false).then(user => {
      if (!user) {
        throw new Error(options.incorrectUsernameError);
      } else if (options.activationRequired && user.get(options.activationKeyField)) {
        throw new Error(options.activationError);
      } return Promise.all([
        Promise.resolve(user),
        crypto.pbkdf2Async(password, user.get(options.saltField), options.iterations, options.keylen)
      ]);
    }).then(results => {
      var hash = new Buffer(results[1], 'binary').toString('hex');
      if (hash !== results[0].get(options.hashField)) {
        throw new Error(options.incorrectPasswordError);
      } return results[0];
    });
  };

  UserSchema.register = (user, password, activate) => {
    if (typeof user === 'string') {
      var fields = {};
      fields[options.usernameField] = user;
      user = UserSchema.build(fields);
    } else if (typeof user === 'object') {
      user = UserSchema.build(user);
    }

    if (!user.get(options.usernameField)) {
      return Promise.reject(util.format(options.missingUsernameError, options.usernameField));
    }

    return UserSchema.findByUsername(user.get(options.usernameField), true).then(existingUser => {
      if (existingUser && existingUser.deletedAt === null) {
        throw new Error(util.format(options.userExistsError, user.get(options.usernameField)));
      } else if (existingUser && existingUser.deletedAt !== null) {
        existingUser.setDataValue('deletedAt', null);
        return existingUser.update(user);
      } return user;
    }).then(user => UserSchema.setPassword(user, password))
      .then(user => UserSchema.setActivationKey(user));
  };

  UserSchema.activate = activationKey => {
    var query = { where: {} };
    query.where[options.activationKeyField] = activationKey;
    return UserSchema.find(query).then(user => {
      if (!user) {
        throw new Error(options.invalidActivationKeyError);
      }
      user.set(options.activationKeyField, null);
      return user.save();
    });
  };

  // Find by Username field
  UserSchema.findByUsername = (username, showDeleted) => {
    if (options.usernameLowerCase) {
      username = username.toLowerCase();
    }
    var query = {paranoid: !showDeleted, where: {}};
    query.where[options.usernameField] = username;
    return UserSchema.find(query);
  };

  // Set reset-password
  UserSchema.setResetPasswordKey = username => {
    return UserSchema.findByUsername(username, false).then(user => {
      if (!user) {
        throw new Error(options.incorrectUsernameError);
      } return Promise.all([
        Promise.resolve(user),
        crypto.randomBytesAsync(options.resetPasswordkeylen)
      ]);
    }).then(results => {
      results[0].set(options.resetPasswordKeyField, results[1].toString('hex'));
      return results[0].save();
    });
  };

  // Reset Password
  UserSchema.resetPassword = (username, password, resetPasswordKey) => {
    return UserSchema.findByUsername(username, false).then(user => {
      if (!user) {
        throw new Error(options.incorrectUsernameError);
      } else if (user.get(options.resetPasswordKeyField) !== resetPasswordKey) {
        throw new Error(options.invalidResetPasswordKeyError);
      } return UserSchema.setPassword(user, password);
    }).then(user => {
      user.set(options.resetPasswordKeyField, null);
      return user.save();
    });
  };

  // Passport
  UserSchema.serializeUser = () => (user, cb) => {
    return cb(null, user.get(options.usernameField))
  };
  UserSchema.deserializeUser = () => (username, cb) => {
    return UserSchema.findByUsername(username, false).then(user => cb(null, user)).catch(err => cb(err));
  };
  UserSchema.createStrategy = () => {
    return new LocalStrategy(options, (username, password, cb) => {
      UserSchema.authenticate(username, password).then(user => cb(null, user)).catch(err => cb(err))
    });
  };
};

var getUserModel = function (extraFields, options) {
  options = Object.assign({}, defaultOptions, options);
  var schema = {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    },
    hash: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    salt: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    resetPasswordKey: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  };
  schema[options.usernameField] = {
    type: Sequelize.TEXT,
    allowNull: false
  };

  if (options.activationRequired) {
    schema[options.activationKeyField] = {
      type: Sequelize.STRING,
      allowNull: true
    };
  }

  return Object.assign({}, schema, extraFields || {}, options.fields || {});
};

module.exports = {
  attach: attach,
  getUserModel: getUserModel
};
