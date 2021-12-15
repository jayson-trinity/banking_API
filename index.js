const express = require ("express");
const morgan = require('morgan');
require('dotenv').config();
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app = express();
const port = process.env.PORT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY


let count = 0;
const Client = require("./models/client")
const Transaction = require ("./models/transaction")
const auth = require ("./middlewares/auth")






app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));


//setup MongoDB 
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI

//ping request
app.get('/ping', (req, res) => {
    count ++
    res.status(200).send('There has been ' + count + ' requests since the server started')
});


//register/ add client [ADMIN]
app.post("/register", async (req, res) => {
    const data = req.body
  
    try {
      const passwordHash = await bcrypt.hash(data.password, 10)
      const client = await new Client ({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: passwordHash
      }).save()
  
      const token = jwt.sign({ client_id: client._id }, JWT_SECRET_KEY, { expiresIn: 60 * 10 })
  
      res.status(201).send({
        message: "Client created",
        data: {
          token,
          client_id: client._id,
          first_name: client.first_name,
          last_name : client.lastname,
          email: client.email,
          account_balance: client.account_balance
        }
      })
    } catch (error) {
      res.status(400).send({ message: "Client couldn't be created", error })
    }
  
})

// ADMIN delete client
app.delete("/delete", auth(), async (req, res) => {

  try {
    const client = await Client.findByIdAndDelete(req.USER_ID)
    res.status(200).send({ message: "Client deleted", data: client })
  } catch (error) {
    res.status(400).send({ message: "Couldn't delete client", error })
  }
})


//login
app.post("/login", async (req, res) => {
    const data = req.body
  
    try {
      const client = await Client.findOne({ email: data.email })
      if (!client) return res.status(400).send({ message: "Invalid email or password" })
      const isValidPassword = await bcrypt.compare(data.password, client.password)
      if (!isValidPassword) return res.status(400).send({ message: "Invalid email or password" })
  
      const token = jwt.sign({ client_id: client._id }, JWT_SECRET_KEY)
  
      res.status(200).send({
        message:"Successful login",
        data: {
          token,
          client_id: client._id,
          email: client.email
        }
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({ message: "Unable to login", error })
    }
  
})


//make transaction
app.put("/transaction", auth(), async (req, res) => {
  const data = req.body

  const client = await Client.findOne({_id: req.CLIENT_ID})

  try {
    const trans = await new Transaction({
      transaction_type: data.transaction_type,
      amount: data.amount,
      client_id: req.CLIENT_ID
    }).save()

    if (data.transaction_type === "deposit") {
      data.amount += client.account_balance;
      return res.status(200).send({ message: "deposit successfull", data: trans })
    } else if (data.transaction_type === "withdrawal") {
      return res.status(200).send({ message: "withdrawal successfull", data: trans })
    } else if (data.transaction_type === "transfer") {
      return res.status(200).send({ message: "Transfer successfull", data: trans })
    }else {
      return res.status(200).send({ message: "Transaction failed", data: trans })
    } 
  } catch (error) {
    res.status(400).send({ message: "Transaction Unsuccessfull", error })
    console.log(error)
  }
  

})

//transaction history
app.get("/transaction/:client_id", auth(), async (req, res) => {
  try {
    const history = await Transaction.find({client_id : req.params.client_id }).select("-_id -__v")
    res.status(200).send({ message: "Displaying all Transactions", data: history})
  } catch (error) {
    res.status(400).send({ message: "Unable to display Transactions", error })
  }
})


//check account balance
app.get("/balance/:client_id", auth(), async (req, res) => {
  try {
    const balance = await Client.findById(req.params.client_id).select("account_balance")
    res.status(200).send({ message: "Displaying account balance", data : balance })
  } catch (error) {
    res.status(400).send({ message: "Unable to display account balance", error })
  }
})

app.listen(port, async () => {
    try {
      await mongoose.connect(MONGODB_URI)
      console.log('✅Connected to MongoDB database')
    } catch (error) {
      console.log("🚩🚩🚩 Couldn't connect to database ", error)
    }
  
    console.log(`✔ listening on http://127.0.0.1:${port}`)
});  

