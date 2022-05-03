export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    MySQLService?: PowerPartial<{
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    }>;
  }
}
