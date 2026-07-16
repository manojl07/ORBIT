const Session = require('../models/session.model')


const findSessionByHash = async (tokenHash) => {
  return Session.findOne({tokenHash})
}
 
const deleteSession = async (sessionId) => {
  return Session.findByIdAndDelete(sessionId)
}

module.exports = {findSessionByHash, deleteSession}