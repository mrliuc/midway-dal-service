import { createLightApp } from '@midwayjs/mock';
import * as mysql from '../src';

describe('/test/index.test.ts', () => {
  it('test component', async () => {
    const app = await createLightApp('', {
      imports: [
        mysql
      ]
    });
    const MySQLService = await app.getApplicationContext().getAsync(mysql.MySQLService);
    expect(await MySQLService._test('test')).toEqual('test');
  });
});
