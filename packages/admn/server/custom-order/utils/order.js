var Sequelize = require('sequelize');
var moment = require('moment');
var deepExtend = require('deep-extend');

module.exports = function (sequelize, options) {
  if (!options) {
    options = {};
  }
  var log = options.log || console.log;

  sequelize.Model.prototype.enableCustomOrder = function (orderField) {
    // { "endField": "end", "startField": "start", "max": 20, "min": 10, "mode": "offset|start-end|", "offset": { "dimension": "weeks", "amount": 2 } }
    const Model = this;
    if (orderField) orderField = 'order';
    log('Enable custom-order on ' + this.name);
    this.customOrder = true;

    if (!this.attributes[orderField]) {
      this.attributes[orderField] = {
        type: Sequelize.INTEGER
      };
    }

    this.refreshAttributes();
    this.hook('beforeFind', function (options) {
      if (options.customOrder === false) return;

      Array.isArray(options.order) ? options.order.push(['order', 'ASC']) : options.order = [['order', 'ASC']];
    });
    return this;
  };


  return {};
};
