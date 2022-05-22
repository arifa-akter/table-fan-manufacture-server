const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
// middle
app.use(cors())
app.use(express.json())

// mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.czo1g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        console.log('data base connected')
    }
    finally{

    }
}
run().catch(console.dir);

// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log('db connect')
//   // perform actions on the collection object
//   client.close();
// });

app.get('/', (req, res) => {
  res.send('Hello World table fan parts!')
})

app.listen(port, () => {
  console.log(`table fan parts listening on port ${port}`)
})