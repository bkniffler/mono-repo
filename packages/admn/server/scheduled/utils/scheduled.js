var Sequelize = require('sequelize');
var moment = require('moment');
var deepExtend = require('deep-extend');

/*var optionsTest = {
 startField: 'active',
 endField: 'active',
 limit: 10,
 interval: { amount: 5, dimension: 'days' }
 }
 var queryTest = {
 where: {},
 scheduled: {
 period: 'future|past',
 page: 0
 }
 }*/
function filterByRange(startField, endField, start, end) {
  var where = {
    $or: [
      {$and: [{}, {}]},
      {$and: [{}, {}]}
    ]
  };
  where.$or[0].$and[0][startField] = {$gte: start};
  where.$or[0].$and[1][startField] = {$lt: end};
  where.$or[1].$and[0][endField] = {$gte: start};
  where.$or[1].$and[1][endField] = {$lt: end};
  return where;
}

function filterByPointOfTime(startField, endField, pointOfTime) {
  var where = {};
  where[startField] = {$or: [{$lte: pointOfTime}, null]};
  where[endField] = {$or: [{$gte: pointOfTime}, null]};
  return where;
}

function filterByAfter(startField, pointOfTime) {
  var where = {};
  where[startField] = {$gte: pointOfTime};
  return where;
}

function filterByBefore(endField, pointOfTime) {
  var where = {};
  where[endField] = {$lte: pointOfTime};
  return where;
}

module.exports = function (sequelize, options) {
  if (!options) {
    options = {};
  }
  var log = options.log || console.log;

  sequelize.Model.prototype.enableScheduled = function (modelOptions) {
    if (!modelOptions) modelOptions = {};
    // { "endField": "end", "startField": "start", "max": 20, "min": 10, "mode": "offset|start-end|", "offset": { "dimension": "weeks", "amount": 2 } }
    var Model = this;
    var startField = modelOptions.startField || 'start';
    var endField = modelOptions.endField || 'end';
    var intervalDimension = modelOptions.interval ? modelOptions.interval.dimension : undefined;
    var intervalAmount = modelOptions.interval ? modelOptions.interval.amount : undefined;
    var isInterval = intervalDimension && intervalAmount;
    var limit = modelOptions.limit || modelOptions.max || undefined;
    log('Enable scheduled on ' + this.name);
    this.scheduled = true;

    if (!this.attributes[startField]) {
      this.attributes[startField] = {
        type: Sequelize.DATE,
      };
    }
    if (!this.attributes[endField]) {
      this.attributes[endField] = {
        type: Sequelize.DATE,
      };
    }

    this.refreshAttributes();
    this.getScheduledQuery = query => {
      var minimum = query.minimum;
      var useNow = query.useNow;
      var orientation = useNow ? 'day' : intervalDimension;

      // intervall
      if (isInterval && query.period === 'past' && query.page === undefined) { // Is interval and want all past
        return {
          order: [[`"${startField}"`, 'DESC']],
          limit: limit || undefined,
          where: filterByBefore(endField,
            moment(new Date()).startOf('day').toDate()
          ),
        };
      } else if (isInterval && query.period === 'past' && query.page !== undefined) { // Is interval and want page x in past
        return {
          order: [[`"${startField}"`, 'DESC']],
          limit: limit || undefined,
          where: filterByRange(startField, endField,
            moment(new Date()).startOf(orientation).add(query.page * intervalAmount * -1, intervalDimension).toDate(),
            moment(new Date()).startOf(orientation).add(query.page * intervalAmount * -1 + intervalAmount, intervalDimension).toDate()
          ),
        };
      } else if (isInterval && minimum) { // Minimum of xxx -> rest is done in after hook
        return {
          order: [[`"${startField}"`, 'ASC']],
          limit: limit || undefined,
          where: filterByAfter(startField,
            moment(new Date()).startOf('day').toDate()
          ),
        };
      } else if (isInterval) { // Just interval in future
        return {
          order: [[`"${startField}"`, 'ASC']],
          limit: limit || undefined,
          where: filterByRange(startField, endField,
            moment(new Date()).startOf(orientation).add((query.page || 0) * intervalAmount, intervalDimension).toDate(),
            moment(new Date()).startOf(orientation).add((query.page || 0) * intervalAmount + intervalAmount, intervalDimension).toDate()
          ),
        };

        // no intervall
      } else if (!isInterval && query.period === 'past') { // No interval and want past
        return {
          offset: ((limit || 0) * (query.page || 0)) || undefined,
          limit: limit || undefined,
          order: [[`"${startField}"`, 'DESC']],
          where: filterByBefore(endField,
            moment(new Date()).startOf('day').toDate()
          )
        };
      } else if (!isInterval && query.period === 'future') { // No interval and want future
        return {
          offset: ((limit || 0) * (query.page || 0)) || undefined,
          limit: limit || undefined,
          order: [[`"${startField}"`, 'ASC']],
          where: filterByAfter(startField,
            moment(new Date()).startOf('day').toDate()
          )
        };
      } else if (!isInterval) { // No interval, no type
        return {
          offset: ((limit || 0) * (query.page || 0)) || undefined,
          limit: limit || undefined,
          order: [[`"${startField}"`, 'ASC']],
          where: filterByPointOfTime(startField, endField, new Date()),
        };
      }
      return undefined;
    };

    var beforeFind = options => {
      if (!options.scheduled) return;
      var query = this.getScheduledQuery(options.scheduled || {});
      options.where = deepExtend({}, query.where, options.where || {});
      options.limit = options.limit || query.limit;
      options.offset = options.offset || query.offset;
      options.order = (options.order || []).concat(query.order || []);
    };

    // Slice results if minumum and isInterval are set
    var afterFind = function(results, query) {
      if (!query.scheduled) return results;
      var minimum = query.minimum;
      if (!minimum || !isInterval) return results;

      if(results.length >= minimum) {
        var diff = moment(new Date()).startOf('day').add(intervalAmount, intervalDimension).diff(results[minimum][startField], 'minutes');
        if(diff < 0) {
          return results.slice(0, minimum);
        }
      }
      return results;
    };

    // Overwrite findAll to allow modification of results, afterFind will not apply changes to results
    var findAllOld = this.findAll;
    this.findAll = function() {
      var args = arguments;
      return findAllOld.apply(this, args).then(function(results){
        return afterFind(results, args[0]);
      });
    };

    this.addHook('beforeFind', beforeFind);

    return this;
  };


  return {};
};
