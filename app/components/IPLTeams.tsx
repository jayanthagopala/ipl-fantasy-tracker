"use client";

import { useState } from 'react';
import Image from 'next/image';

interface TeamInfo {
  code: string;
  name: string;
  fullName: string;
  primaryColor: string;
  secondaryColor: string;
  championships: number;
  captain: string;
}

export default function IPLTeams() {
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  
  const teams: TeamInfo[] = [
    {
      code: 'csk',
      name: 'CSK',
      fullName: 'Chennai Super Kings',
      primaryColor: '#f7cd00',
      secondaryColor: '#000000',
      championships: 5,
      captain: 'MS Dhoni'
    },
    {
      code: 'mi',
      name: 'MI',
      fullName: 'Mumbai Indians',
      primaryColor: '#004ba0',
      secondaryColor: '#ffffff',
      championships: 5,
      captain: 'Hardik Pandya'
    },
    {
      code: 'rcb',
      name: 'RCB',
      fullName: 'Royal Challengers Bangalore',
      primaryColor: '#ec1c24',
      secondaryColor: '#ffffff',
      championships: 0,
      captain: 'Faf du Plessis'
    },
    {
      code: 'kkr',
      name: 'KKR',
      fullName: 'Kolkata Knight Riders',
      primaryColor: '#3a225d',
      secondaryColor: '#fdb913',
      championships: 2,
      captain: 'Shreyas Iyer'
    },
    {
      code: 'dc',
      name: 'DC',
      fullName: 'Delhi Capitals',
      primaryColor: '#0078bc',
      secondaryColor: '#b4161b',
      championships: 0,
      captain: 'Rishabh Pant'
    },
    {
      code: 'srh',
      name: 'SRH',
      fullName: 'Sunrisers Hyderabad',
      primaryColor: '#ff822a',
      secondaryColor: '#000000',
      championships: 1,
      captain: 'Pat Cummins'
    },
    {
      code: 'rr',
      name: 'RR',
      fullName: 'Rajasthan Royals',
      primaryColor: '#ff1d4d',
      secondaryColor: '#004ba0',
      championships: 1,
      captain: 'Sanju Samson'
    },
    {
      code: 'pbks',
      name: 'PBKS',
      fullName: 'Punjab Kings',
      primaryColor: '#ed1b24',
      secondaryColor: '#a4a4a4',
      championships: 0,
      captain: 'Shikhar Dhawan'
    },
    {
      code: 'gt',
      name: 'GT',
      fullName: 'Gujarat Titans',
      primaryColor: '#1d2951',
      secondaryColor: '#00b0f0',
      championships: 1,
      captain: 'Shubman Gill'
    },
    {
      code: 'lsg',
      name: 'LSG',
      fullName: 'Lucknow Super Giants',
      primaryColor: '#a0e1fc',
      secondaryColor: '#313f9f',
      championships: 0,
      captain: 'KL Rahul'
    }
  ];
  
  return (
    <div className="ipl-teams-container">
      <h2 className="ipl-teams-heading">IPL Teams</h2>
      <div className="team-logos-container">
        {teams.map((team) => (
          <div 
            key={team.code}
            className={`team-logo-item ${activeTeam === team.code ? 'active' : ''}`}
            style={{ 
              backgroundColor: team.primaryColor,
              borderColor: team.secondaryColor 
            }}
            onClick={() => setActiveTeam(team.code === activeTeam ? null : team.code)}
          >
            <div className="team-logo-wrapper">
              <Image
                src={`/images/teams/${team.code}.png`}
                alt={`${team.fullName} logo`}
                width={80}
                height={80}
                className="team-logo-image"
              />
            </div>
            <div className="team-name">{team.name}</div>
          </div>
        ))}
      </div>
      
      {activeTeam && (
        <div className="team-details">
          {teams.filter(team => team.code === activeTeam).map(team => (
            <div key={team.code} className="team-info" style={{ borderColor: team.primaryColor }}>
              <div className="team-header">
                <Image
                  src={`/images/teams/${team.code}.png`}
                  alt={`${team.fullName} logo`}
                  width={100}
                  height={100}
                  className="team-detail-logo"
                />
                <h3>{team.fullName}</h3>
              </div>
              <div className="team-stats">
                <div className="stat">
                  <span className="stat-label">Championships</span>
                  <span className="stat-value">{team.championships}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Captain</span>
                  <span className="stat-value">{team.captain}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Team Colors</span>
                  <div className="team-colors">
                    <span className="color-swatch" style={{ backgroundColor: team.primaryColor }}></span>
                    <span className="color-swatch" style={{ backgroundColor: team.secondaryColor }}></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 