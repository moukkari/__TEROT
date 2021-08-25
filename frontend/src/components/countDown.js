import React, { useEffect, useState } from 'react'

export default function Countdown({ liveDraft }) {
  const [dateNow, setDateNow] = useState(new Date().getTime())

  useEffect(() => {
    return () => clearTimeout(timerVar)
  }, [])

  const draftTime = new Date(liveDraft.startingTime).getTime()
  let countTime = (draftTime - dateNow) / 1000

  const days = Math.floor(countTime / 86400)
  countTime -= days * 86400

  const hours = Math.floor(countTime / 3600) % 24
  countTime -= hours * 3600

  const minutes = Math.floor(countTime / 60) % 60
  countTime -= minutes * 60

  const seconds = Math.floor(countTime % 60)

  const timerVar = setTimeout(() => {
    if (countTime > 0) {
      setDateNow(new Date().getTime())
    }
  }, 1000)
  timerVar

  let timeString = ''

  if (days > 0) timeString += `${days} päivää, `
  if (hours > 0) timeString += `${hours} tuntia, `
  if (minutes > 0) timeString += `${minutes} minuuttia ja `
  timeString += `${seconds} sekuntia.`

  return <p>Aikaa draftin alkuun {timeString}</p>
}