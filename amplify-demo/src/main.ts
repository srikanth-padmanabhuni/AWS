import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Amplify } from '@aws-amplify/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as configuration from './configuration.json';

Amplify.configure(configuration);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
