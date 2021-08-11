const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')


const teamDataSchema = mongoose.Schema({
  TeamID: { type: Number, unique: true },
  Key: String,
  Active: Boolean,
  City: String,
  Name: String,
  StadiumID: Number,
  Conference: String,
  Division: String,
  PrimaryColor: String,
  SecondaryColor: String,
  TertiaryColor: String,
  QuaternaryColor: String,
  WikipediaLogoUrl: String,
  WikipediaWordMarkUrl: String,
  GlobalTeamID: Number
})

teamDataSchema.plugin(uniqueValidator)

teamDataSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const TeamData = mongoose.model('TeamData', teamDataSchema)

module.exports = TeamData