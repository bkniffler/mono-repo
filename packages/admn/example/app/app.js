import customBlocks from './blocks';
import {Admn, Blocks} from 'admn';
import frontend from './frontend';

module.exports = function () {
  var app = {
    frontend,
    blocks: {
      ...Blocks,
      ...customBlocks
    }
  };
  return Admn(app);
};
