import React, { useState } from 'react'
import Team from './team'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import axios from 'axios'
import { Button } from 'react-bootstrap'

export default function PreOrder({ user, draft, teamData }) {
    const [teamOrder, setTeamOrder] = useState(teamData)

    const save = () => {
        const body = { userId: user._id, picks: teamOrder.map(t => t._id) }
        axios.put(`http://localhost:3001/api/gamegroup/draft/${draft._id}/prePicks`, { body })
            .then(response => {
                console.log(response)
            })
            .catch(e => console.log(e))
    }

    const onDragEnd = result => {
        const { destination, source } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return

        const team = teamOrder[source.index]

        let newOrder = [...teamOrder]
        newOrder.splice(source.index, 1)
        newOrder.splice(destination.index, 0, team)

        setTeamOrder(newOrder)
    }

    return (
        <div>
            <h3>Listaa tiimit etukäteen</h3>
            <div style={{ textAlign: 'center', margin: '2em 0em' }}>
                <Button onClick={save} size='lg' variant='success'>Tallenna lista</Button>
            </div>
            
            {draft ?
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={draft._id}>
                        {provided => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {teamOrder.map((team, i) => <Team key={team._id} team={team} index={i} />)}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                : ''
            }
            

            <div style={{ textAlign: 'center', fontWeight: 700, margin: '2em 0em' }}>
                <Button onClick={save} size='lg' variant='success'>Tallenna lista</Button>
            </div>
            
        </div>
    )
}