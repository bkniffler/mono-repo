
/*
Templating for draft-js contentState

Will replace entityMap.data entries that contain _boundTo_ keys
Or
Blocks that contain {{key}}
With the props

{
   "entityMap": {
       "0": {
           "type": "TOKEN",
           "mutability": "MUTABLE",
           "data": {
               "image": {
                   "_boundTo_": "image"
               },
               "_map_:image": {
                 "_boundTo_": "image",
                 "_map_": "image"
               }
           }
       }
   },
   "blocks": [
       {
           "key": "5d5gi",
           "text": "{{name}}",
           "type": "header-1",
           "depth": 0,
           "inlineStyleRanges": [],
           "entityRanges": []
       },
       {
           "key": "6gldp",
           "text": "{{name}}",
           "type": "unstyled",
           "depth": 0,
           "inlineStyleRanges": [],
           "entityRanges": []
       },
       {
           "key": "kuij",
           "text": "{{text}}",
           "type": "unstyled",
           "depth": 0,
           "inlineStyleRanges": [],
           "entityRanges": []
       },
       {
           "key": "evrs0",
           "text": " ",
           "type": "Image",
           "depth": 0,
           "inlineStyleRanges": [],
           "entityRanges": [
               {
                   "offset": 0,
                   "length": 1,
                   "key": 0
               }
           ]
       }
   ]
   }
*/

module.exports = function (contentState, props) {
  if (!contentState || !contentState.blocks || !contentState.entityMap) return null;
  var entityMap = contentState.entityMap;
  var blocks = contentState.blocks;
  var newBlocks = [];
  var newEntityMap = {};

  for (var key in entityMap) {
    var entity = {
      type: entityMap[key].type,
      mutability: entityMap[key].mutability,
    };
    var data = entityMap[key].data;
    if (data) {
      entity.data = {};
      for (var dataKey in data) {
        var dataField = data[dataKey];
        if (dataField && typeof dataField === 'object' && dataField._boundTo_) {
          entity.data[dataField._map_ || dataKey] = props[dataField._boundTo_];
        } else if (dataField && typeof dataField === 'string' && dataField.indexOf('{{') === 0) {
          var start = dataField.indexOf('{{');
          var end = dataField.indexOf('}}') + 2;
          var propName = dataField.substring(start + 2, end - 2).trim();
          entity.data[dataKey] = props[propName];
        } else {
          entity.data[dataKey] = dataField;
        }
      }
    }
    newEntityMap[key] = entity;
  }
  // Replace blocks
  blocks.forEach(function (block) {
    while (block.text.indexOf('{{') !== -1) {
      var start = block.text.indexOf('{{');
      var end = block.text.indexOf('}}') + 2;
      var propName = block.text.substring(start + 2, end - 2).trim();
      var propValue = props[propName];
      if (propValue && typeof propValue === 'object' && propValue.blocks && propValue.entityMap) {
        var beforeText = block.text.substring(0, start);
        var afterText = block.text.substring(end);
        if (beforeText) {
          newBlocks.push(Object.assign({}, block, { key: genKey(), text: beforeText }));
        }
        propValue.blocks.forEach(function (nestedBlock) {
          newBlocks.push(nestedBlock);
        });
        block.text = afterText;
      } else {
        block.text = block.text.substring(0, start) + (propValue || '') + block.text.substring(end);
      }
    }
    newBlocks.push(block);
  });

  return {
    blocks: newBlocks,
    entityMap: newEntityMap,
  };
};

function genKey()
{
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
