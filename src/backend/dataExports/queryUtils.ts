import { flatten } from 'lodash';
import { stringLiteralUnionFields } from '../../common/model';

/**
 * Form a list of query fields from response models union fields
 *
 * @example
 * ```js
 * mapResponseFieldsToQuery((field, value) =>
 *  `IF(${field} = '${value}', 1, 0) AS ${field}_${value}`
 * )
 * ```
 * Output:
 * ```sql
 * IF(fever = 'no', 1, 0) AS fever_no,
 * IF(fever = 'slight', 1, 0) AS fever_slight,
 * IF(fever = 'high', 1, 0) AS fever_high,
 * ...
 * ```
 */
export function mapResponseFieldsToQuery(fn: (field: string, value: string) => string) {
  return flatten(stringLiteralUnionFields.map(([field, values]) => values.map(value => fn(field, value)))).join(',\n');
}
