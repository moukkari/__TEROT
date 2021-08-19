import React, { useState } from 'react'

export default function Countdown({ liveDraft }) {
  const [dateNow, setDateNow] = useState(new Date().getTime())

  const draftTime = new Date(liveDraft.startingTime).getTime()
  const countTime = new Date(draftTime - dateNow)
  let timer = ''
  if (countTime.getMonth() > 0) {
    timer += `${countTime.getMonth()} kuukautta, `
  }
  timer += `${countTime.getDay()} päivää, `
  timer += `${countTime.getHours()} tuntia, `
  timer += `${countTime.getMinutes()} minuuttia, `
  timer += `${countTime.getSeconds()} sekuntia`

  setTimeout(() => {
    if (countTime > 0) {
      setDateNow(new Date().getTime())
    }
  }, 1000)

  return <p>Aikaa draftin alkuun {timer}</p>
}