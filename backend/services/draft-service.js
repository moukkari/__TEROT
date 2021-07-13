const Draft = require('../models/draft')
const mongoose = require('mongoose')

const initialize = () => {
  try {
    console.log('starting draft collection watch')
    const changeStream = Draft.watch()

    changeStream.on('change', (change) => {
        if (change.updateDescription && change.updateDescription.updatedFields.startingTime) {
          console.log(`draft ${change.documentKey._id} changed starting time to 
            ${change.updateDescription.updatedFields.startingTime}`)
        } else {
          console.log('something else happened on draft db', change)
        }
    })
  } catch(e) {
    console.log('fucked up', e)
  }
}

const draftService = { initialize }

module.exports = draftService