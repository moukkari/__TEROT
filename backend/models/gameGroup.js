const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const gameGroupSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  draft: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draft',
    autopopulate: true
  }
})

gameGroupSchema.plugin(require('mongoose-autopopulate'))
gameGroupSchema.plugin(uniqueValidator)

/*
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})
*/

const GameGroup = mongoose.model('GameGroup', gameGroupSchema)

module.exports = GameGroup