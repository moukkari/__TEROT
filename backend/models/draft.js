const mongoose = require('mongoose')

const draftSchema = mongoose.Schema({
  gameGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameGroup',
    required: true
  },
  status: { type: String, default: 'scheduled', required: true },
  startingTime: { type: Date, default: new Date('October 5, 2021 17:00:00'), required: true },
  totalPlayers: { type: Number, default: 1, required: true },
  teamsLeft: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    }
  ],
  draftOrder: [
    {
      turn: Number,
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: String, // pending, used 
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      }
    }
  ],
  inTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nextInTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Draft = mongoose.model('Draft', draftSchema)

module.exports = Draft