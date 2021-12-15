const jwt = require("jsonwebtoken")
const Client = require("./../models/client")

module.exports = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization
      if (!token) throw new Error("Token not found")
      const decoded = jwt.decode(token)

      const client = await Client.findById(decoded.client_id)
      if (!client) throw new Error("Unauthorized user")

      req.CLIENT_ID = client._id

      next()
    } catch (error) {
      next(error)
    }
  }
}