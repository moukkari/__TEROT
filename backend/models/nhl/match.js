const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const matchSchema = mongoose.Schema({
  GameID: { type: Number, required: true },
  Season: Number,
  SeasonType: Number,
  Status: String,
  Day: Date,
  DateTime: Date,
  Updated: Date,
  IsClosed: Boolean,
  AwayTeam: String,
  HomeTeam: String,
  AwayTeamID: Number,
  HomeTeamID: Number,
  StadiumID: Number
})

matchSchema.plugin(uniqueValidator)

matchSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
    delete returnedObject.Channel
    delete returnedObject.Attendance
    delete returnedObject.AwayTeamScore
    delete returnedObject.HomeTeamScore
    delete returnedObject.Period
    delete returnedObject.TimeRemainingMinutes
    delete returnedObject.TimeRemainingSeconds
    delete returnedObject.AwayTeamMoneyLine
    delete returnedObject.HomeTeamMoneyLine
    delete returnedObject.PointSpread
    delete returnedObject.OverUnder
    delete returnedObject.GlobalGameID
    delete returnedObject.GlobalAwayTeamID
    delete returnedObject.GlobalHomeTeamID
    delete returnedObject.PointSpreadAwayTeamMoneyLine
    delete returnedObject.PointSpreadHomeTeamMoneyLine
    delete returnedObject.LastPlay
    delete returnedObject.GameEndDateTime
    delete returnedObject.HomeRotationNumber
    delete returnedObject.AwayRotationNumber
    delete returnedObject.NeutralVenue
    delete returnedObject.OverPayout
    delete returnedObject.UnderPayout
    delete returnedObject.Periods
  }
})

const Match = mongoose.model('Match', matchSchema)

module.exports = Match