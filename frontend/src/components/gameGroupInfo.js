import React from 'react'

export default function GameGroupInfo({ selectedGroup }) {
  const Admin = () => {
    const admin = selectedGroup.players.find(p => p._id === selectedGroup.admin)
    if (admin) return admin.name
    else return 'undefined'
  }
  return (
    <div style={{ marginBottom: '3em' }}>
      <table>
        <thead>
          <tr>
            <th>Kimpan {selectedGroup.name} tietoja</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ylläpitäjä</td>
            <td><Admin /></td>
          </tr>
          <tr>
            <td>Draftin tila</td>
            <td>{selectedGroup.draft.status}</td>
          </tr>
          <tr>
            <td>Draftin aika</td>
            <td>
              {new Date(selectedGroup.draft.startingTime)
                .toLocaleString('fi-FI')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}