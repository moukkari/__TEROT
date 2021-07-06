const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')


const teamSchema = mongoose.Schema({
  Season: Number,
  SeasonType: Number,
  TeamID: Number,
  Key: String,
  City: String,
  Name: { type: String, unique: true },
  Conference: String,
  Division: String,
  Wins: Number,
  Losses: Number,
  OvertimeLosses: Number,
  Percentage: Number,
  ConferenceWins: Number,
  ConferenceLosses: Number,
  DivisionWins: Number,
  DivisionLosses: Number,
  ShutoutWins: Number,
  ConferenceRank: Number,
  DivisionRank: Number,
  GlobalTeamID: Number
})

teamSchema.plugin(uniqueValidator)

teamSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.ConferenceLosses
    delete returnedObject.ConferenceRank
    delete returnedObject.ConferenceWins
    delete returnedObject.DivisionLosses
    delete returnedObject.DivisionRank
    delete returnedObject.DivisionWins
    delete returnedObject.SeasonTypes
  }
})

const Team = mongoose.model('Team', teamSchema)

module.exports = Team