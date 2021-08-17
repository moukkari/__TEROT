import React from 'react'
import './teamGrid.css'

export default function TeamComponent({ team, chooseTeam }) {
    
    return (
        <div 
            className='teamContainerChild' 
            onClick={() => chooseTeam(team)}
        >
            <img 
                alt={team.Key} 
                src={team.WikipediaLogoUrl} 
                className='teamLogo' 
            />
        </div>
    )
}