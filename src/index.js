// Initializing the Database
require('./db/mongoose')
// Requiring models
const Task = require('./models/task')
const User = require('./models/user')

// Requiring the packages
const express = require('express')

const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT 


// Configuring body parser to parse json data
app.use(bodyParser.json())



// Requiring routes
const userRoute = require('./routes/user')
const taskRoute = require('./routes/task')
app.use(userRoute)
app.use(taskRoute)

app.use('*',(req,res,next) => {
    res.status(404).send({error:'404 - page not found'})
})

app.listen(port,() => {
    console.log(`Serving on port ${port}`);
})

//#################################################

