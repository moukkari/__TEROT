import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

export default function Team({ team, index }) {
  const container = {
    height: '66px',
    padding: '8px',
    position: 'relative',
    marginBottom: '4px',

    minHeight: '70px'
  }
  const teamStyle = {
    position: 'relative',
    display: 'inline-block',
    backgroundImage:
      `linear-gradient(to right, white, #${team.PrimaryColor} 20%)`,
    border: '1px solid grey',
    width: '75%',
    height: '66px',
    borderRadius: '10px',
  }
  const textContainer = {
    paddingLeft: '50px',
    fontWeight: 'bold',
    color: `#${team.SecondaryColor}`,
    display: 'inline-block',
    textTransform: 'uppercase',
    position: 'absolute',
    top: '50%',
    margin: 0,
    transform: 'translateY(-50%)',
    width: '100%',
    textAlign: 'center'
  }
  const number = {
    color: 'black',
    backgroundColor: 'white',
    display: 'inline-block',
    paddingLeft: '10px',
    paddingRight: '10px',
    fontWeight: 'bold',
    fontSize: 'x-large',
    minWidth: '60px',
    textAlign: 'right',
    verticalAlign: 'top'
  }
  const imgStyle = {
    width: '50px',
    maxHeight: '60px',
    position: 'absolute',
    paddingLeft: '10px',
    top: '50%',
    margin: 0,
    transform: 'translateY(-50%)'
  }
  return (
    <Draggable draggableId={team._id} index={index}>
      {provided => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div style={container}>

            <div style={number}>{index+1}.</div>
            <div style={teamStyle}>
              <img
                alt={team.Key}
                src={team.WikipediaLogoUrl}
                style={imgStyle}
              />
              <div style={textContainer}>{team.City} {team.Name}</div>
            </div>
          </div>

        </div>
      )}
    </Draggable>
  )
}