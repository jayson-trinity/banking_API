const mongoose = require("mongoose")
const Schema = mongoose.Schema

const clientSchema = new Schema({
  first_name: {
    type : String,
    required : true,
  },
  last_name: {
    type : String,
    required : true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  account_balance:{
    type: Number,
    default: 0,
  }
})

module.exports = mongoose.model("client", clientSchema)