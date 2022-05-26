const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require ('jsonwebtoken');
require('dotenv').config()
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
// middle
app.use(cors());
const corsConfig = {
    origin: true,
    credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))
app.use(express.json())

// mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.czo1g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 // jwt verify function
function verifyJwt(req, res ,next){
  const authHeader =req.headers.authorization 
  if(!authHeader){
    return res.status(401).send({message:'UnAuthorized access'})
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.DB_TOKEN, function(err, decoded) {
    if(err){
     return res.status(403).send({message:'Forbidden access'})
    }
    req.decoded = decoded
    next()
  });
}
async function run(){
    try{
        await client.connect();
     // tableFanToolsCollection
     const toolsCollection = client.db('table_fan').collection('tools')
    //  table user collection
    const userCollection = client.db('table_fan').collection('users')
    //  table user collection
    const reviewCollection = client.db('table_fan').collection('review')
    //  table user collection
    const orderCollection = client.db('table_fan').collection('order')
    //  table user collection
    const profileCollection = client.db('table_fan').collection('profile')
    //  admin verify
     const verifyAdmin = async (req,res ,next) =>{
      const requester = req.decoded.email 
      const requestedAccount = await userCollection.findOne({email:requester})
      if(requestedAccount.role === 'admin'){
        next()
      }
      else{
        res.status(403).send({message:'forbidden'})
      }

    }
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
    // my profile
    app.post('/profile' ,async(req,res)=>{
      const profiles = req.body
      const result = await profileCollection .insertOne(profiles)
      res.send(result)
    })
    // put  order all information
    app.post('/order' ,async(req,res)=>{
      const order = req.body
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })
    // get all order
    app.get('/order' ,async(req,res)=>{
      const query ={}
      const cursor = orderCollection.find(query)
      const ordersAll = await cursor.toArray()
      res.send(ordersAll)
     })
    //  get order by email
     app.get('/order/:email' ,async(req , res)=>{
      const email = req.query.email
      console.log(email)
      const query ={email:email}
      const cursor = orderCollection.find(query)
      const orderEmail = await cursor.toArray()
      res.send(orderEmail)
      })
    // get order payment by id 
    app.get('/orderPayment/:id',verifyJwt ,async(req ,res)=>{
      const id = req.params.id;
      const query ={_id: ObjectId(id)}
      const orderPayment = await orderCollection.findOne(query)
      res.send(orderPayment)
    })

    // order payment
    // app.post('/create-payment-intent', verifyJwt , async(req, res) =>{
    //   const orderPrice = req.body;
    //   const totalPrice = orderPrice.totalPrice;
    //   const amount = totalPrice*100;
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount : amount,
    //     currency: 'usd',
    //     payment_method_types:['card']
    //   });
    //   res.send({clientSecret: paymentIntent.client_secret})
    // });
     // post review part start
     app.post('/review', verifyJwt ,async(req,res)=>{
      const tools = req.body
      const result = await reviewCollection .insertOne(tools)
      res.send(result)
    })
    // get review
      app.get('/review', verifyJwt  ,async(req,res)=>{
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
        const token = jwt.sign({email:email }, process.env.DB_TOKEN , {  expiresIn: '24h' });
        res.send({result ,token })
      })

      // get all user
      app.get('/user' ,verifyJwt ,async(req,res)=>{
        const query ={}
        const cursor = userCollection.find(query)
        const tools = await cursor.toArray()
        res.send(tools)
       })

      // creat admin 
       app.put('/user/admin/:email' ,verifyJwt,verifyAdmin,async(req,res)=>{
        const email=req.params.email
        const filter = { email:email };
        const updateDoc = {
          $set:{role:'admin'}
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result)  
      })
       // get admin form user
       app.get('/admin/:email' , async(req , res)=>{
        const email =req.params.email 
        const user =await userCollection.findOne({email:email})
        const isAdmin = user.role === 'admin'
        res.send({admin:isAdmin})

      })
      // purchase product
      app.get('/tools/:id', verifyJwt , async(req , res)=>{
        const id = req.params.id
        const query = {_id:ObjectId(id)}
        const tools = await toolsCollection.findOne(query)
        res.send(tools)
    })
       // put quantity
       app.put( '/tools/:id' , async(req , res)=>{
        const id = req.params.id 
        const quantityIncrease = req.body
        // console.log(quantityIncrease)
        // res.send(quantityIncrease.quantity)
        const filter = {_id: ObjectId(id)}
        const options = {upsert :true}
        // res.send(filter)
        const updateDoc ={
            $set:{
              quantity:quantityIncrease.quantity
                // quantityIncrease
            }
        }
        
        const result = await toolsCollection .updateOne(filter,updateDoc , options)
        // console.dir(result)
        res.send(result)
        
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