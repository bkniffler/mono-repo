module.exports = function (props, config) {
  var head = props.head;
  var html = props.html;
  var data = props.data;

  var tracking = config.googleAnalytics && config.googleAnalytics.trackingId ? `
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', '${config.googleAnalytics.trackingId}', 'auto');
      ga('send', 'pageview');
    </script>
  ` : "";

  return `
       <!doctype html>
       <html lang="de" class="app">
           <head>
            <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/>
            <link rel="stylesheet" href="/css/semantic.min.css"/>
            <link rel="stylesheet" href="/css/font-awesome.min.css"/>
            ${process.env.NODE_ENV === 'production' ? '<link rel="stylesheet" href="/bundle.css"/>' : ''}
            ${head ? head.title.toString() + head.link.toString() + head.meta.toString() : ''}
           </head>
           <body>
               <div id="app" class="full"/><div>${html || ''}</div></div>
               ${data ? `<script>window.__data="${data}"</script>` : ''}
               <script src="/app.js"></script>
               ${tracking}
           </body>
       </html>
    `;
}
