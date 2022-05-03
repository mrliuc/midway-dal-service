import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { Drive } from './Drive';
import { DoAction } from './DoAction';
import { DMLType } from './DMLType';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MySQLService {
  // constructor() {
  // DMLType = {
  //   INSERT: 1,
  //   UPDATE: 2,
  //   DELETE: 3,
  //   SELECT: 4,
  //   UPDATE_INSERT: 5,
  //   COUNT: 6,
  // };
  // }

  @Config('MySQLService')
  config;

  private mysql: any;

  _test(val) {
    return val;
  }

  getDrive() {
    if (!this.mysql) {
      this.mysql = new Drive(this.config);
      // Object.assign(this, this.mysql);
    }
    return this.mysql;
  }

  static getWheres(whereAnd, whereOr, param, index) {
    const whereAnds = [];
    const whereOrs = [];

    index = index === undefined ? '' : index;

    if (whereAnd) {
      if (whereAnd instanceof Array) {
        whereAnd.forEach((item, i) => {
          const op = item.length > 2 ? item[2] : '=';
          const key = item[0];
          const val = item[1];

          let table = '';
          let columnName = key;

          const dot = key.indexOf('.');
          if (dot > 0) {
            table = key.substr(0, dot + 1);
            columnName = key.substr(dot + 1, key.length - dot);
          }

          const pKey = `wa_${columnName}${index}${i}_End`;

          if (val instanceof Array) {
            if (val.length === 1) {
              whereAnds.push(
                MySQLService.formatOp(`${table}${columnName}`, `:${pKey}`, op)
              );
              param[pKey] = val[0];
            } else {
              whereAnds.push(` ${table}${columnName} in (:${pKey}) `);
              param[pKey] = val;
            }
          } else if (columnName.indexOf('@') === 0) {
            whereAnds.push(
              MySQLService.formatOp(
                `${table}${columnName.replace(/@/g, '')}`,
                `${val.replace('@', ':')}`,
                op
              )
            );
          } else if (val === null) {
            whereAnds.push(` ${table}${columnName} is null `);
          } else {
            whereAnds.push(
              MySQLService.formatOp(`${table}${columnName}`, `:${pKey}`, op)
            );
            param[pKey] = val;
          }
        });
      } else {
        Object.keys(whereAnd).forEach((key, i) => {
          let table = '';
          let columnName = key;
          const dot = key.indexOf('.');
          if (dot > 0) {
            table = key.substr(0, dot + 1);
            columnName = key.substr(dot + 1, key.length - dot);
          }

          const pKey = `wa_${columnName}${index}${i}_End`;

          if (whereAnd[key] instanceof Array) {
            if (whereAnd[key].length === 1) {
              whereAnds.push(` ${table}${columnName}=:${pKey}`);
              param[pKey] = whereAnd[key][0];
            } else {
              whereAnds.push(` ${table}${columnName} in (:${pKey}) `);
              param[pKey] = whereAnd[key];
            }
          } else if (columnName.indexOf('@') === 0) {
            whereAnds.push(
              ` ${table}${columnName.replace(/@/g, '')}=${whereAnd[key].replace(
                '@',
                ':'
              )}`
            );
          } else if (whereAnd[key] == null) {
            whereAnds.push(` ${table}${columnName} is null `);
          } else {
            whereAnds.push(` ${table}${columnName}=:${pKey} `);
            param[pKey] = whereAnd[key];
          }
        });
      }
    }

    if (whereOr) {
      if (whereOr instanceof Array) {
        whereOr.forEach((item, i) => {
          const op = item.length > 2 ? item[2] : '=';
          const key = item[0];
          const val = item[1];

          let table = '';
          let columnName = key;

          const dot = key.indexOf('.');
          if (dot > 0) {
            table = key.substr(0, dot + 1);
            columnName = key.substr(dot + 1, key.length - dot);
          }

          const pKey = `wo_${columnName}${index}${i}_End`;

          if (val instanceof Array) {
            if (val.length === 1) {
              whereOrs.push(
                MySQLService.formatOp(`${table}${columnName}`, `:${pKey}`, op)
              );
              param[pKey] = val[0];
            } else {
              whereOrs.push(` ${table}${columnName} in (:${pKey}) `);
              param[pKey] = val;
            }
          } else if (columnName.indexOf('@') === 0) {
            whereOrs.push(
              MySQLService.formatOp(
                `${table}${columnName.replace(/@/g, '')}`,
                `${val.replace('@', ':')}`,
                op
              )
            );
          } else if (val === null) {
            whereOrs.push(` ${table}${columnName} is null `);
          } else {
            whereOrs.push(
              MySQLService.formatOp(`${table}${columnName}`, `:${pKey}`, op)
            );
            param[pKey] = val;
          }
        });
      } else {
        Object.keys(whereOr).forEach((key, i) => {
          let table = '';
          let columnName = key;

          const dot = key.indexOf('.');
          if (dot > 0) {
            table = key.substr(0, dot + 1);
            columnName = key.substr(dot + 1, key.length - dot);
          }
          const pKey = `wo_${columnName}${index}${i}_End`;

          if (whereOr[key] instanceof Array) {
            if (whereOr[key].length === 1) {
              whereOrs.push(` ${table}${columnName}=:${pKey}`);
              param[pKey] = whereOr[key][0];
            } else {
              whereOrs.push(` ${table}${columnName} in (:${pKey})`);
              param[pKey] = whereOr[key];
            }
          } else if (columnName.indexOf('@') === 0) {
            whereOrs.push(
              ` ${table}${columnName.replace(/@/g, '')}=${whereOr[key].replace(
                '@',
                ':'
              )}`
            );
          } else if (whereOr[key] == null) {
            whereOrs.push(` ${table}${columnName} is null `);
          } else {
            whereOrs.push(` ${table}${columnName}=:${pKey}`);
            param[pKey] = whereOr[key];
          }
        });
      }
    }
    const wheres = [];

    if (whereAnds.length > 0) {
      wheres.push(`(${whereAnds.join(' and ')})`);
    }

    if (whereOrs.length > 0) {
      wheres.push(`(${whereOrs.join(' or ')})`);
    }

    return wheres;
  }

  static formatOp(filed, value, op = '=') {
    switch (op) {
      case '-=':
        return `${filed}=${filed}-${value}`;
      case '+=':
        return `${filed}=${filed}+${value}`;
      default:
        return `${filed} ${op} ${value}`;
    }
  }

  static getUpdateSql(option, param, index) {
    let sql = ' update ';
    sql += `${option.table} set `;

    const columnNames = [];

    if (option.data instanceof Array) {
      option.data.forEach(item => {
        const key = item[0];
        const val = item[1];
        const op = item.length > 2 ? item[2] : '=';

        if (key.indexOf('@') === 0) {
          columnNames.push(
            MySQLService.formatOp(
              key.replace(/@/g, ''),
              val.replace('@', ':'),
              op
            )
          );
        } else {
          columnNames.push(MySQLService.formatOp(key, `:${key}${index}`, op));
          param[key + index] = val;
        }
      });
    } else {
      Object.keys(option.data).forEach(key => {
        if (key.indexOf('@') === 0) {
          columnNames.push(
            `${key.replace(/@/g, '')}=${option.data[key].replace('@', ':')}`
          );
        } else {
          columnNames.push(`${key}=:${key}${index}`);
          param[key + index] = option.data[key];
        }
      });
    }
    sql += columnNames.join(',');

    return sql;
  }

  static getInsertSql(option, param, index) {
    let sql = ' insert ';
    sql += option.table;

    const columnNames = [];
    const valueNames = [];

    Object.keys(option.data).forEach(key => {
      columnNames.push(key.replace(/@/g, ''));
      if (key.indexOf('@') === 0) {
        valueNames.push(option.data[key].replace('@', ':'));
      } else {
        valueNames.push(`:${key}${index}`);
        param[key + index] = option.data[key];
      }
    });

    sql += `(${columnNames.join(',')})`;

    sql += ` values(${valueNames.join(',')}) `;

    return sql;
  }

  dmls(options): DoAction {
    for (let index = 0; index < options.length; index++) {
      const option = options[index];
      if (!option.DMLType) {
        continue;
      }
      let sql = '';
      const param = {};
      switch (option.DMLType) {
        case DMLType.SELECT:
          {
            sql += ' select ';

            let columnNames = [];

            if (option.groupColumns && option.groupColumns.length > 0) {
              columnNames = columnNames.concat(option.groupColumns);
            }

            if (option.columns && option.columns.length > 0) {
              columnNames = columnNames.concat(option.columns);
            }

            if (columnNames.length > 0) {
              sql += columnNames.join(',');
            } else {
              sql += `${option.table}.*`;
            }

            let from = ` from ${option.table}`;

            if (option.join) {
              from += ` join ${option.join.table}`;
              from += ` on ${option.join.on} `;
            }

            if (option.joins) {
              for (const join of option.joins) {
                from += ` join ${join.table}`;
                from += ` on ${join.on} `;
              }
            }

            if (option.leftJoins) {
              for (const join of option.leftJoins) {
                from += ` left join ${join.table}`;
                from += ` on ${join.on} `;
              }
            }

            sql += from;

            const wheres = MySQLService.formatWheres(option, param, index);

            if (wheres) {
              sql += ` where ${wheres}`;
            }

            if (option.orderBys && option.orderBys.length > 0) {
              sql += ` order by ${option.orderBys.join(',')}`;
            }

            if (option.orderByDescs && option.orderByDescs.length > 0) {
              sql += ` order by ${option.orderByDescs.join(',')} desc`;
            }

            if (option.groupBys && option.groupBys.length > 0) {
              sql += ` group by ${option.groupBys.join(',')}`;
            }

            if (option.top) {
              sql += ` limit 0,${option.top} `;
            }

            if (option.page) {
              sql += ' limit :pageStart,:pageLength';
              param['pageStart'] = option.page.start;
              param['pageLength'] = option.page.length;

              sql += ';';

              let totalSql = ' select count(*) Total';
              totalSql += from;
              if (wheres) {
                totalSql += ` where ${wheres}`;
              }
              options.splice(index + 1, 0, { sql: totalSql, param });
            }
            sql += ';';
          }
          break;
        case DMLType.INSERT:
          sql += `${MySQLService.getInsertSql(option, param, index)};`;
          break;
        case DMLType.UPDATE:
          {
            sql += MySQLService.getUpdateSql(option, param, index);

            const wheres = MySQLService.formatWheres(option, param, index);

            if (wheres) {
              sql += ` where ${wheres}`;
            }
            sql += ';';
          }
          break;
        case DMLType.DELETE:
          {
            sql += ' delete from ';
            sql += option.table;

            const wheres = MySQLService.formatWheres(option, param, index);

            if (wheres) {
              sql += ` where ${wheres}`;
            }
            sql += ';';
          }
          break;
        case DMLType.UPDATE_INSERT:
          {
            const supportKeys = [
              'DMLType',
              'table',
              'data',
              'whereAnd',
              'affected',
              'identity',
            ];

            if (Object.keys(option).find(key => !supportKeys.includes(key))) {
              throw new Error('存在不支持的option选项');
            }

            const tempData = { ...option.data };

            Object.assign(option.data, option.whereAnd);
            sql += MySQLService.getInsertSql(option, param, index);

            sql += ' on duplicate key update ';

            const updates = [];

            for (const key in tempData) {
              if (Object.prototype.hasOwnProperty.call(option.whereAnd, key)) {
                continue;
              }
              updates.push(`${key}=:${key}${index}`);
            }

            sql += updates.join(',');
            sql += ';';
          }
          break;
        case DMLType.COUNT:
          {
            sql += ` select count(1) Count from ${option.table}`;

            const wheres = MySQLService.formatWheres(option, param, index);

            if (wheres) {
              sql += ` where ${wheres}`;
            }

            sql += ';';
          }
          break;
        default:
          throw new Error(`未定义的DMLType:${option.DMLType}`);
      }

      option.sql = sql;
      option.param = param;
    }
    // console.log(sql);
    // console.log(param);
    // options.splice(index + 1, 0, { sql: totalSql, param: param });

    // Object.keys(newOptions).forEach(function)

    // console.log(options);
    return new DoAction(this.getDrive(), options);
  }

  static formatWheres(option, param, index) {
    let wheres = MySQLService.getWheres(
      option.whereAnd,
      option.whereOr,
      param,
      index
    );

    if (option.whereOrs) {
      option.whereOrs.forEach((whereOr, i) => {
        wheres = wheres.concat(
          MySQLService.getWheres(null, whereOr, param, `A${index}_${i}`)
        );
      });
    }

    let whereStr = wheres.join(' and ');

    if (option.ors) {
      let ors = [];
      if (option.ors) {
        option.ors.forEach((or, i) => {
          ors = ors.concat(
            MySQLService.getWheres(null, or, param, `B${index}_${i}`)
          );
        });
      }

      if (ors.length > 0) {
        whereStr = [...(whereStr ? [whereStr] : []), ors.join(' or ')].join(
          ' or '
        );
      }
    }

    return whereStr;
  }

  select(option): DoAction {
    option.DMLType = DMLType.SELECT;
    return this.dmls([option]);
    // console.log(param);
  }

  // var option = {
  //    data: {Id:1, Name:'sdaf'},
  //    table: 'Test'
  // };

  insert(option) {
    option.DMLType = DMLType.INSERT;
    return this.dmls([option]);
  }

  // var option = {
  //    data: {Id:1, Name:'sdaf'},
  //    table: 'Test',
  //    whereAnd: {Id:1 },
  //    whereOr: { Id: 1, Name:'1231'}
  // };

  update(option) {
    option.DMLType = DMLType.UPDATE;
    return this.dmls([option]);
  }

  updateOrInsert(option) {
    option.DMLType = DMLType.UPDATE_INSERT;
    return this.dmls([option]);
  }

  // var option = {
  //    table: 'Test',
  //    whereAnd: {Id:1 },
  //    whereOr: { Id: 1, Name:'1231'}
  // };
  delete(option) {
    option.DMLType = DMLType.DELETE;
    return this.dmls([option]);
  }

  count(option) {
    option.DMLType = DMLType.COUNT;
    return this.dmls([option]);
  }

  sql(option) {
    return new DoAction(this.getDrive(), [option]);
  }
}
