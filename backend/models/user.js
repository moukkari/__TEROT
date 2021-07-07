const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  passwordHash: { type: String, select: false },
  gameGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameGroup',
      autoPopulate: true
    }
  ],
  adminOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameGroup'
  },
  invitations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameGroup'
    }
  ]
})

userSchema.plugin(require('mongoose-autopopulate'))
userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User