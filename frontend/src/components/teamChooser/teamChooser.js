import React, { useEffect, useState } from 'react'
import './teamGrid.css'
import TeamComponent from './teamComponent'
import { Row, Col } from 'react-bootstrap'

export default function TeamChooser({ liveDraft, chooseTeam, teamData }) {
    const [chosenTeam, setChosenTeam] = useState(null)
    let teamStyle, buttonStyle

    
    if (chosenTeam) {
        teamStyle = 
            {
                backgroundColor: `#${chosenTeam.PrimaryColor}`,
                color: `#${chosenTeam.SecondaryColor}`
            } 
        buttonStyle = {
            backgroundColor: `#${chosenTeam.SecondaryColor}`,
            color: `#${chosenTeam.PrimaryColor}`,
            width: '90%',
            marginTop: '1em',
            padding: '0.5em 0em',
            borderRadius: '0.5em',
            fontWeight: '900',
            textTransform: 'uppercase'
        }
        
    }

    return (
        <div>
            <h5>Valitse joukkue</h5>
            <div className='chosenTeam' style={teamStyle}>
                {chosenTeam ? 
                    <Row>
                        <Col>
                            <img 
                                alt={chosenTeam.Key} 
                                src={chosenTeam.WikipediaLogoUrl} 
                                className='chosenLogo'
                            />
                        </Col>
                        <Col>
                            <Row>
                                <h4>{chosenTeam.City} {chosenTeam.Name} </h4>
                            </Row>
                            <Row>
                                <button 
                                    style={buttonStyle} 
                                    onClick={() => chooseTeam(chosenTeam)}
                                >
                                    Valitse
                                </button>
                            </Row>
                            
                            
                            
                        </Col>
                    </Row>
                    :
                    ''
                }
            </div>
            <div className='teamContainer'>
                {liveDraft.teamsLeft.map(team => {
                    const data = teamData.find(t => t._id === team._id)
                    return <TeamComponent key={team.Key} team={data} chooseTeam={setChosenTeam} />
                })}
            </div>
        </div>
    )
}