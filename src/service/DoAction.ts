import { Drive } from './Drive';

export class DoAction<T extends number | any[]> {
  constructor(drive: Drive, options) {
    this.drive = drive;
    this.options = options;
  }

  private drive: Drive;
  private options: any;

  exec(callback?: any, isDebug?: boolean) {
    if (isDebug) {
      console.log(this.options);
    }

    Error.captureStackTrace(this);
    return this.drive.exec<T>(this.options, callback).catch(err => {
      //   if (err) {
      // eslint-disable-next-line no-param-reassign
      // err.stack += `\n-----------------------\n${this.stack}`;
      //   }
      console.error(err);
      throw err;
    });
  }
}
