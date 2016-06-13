import {Browser} from 'admn';
import app from './app';

if (module.hot) {
  module.hot.accept();
}

Browser(app);
