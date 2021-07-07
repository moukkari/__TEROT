import axios from 'axios'
import React, { useState } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
    <div>
      <h4>Draft-asetukset</h4>
      <p>
        Draft alkaa: {oldDate.toLocaleString('fi-FI')}
      </p>
      Vaihda aikaa: <DatePicker 
        selected={date}
        onChange={(d) => setDate(d)} 
        showTimeSelect 
        dateFormat="d. MM. yyyy HH:mm" 
        timeFormat="HH:mm"
        timeIntervals={15}
      />
      <button onClick={() => saveDate()}>Tallenna</button>
    </div>
  )
}