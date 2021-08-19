import axios from 'axios'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button } from 'react-bootstrap'
import { APIURL } from '../services/addresses'


export default function DraftSettings({ draft, createMessage }) {
  const [oldDate, setOldDate] = useState(new Date(draft.startingTime))
  const [date, setDate] = useState(new Date(draft.startingTime))
  const [timeForTakingPick, setTimeForTakingPick] = useState(draft.timeForTakingPick || 60)

  const saveData = () => {
    if (timeForTakingPick < 15) {
      createMessage('Ajan pitää olla vähintään 15 sekuntia', true)
      return
    }
    const change = {
      startingTime: date,
      timeForTakingPick: timeForTakingPick
    }
    axios.put(`${APIURL}/gamegroup/draft/${draft._id}`, change)
      .then(response => {
        console.log(response)
        setOldDate(new Date(response.data.startingTime))
        createMessage('Asetukset päivitettiin onnistuneesti')
      })
      .catch(e => {
        console.log(e)
        createMessage('Virhe asetuksia tallentaessa', true)
      })
  }

  return (
    <div style={{ margin: '2em 0' }}>
      <p>
        Draft alkaa: {oldDate.toLocaleString('fi-FI')}
      </p>
      <hr/>
      Vaihda aikaa: <DatePicker
        selected={date}
        onChange={(d) => setDate(d)}
        showTimeSelect
        dateFormat="d. MM. yyyy HH:mm"
        timeFormat="HH:mm"
        timeIntervals={15}
      />
      &nbsp;
      <p>
        Aikaa joukkueen valitsemiseen (oletus: 60):
        <input
          type='number'
          value={timeForTakingPick}
          onChange={(e) => setTimeForTakingPick(e.target.value)}
        />
      </p>
      <Button onClick={() => saveData()} variant='info'>Tallenna</Button>
    </div>
  )
}