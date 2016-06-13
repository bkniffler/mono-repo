module.exports = function (props, appConfig) {
   var head = props.head;
   var html = props.html;
   var data = props.data;

   return `
       <!doctype html>
       <html lang="de" class="app">
           <head>${head ? head.title.toString() + head.link.toString() + head.meta.toString() : ''}</head>
           <body>
               <div id="app" class="full"/>${html || ''}</div>
               ${data ? `<script>window.__data='${data}'</script>` : ''}
               <script src="/bundle.js"></script>
           </body>
       </html>
    `;
}
