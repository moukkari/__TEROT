import axios from 'axios'
import React, { useState } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Button } from 'react-bootstrap'

export default function DraftSettings({ data }) {
  const [oldDate, setOldDate] = useState(new Date(data.startingTime))
  const [date, setDate] = useState(new Date(data.startingTime))

  const saveDate = () => {
    axios.put(`http://localhost:3001/api/gamegroup/draft/${data._id}`, { date: date })
      .then(response => {
        console.log(response)
        setOldDate(new Date(response.data.startingTime))
      })
      .catch(e => console.log(e))
  }

  return (
    <div style={{ margin: '2em 0'}}>
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
      <Button onClick={() => saveDate()} variant='info'>Tallenna</Button>
    </div>
  )
}