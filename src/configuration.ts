import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'MySQLService',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MySQLConfiguration {
  async onReady() {
    // TODO something
  }
}
