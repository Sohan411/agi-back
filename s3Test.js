const { S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3client = new S3Client({
  region : 'ap-south-1',
  credentials : {
    accessKeyId:'AKIAS6GGC64POCZ2BBE5',
    secretAccessKey: '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'
  }
});

async function getObjectURL(key){
  const command = new GetObjectCommand({
    Bucket : 'agi-form',
    Key : `/${key}`
  });
  const url = await getSignedUrl(s3client,command)
  return url;
}

async function putObject(filename){
  const command = new PutObjectCommand({
    Bucket : 'agi-form',
    Key : `${filename}`,
  });
  const url = await getSignedUrl(s3client, command);
  return url;
}

async function fuck(){
  // console.log('url : ' ,await getObjectURL('ss.png'));
  console.log('url : ' ,await putObject('ss.png'));
}
fuck();