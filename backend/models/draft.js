const mongoose = require('mongoose')

const draftSchema = mongoose.Schema({
  gameGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameGroup',
    required: true
  },
  status: { type: String, default: 'scheduled', required: true },
  startingTime: { type: Date, default: new Date('October 5, 2021 17:00:00'), required: true },
  teamsLeft: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    }
  ],
  teamsChosen: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
      }
    }
  ],
  draftOrder: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  round: { type: Number, default: 1 },
  totalRounds: Number,
  pick: { type: Number, default: 1 },
  picksPerRound: Number,
  prePicks: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      picks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: true
        }
      ]
    }
  ],
  timeForTakingPick: { type: Number, default: 60 }
})

draftSchema.plugin(require('mongoose-autopopulate'))


const Draft = mongoose.model('Draft', draftSchema)

module.exports = Draft