const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
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
     // tableFanToolsCollection
     const toolsCollection = client.db('table_fan').collection('tools')
    //  table user collection
    const userCollection = client.db('table_fan').collection('users')
    //  table user collection
    const reviewCollection = client.db('table_fan').collection('review')

    // get user fan tool
     app.get('/tools' ,async(req,res)=>{
      const query ={}
      const cursor = toolsCollection.find(query)
      const tools = await cursor.toArray()
      res.send(tools)
     })

     // post tools add product
     app.post('/tools' ,async(req,res)=>{
      const tools = req.body
      const result = await toolsCollection .insertOne(tools)
      res.send(result)
    })
     // delete tools add product
     app.delete('/tools/:id' ,async(req,res)=>{
      const id = req.params.id
      const query = {_id: ObjectId(id)}
      const result = await toolsCollection .deleteOne(query)
      res.send(result)
    })
     // post review part start
     app.post('/review' ,async(req,res)=>{
      const tools = req.body
      const result = await reviewCollection .insertOne(tools)
      res.send(result)
    })
    // get review
      app.get('/review' ,async(req,res)=>{
      const query ={}
      const cursor = reviewCollection.find(query)
      const review = await cursor.toArray()
      res.send(review)
     })
    
      // user update in mongodb  
      app.put('/user/:email' ,async(req,res)=>{
        const email=req.params.email
        const user = req.body
        const filter = { email:email };
        const options = { upsert: true };
        const updateDoc = {
          $set:user
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
      })

      // get all user
      app.get('/user' ,async(req,res)=>{
        const query ={}
        const cursor = userCollection.find(query)
        const tools = await cursor.toArray()
        res.send(tools)
       })

    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World table fan parts!')
})

app.listen(port, () => {
  console.log(`table fan parts listening on port ${port}`)
})