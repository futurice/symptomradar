const ENV = "dev" // or prod

const DATABASE = `symptomradar_${ENV}_storage`
const OUTPUT_LOCATION = `s3://symptomradar-${ENV}-storage-results/query/`
const query = "SELECT * FROM responses LIMIT 3;"

const AthenaExpress = require("athena-express"),
    aws = require("aws-sdk"),
    awsCredentials = {
        region: "eu-west-1"
    };

aws.config.update(awsCredentials);

const athenaExpressConfig = {
    aws,
    s3: OUTPUT_LOCATION,
    formatJson: true,
    ignoreEmpty: true,
    getStats: true
};

const athenaExpress = new AthenaExpress(athenaExpressConfig);

(async () => {
    let myQuery = {
        sql: query,
        db: DATABASE
    };

    try {
        let results = await athenaExpress.query(myQuery);
        console.log(results);
    } catch (error) {
        console.log(error);
    }
})();

console.log('Done');
