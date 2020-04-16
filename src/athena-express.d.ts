declare module 'athena-express' {
  // @see https://github.com/ghdna/athena-express#advance-config-parameters
  interface AthenaExpressConfig {
    aws: any;
    /**
     * The location in Amazon S3 where your query results are stored, such as `s3://path/to/query/bucket/`.
     *
     * `athena-express` will create a new bucket for you if you don't provide a value for this param but sometimes that could cause an issue if you had recently deleted a bucket with the same name. (something to do with cache). When that happens, just specify you own bucket name. Alternatively you can also use `workgroup`.
     */
    s3?: string;
    /**
     * Athena database name that the SQL queries should be executed in. When a db name is specified in the config, you can execute SQL queries without needing to explicitly mention DB name. e.g.
     * @example
     * athenaExpress.query("SELECT * FROM movies LIMIT 3")
     *
     * as opposed to
     * @example
     * athenaExpress.query({sql: "SELECT * FROM movies LIMIT 3", db: "moviedb"});
     */
    db?: string;
    /**
     * The name of the workgroup in which the query is being started.
     * Note: athena-express cannot create workgroups (as it includes a lot of configuration) so you will need to create one beforehand IFF you intend to use a non default workgroup.
     */
    workgroup?: string;
    /** Override as false if you rather get the raw unformatted output from S3. */
    formatJson?: boolean;
    /** Wait interval between re-checking if the specific Athena query has finished executing */
    retry?: number;
    /**
     * Set `getStats: true` to capture additional metadata for your query, such as:
     * - EngineExecutionTimeInMillis
     * - DataScannedInBytes
     * - TotalExecutionTimeInMillis
     * - QueryQueueTimeInMillis
     * - QueryPlanningTimeInMillis
     * - ServiceProcessingTimeInMillis
     * - DataScannedInMB
     * - QueryCostInUSD
     * - Count
     * - QueryExecutionId
     * - S3Location
     */
    getStats?: boolean;
    /** Ignore fields with empty values from the final JSON response. */
    ignoreEmpty?: boolean;
    /** [Encryption configuation](https://docs.aws.amazon.com/athena/latest/ug/encryption.html) example usage:
     * @example
     * { EncryptionOption: "SSE_KMS", KmsKey: process.env.kmskey}
     */
    encryption?: any;
    /**
     * For a unique requirement where a user may only want to execute the query in Athena and store the results in S3 but NOT fetch those results in that moment.
     * Perhaps to be retrieved later or simply stored in S3 for auditing/logging purposes.
     * Best used with a combination of getStats : true so that the QueryExecutionId & S3Location can be captured for later reference.
     */
    skipResults?: true;
  }

  export default class AthenaExpress {
    constructor(config: AthenaExpressConfig);

    query<T = any>(query: string | { sql: string; db: string }): Promise<{ Items: T[] }>;
  }
}
