const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000
// middle
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello World table fan parts!')
})

app.listen(port, () => {
  console.log(`table fan parts listening on port ${port}`)
})