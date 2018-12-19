import jwt
import datetime
import boto3
import os

def authenticate(event, context):
    userid = event['userid']
    password = event['password']
    secret = _getSecret()
    if userid == 'admin' and password == _getPassword():
        expiry = str(datetime.datetime.now() + datetime.timedelta(minutes = 5))
        byteJwt = jwt.encode(
            {
                'userid': userid,
                'expires': expiry
            }, 
            secret, 
            algorithm='HS256')
        stringJwt = byteJwt.decode('utf-8')
        return stringJwt
        
def _privateBucket():
    return os.environ['privateBucket']

def _getSecret():
    return _readFile(_privateBucket(),'generic-key')

def _getPassword():
    return _readFile(_privateBucket(),'password')

def _readFile(bucket,key):
    s3 = boto3.resource('s3')
    obj = s3.Object(bucket, key)
    return obj.get()['Body'].read().decode('utf-8')

def authorizer(event, context):
    payload = jwt.decode(event['authorizationToken'],_getSecret())
    expiry = datetime.datetime.strptime(payload['expires'],'%Y-%m-%d %H:%M:%S.%f')
    userid = payload['userid']
    effect = "Deny"
    if userid == 'admin' and expiry >  datetime.datetime.now():
        effect = "Allow"
    return {
        "principalId": "user|a1b2c3d4", 
        "policyDocument": { 
        "Version": "2012-10-17", 
        "Statement": [{ 
            "Action": "execute-api:Invoke", 
            "Effect": effect, 
            "Resource": os.environ['ResourceArn'] 
            }] 
        } 
    }

def readFile(event, context):
    key = event['key'] 
    bucket = os.environ['BucketName'] 
    return _readFile(bucket,key)

def writeFile(event, context):
    s3 = boto3.resource('s3')
    content = event['content'].encode("utf-8")
    key = event['key']
    bucketName = os.environ['BucketName']
    s3.Bucket(bucketName).put_object(Key=key,Body=content)
