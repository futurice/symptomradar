import * as AWS from 'aws-sdk';

const ssm = new AWS.SSM(); // note: for local development, you may need to: AWS.config.update({ region: 'eu-west-1' });

// Fetches a correctly prefixed secret value from AWS Systems Manager Parameter Store (SSM)
export async function getSecret(name: 'secret-pepper') {
  const fullName = process.env.SSM_SECRETS_PREFIX + name;
  console.log(`Getting secret "${fullName}"`);
  try {
    const data = await ssm
      .getParameters({
        Names: [fullName],
        WithDecryption: true,
      })
      .promise();
    return (data.Parameters || [])[0].Value || '';
  } catch (err) {
    throw new Error(`Couldn't get secret "${fullName}" (caused by\n${err}\n)`);
  }
}
