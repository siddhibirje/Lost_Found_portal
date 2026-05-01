# 🔍 Virtual Lost & Found System

A fully serverless cloud application built on **AWS** that lets users report and browse lost and found items — with photo uploads, secure login, and real-time email alerts.

---

## 🏗️ AWS Services Used

| Service | Role |
|---|---|
| **Amazon Cognito** | User registration & login (Hosted UI) |
| **Amazon S3** | Stores item photos uploaded by users |
| **Amazon DynamoDB** | NoSQL database for lost & found item records |
| **AWS Lambda** | Serverless backend logic (Node.js 20.x) |
| **Amazon API Gateway** | HTTP REST API connecting frontend to Lambda |
| **Amazon SNS** | Email notifications for new item reports |


```



### 2. Create AWS resources (ap-south-1 region)

#### Cognito
1. Go to **AWS Console → Cognito → Create user pool**
2. Application type: **Single-page application (SPA)**
3. Sign-in identifier: **Email**
4. Enable self-registration
5. Return URL: `http://localhost:3000/signin.html`
6. Note down:
   - **User Pool ID** (e.g. `ap-south-1_XXXXXXX`)
   - **Client ID**
   - **Cognito domain**

#### S3
1. Go to **AWS Console → S3 → Create bucket**
2. Bucket name: `lost-found-images-<yourname>`
3. Region: `ap-south-1`
4. **Uncheck** "Block all public access"
5. Add this **Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::lost-found-images-<yourname>/*"
  }]
}
```
6. Add this **CORS configuration**:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": []
}]
```

#### DynamoDB
1. Go to **AWS Console → DynamoDB → Create table**
2. Create two tables:

| Table name | Partition key |
|---|---|
| `LostFoundItems` | `Id` (String) |
| `FoundItems` | `Id` (String) |

Both tables: billing mode = **On-demand**

#### Lambda
1. Go to **AWS Console → Lambda → Create function**
2. Create 4 functions — **Node.js 20.x**, Author from scratch:

| Function name | Purpose |
|---|---|
| `saveLostItem` | Save a lost item to DynamoDB |
| `saveFoundItem` | Save a found item to DynamoDB |
| `getLostItems` | Fetch all lost items |
| `getFoundItems` | Fetch all found items |

3. For each function → **Configuration → Permissions → click the role link → Attach policies**:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`

4. Paste the code below into each function and click **Deploy**.

<details>
<summary><strong>saveLostItem</strong></summary>

```js
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "ap-south-1" });

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  await client.send(new PutItemCommand({
    TableName: "LostFoundItems",
    Item: {
      "Id":       { S: crypto.randomUUID() },
      "name":     { S: body.name || "" },
      "location": { S: body.location || "" },
      "date":     { S: body.date || "" },
      "contact":  { S: body.contact?.toString() || "" },
      "remarks":  { S: body.remarks || "" },
      "imageUrl": { S: body.imageUrl || "" }
    }
  }));
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" },
    body: JSON.stringify({ message: "Lost item saved!" })
  };
};
```
</details>

<details>
<summary><strong>saveFoundItem</strong></summary>

```js
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "ap-south-1" });

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  await client.send(new PutItemCommand({
    TableName: "FoundItems",
    Item: {
      "Id":       { S: crypto.randomUUID() },
      "name":     { S: body.name || "" },
      "location": { S: body.location || "" },
      "date":     { S: body.date || "" },
      "contact":  { S: body.contact?.toString() || "" },
      "remarks":  { S: body.remarks || "" },
      "imageUrl": { S: body.imageUrl || "" }
    }
  }));
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" },
    body: JSON.stringify({ message: "Found item saved!" })
  };
};
```
</details>

<details>
<summary><strong>getLostItems</strong></summary>

```js
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "ap-south-1" });

export const handler = async () => {
  const data = await client.send(new ScanCommand({ TableName: "LostFoundItems" }));
  const items = data.Items.map(i => ({
    name: i.name?.S, location: i.location?.S,
    date: i.date?.S, contact: i.contact?.S,
    remarks: i.remarks?.S, imageUrl: i.imageUrl?.S
  }));
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" },
    body: JSON.stringify(items)
  };
};
```
</details>

<details>
<summary><strong>getFoundItems</strong></summary>

```js
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "ap-south-1" });

export const handler = async () => {
  const data = await client.send(new ScanCommand({ TableName: "FoundItems" }));
  const items = data.Items.map(i => ({
    name: i.name?.S, location: i.location?.S,
    date: i.date?.S, contact: i.contact?.S,
    remarks: i.remarks?.S, imageUrl: i.imageUrl?.S
  }));
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" },
    body: JSON.stringify(items)
  };
};
```
</details>

#### API Gateway
1. Go to **AWS Console → API Gateway → Create API → HTTP API**
2. Add 4 integrations (one per Lambda function)
3. API name: `lost-found-api`
4. Configure routes:

| Method | Path | Integration |
|---|---|---|
| POST | `/lostitem` | saveLostItem |
| GET | `/lostitem` | getLostItems |
| POST | `/founditem` | saveFoundItem |
| GET | `/founditem` | getFoundItems |

5. Configure **CORS**:
   - Allow origin: `*`
   - Allow headers: `content-type`
   - Allow methods: `GET, POST, OPTIONS`
6. Deploy to `$default` stage → copy the **Invoke URL**

#### SNS (optional)
1. Go to **AWS Console → SNS → Create topic**
2. Type: **Standard**, Name: `LostFoundAlerts`
3. Create a subscription → Protocol: **Email** → enter your email
4. Confirm the subscription from your inbox

---

### 3. Update the JS config files

Replace placeholders in these files with your actual AWS values:

**`main.js`**
```js
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/<YOUR_USER_POOL_ID>",
  client_id: "<YOUR_CLIENT_ID>",
  redirect_uri: "http://localhost:3000/signin.html",
  response_type: "code",
  scope: "email openid phone"
};
```

**`lost.js`, `found.js`, `uploading.js`, `postlost.js`, `submit.js`**
```js
var API_ENDPOINT = "https://<YOUR_API_ID>.execute-api.ap-south-1.amazonaws.com/lostitem";
// use /founditem for found.js and uploading.js
```

**`reportlost.html`** — S3 upload URL:
```js
const s3Url = `https://<YOUR_BUCKET_NAME>.s3.ap-south-1.amazonaws.com/${fileName}`;
```

---

### 4. Run the app

```bash
npx serve .
```

Open `http://localhost:3000/index.html` in your browser.

---

## 🔄 How It Works

```
User clicks Sign In
  → Cognito Hosted UI (login / register)
  → Redirect back to signin.html with auth code
  → Session established

User fills Report Lost form + uploads photo
  → Photo PUT directly to S3 → public URL generated
  → Form data + imageUrl POST to API Gateway
  → Lambda saveLostItem writes record to DynamoDB
  → Success alert → redirect to lostitems.html

User views Lost Items
  → GET request to API Gateway
  → Lambda getLostItems scans DynamoDB
  → Items rendered in table
```

---

## 🧪 Test Cases

| # | Test | Expected |
|---|---|---|
| 1 | Register via Cognito | User appears in Cognito console |
| 2 | Login & redirect | Session loaded on signin.html |
| 3 | Submit lost item (no image) | Record in DynamoDB LostFoundItems |
| 4 | Submit lost item (with image) | Image in S3 + imageUrl in DynamoDB |
| 5 | Submit found item | Record in DynamoDB FoundItems |
| 6 | View lost items | Table populated from DynamoDB |
| 7 | View found items | Table populated from DynamoDB |
| 8 | CORS check | No errors in browser console |
| 9 | SNS subscription | Confirmation email received |
| 10 | Multiple submissions | Each stored with unique UUID |

---

## 🌐 AWS Resource Reference

| Resource | Value |
|---|---|
| Region | `ap-south-1` |
| Cognito User Pool ID | `ap-south-1_2ZvLIx3Nt` |
| Cognito Client ID | `5equ5odtfc32s32a4gsc063nhs` |
| Cognito Domain | `ap-south-12zvlix3nt.auth.ap-south-1.amazoncognito.com` |
| S3 Bucket | `lost-found-images-aemu3` |
| DynamoDB Table 1 | `LostFoundItems` |
| DynamoDB Table 2 | `FoundItems` |
| API Gateway | `lost-found-api` |
| API Invoke URL | `https://jry0c2aolh.execute-api.ap-south-1.amazonaws.com` |
| SNS Topic | `LostFoundAlerts` |

---

## 🚀 Future Enhancements

- [ ] Item matching — auto-notify owner when a match is found
- [ ] Amazon Rekognition — auto-tag images with labels
- [ ] Host frontend on S3 + CloudFront
- [ ] Admin dashboard with Amazon QuickSight
- [ ] Mobile app with AWS Amplify
- [ ] Item expiry via EventBridge scheduled Lambda


---

> Built as part of the Cloud Computing Lab (CCL) Mini Project — April 2026