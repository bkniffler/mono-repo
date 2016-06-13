var React = require('react');
var helmet = require('react-helmet');

var example = {
   template: '* -- Website',
   title: 'Example',
   description: 'Awesome Example Meta',
   author: 'bkniffler',
   locale: 'de_DE',
   image: 'https://placehold.it/200x200',
   charset: 'utf-8',
   keywords: ['awesome', 'stuff']
}
function composeMeta(obj){
   if(!obj.meta){ obj.meta = {}; }
   if(!obj.meta.name){ obj.meta.name = {}; }
   if(!obj.meta.property){ obj.meta.property = {}; }
   if(!obj.meta.scripts){ obj.meta.scripts = []; }
   if(!obj.meta.links){ obj.meta.links = []; }

   if(!obj.template){
      delete obj.template;
   }
   if(obj.url) {
      obj.meta.property['og:url'] = obj.url;
      obj.canonical = obj.url;
   }
   if(obj.title){
      obj.meta.property['og:site_name'] = obj.title;
      obj.meta.property['og:title'] = obj.title;
      obj.meta.property['twitter:title'] = obj.title;
   }
   else{
      delete obj.title;
   }
   if(obj.description){
      obj.meta.name['description'] = obj.description;
      obj.meta.property['og:description'] = obj.description;
      obj.meta.property['twitter:description'] = obj.description;
      obj.meta.property['twitter:card'] = 'Zusammenfassung: ' + obj.description;;
   }
   if(obj.type){
      obj.meta.property['og:type'] = obj.type;
      delete obj.type;
   }
   if(obj.author){
      obj.meta.property['twitter:creator'] = obj.author;
      obj.meta.property['article:author'] = obj.author;
      delete obj.author;
   }
   if(obj.site){
      obj.meta.property['twitter:site'] = obj.site;
      obj.meta.property['article:publisher'] = obj.site;
      delete obj.site;
   }
   if(obj.locale){
      obj.meta.property['og:locale'] = obj.locale;
      delete obj.locale;
   }
   if(obj.image){
      obj.meta.property['og:image'] = obj.image;
      obj.meta.property['twitter:image'] = obj.image;
      obj.meta.property['twitter:image'] = '200';
      obj.meta.property['twitter:image'] = '200';
      delete obj.image;
   }
   if(obj.charset){
      obj.meta.charset = obj.charset;
      delete obj.charset;
   }
   if(Array.isArray(obj.keywords)){
      obj.meta.name.keywords = obj.keywords.join(' ');
      delete obj.keywords;
   }
   else if(obj.keywords){
      obj.meta.name.keywords = obj.keywords;
      delete obj.keywords;
   }

   var n = {
      title: obj.title,
      titleTemplate: obj.template,
      meta: [],
      script: (obj.scripts || []).map(function(item){
         return {"type": "text/javascript", "href": item}
      }),
      link: (obj.styles || []).map(function(item){
         return {"rel": "stylesheet", "href": item}
      })
   };

   if(obj.canonical){
      n.link.push({ rel: 'canonical', href: obj.canonical });
      delete obj.canonical;
   }
   Object.keys(obj.meta.name).map(function(key){
      n.meta.push({name: key, content: obj.meta.name[key]});
   });
   Object.keys(obj.meta.property).map(function(key){
      n.meta.push({property: key, content: obj.meta.property[key]});
   });
   return n;
}

var Head = React.createClass({
   render: function() {
      var head = this.props.value;
      var children = this.props.children;
      return React.createElement(
         "head",
         null,
         React.createElement("meta", { charSet: "utf-8" }),
         head && head.title ? head.title.toComponent() : null,
         head && head.meta ? head.meta.toComponent() : null,
         head && head.link ? head.link.toComponent() : null,
         head && head.script ? head.script.toComponent() : null,
         children
      );
   }
});

exports.Helmet = helmet;
exports.Head = Head;
exports.ComposeMeta = composeMeta;
