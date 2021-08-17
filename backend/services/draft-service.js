const Draft = require('../models/draft')
const GameGroup = require('../models/gameGroup')
const mongoose = require('mongoose')
const scheduler = require('node-schedule')
const draftRouter = require('../controllers/draft')

const initialize = () => {
  try {
    console.log('starting draft collection watch')
    const changeStream = Draft.watch()

    changeStream.on('change', (change) => {
      if (change.updateDescription && change.updateDescription.updatedFields.startingTime) {
        console.log(`draft ${change.documentKey._id} changed starting time to 
          ${change.updateDescription.updatedFields.startingTime}`)
        scheduleDraft(change.documentKey._id, change.updateDescription.updatedFields.startingTime)
      } else if (change.updateDescription && 
        change.updateDescription.updatedFields.status === 'started') {
        console.log(change.documentKey._id, 'draft started')
        console.log(change.updateDescription.updatedFields.draftOrder)
          /*
        OTA WEBSOCKET YHTEYS JOKA KÄYNNISTÄÄ TARKISTUKSEN ONKO DRAFT KÄYNNISSÄ!
        TAI/JA TEE DRAFTROUTERIIN ERILLINEN FUNKTIO JOKA KÄY LÄPI ONKO KO. DRAFTIIN OTETTU YHTEYTTÄ

        TAI ERIYTÄ DRAFTROUTERIN FUNKTIOT DRAFT-SERVICEEN!!!
          CLIENTIT, TIMERIT JA STREAM SERVICEEN
          */
      } else {
          // console.log('something else happened on draft db', change.documentKey)
      }
    })
  } catch(e) {
    console.log('fucked up', e)
  }
}

const scheduleDraft = async (draftId, startingTime) => {
  console.log(`scheduling Draft ${draftId} to start at ${startingTime}`)
  let startingDate = new Date() // CHANGE TO startingTime
  startingDate.setSeconds(startingDate.getSeconds() + 5)

  const job = scheduler.scheduleJob(startingDate, async () => {
    console.log('job started')

    const draft = await Draft.findById(draftId)
    draft.status = 'started'

    const gameGroup = await GameGroup.findOne({ draft: draftId })
      .populate('players', 'name')
    
    draft.draftOrder = await shuffle(gameGroup.players)
    draft.totalRounds = Math.floor(draft.teamsLeft.length / gameGroup.players.length)

    draft.picksPerRound = Math.floor(draft.teamsLeft.length / draft.totalRounds)

    await draft.save()

    console.log('done scheduling')
  })
}

const shuffle = (arr) => {
  let currentIndex = arr.length, randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]

    return arr
  }
}

const draftService = { initialize }

module.exports = draftService