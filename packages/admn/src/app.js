import moment from 'moment';
import cmsStore from './stores/cms';
import authStore from './stores/auth';
import restStore from './stores/rest';
import mediaStore from './stores/media';
import searchStore from './stores/search';
import routeCreator from './routes';
import * as edits from './edits';

// import Schema from './components/auto-form';

export default app => {
  // edits.add('Schema', Schema);
  const routes = routeCreator(app.routes, app.templates, app.frontend);
  const blocks = app.blocks || {};

   // Datum/Zeit-Locale
  moment.locale((app.locale || 'de'));
  return Object.assign({}, app, {
    store: {
      cms: cmsStore,
      auth: authStore,
      rest: restStore,
      media: mediaStore,
      search: searchStore,
    },
    routes: routes,
    blocks: blocks,
  });
};
