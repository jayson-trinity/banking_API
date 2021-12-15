const mongoose = require("mongoose")
const Schema = mongoose.Schema

const transactionSchema = new Schema(
  {
    client_id: {
      type: Schema.Types.ObjectId,
      ref: "client",
      required: true,
    },
    transaction_type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
)

module.exports = mongoose.model("transactions", transactionSchema)