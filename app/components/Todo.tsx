"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import iplSchedule from "./ipl-schedule-json.json";
import Image from 'next/image';
import './IPLMatches.css';

interface Match {
  matchNo: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  day?: string;
  time?: string;
}

interface MatchPrediction {
  matchNo: number;
  prediction: string;
}

const client = generateClient<Schema>();

export default function IPLFantasyTracker() {
  const [notes, setNotes] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [activeTab, setActiveTab] = useState("read");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState("");

  useEffect(() => {
    listNotes();
    if (iplSchedule && iplSchedule.matches) {
      setMatches(iplSchedule.matches);
    }
    
    // Load saved predictions from localStorage
    const savedPredictions = localStorage.getItem('iplPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, []);

  function listNotes() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setNotes([...data.items]),
    });
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await client.models.Todo.create({
        content: noteContent,
      });
      
      setNoteContent("");
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleMatchClick(matchNo: number) {
    setSelectedMatch(matchNo === selectedMatch ? null : matchNo);
    const existingPrediction = predictions.find(p => p.matchNo === matchNo);
    setCurrentPrediction(existingPrediction?.prediction || "");
  }

  function savePrediction(matchNo: number) {
    if (!currentPrediction.trim()) return;

    const newPredictions = [...predictions];
    const existingIndex = newPredictions.findIndex(p => p.matchNo === matchNo);
    
    if (existingIndex >= 0) {
      newPredictions[existingIndex].prediction = currentPrediction;
    } else {
      newPredictions.push({ matchNo, prediction: currentPrediction });
    }
    
    setPredictions(newPredictions);
    localStorage.setItem('iplPredictions', JSON.stringify(newPredictions));
    setSelectedMatch(null);
    setCurrentPrediction("");
  }

  function getPredictionForMatch(matchNo: number): string {
    const prediction = predictions.find(p => p.matchNo === matchNo);
    return prediction?.prediction || "";
  }

  return (
    <div className="fantasy-tracker-container">
      <div className="ipl-logo-header">
        <Image 
          src="/images/teams/ipl.png" 
          width={70} 
          height={70} 
          alt="IPL Logo" 
          className="ipl-logo" 
        />
      </div>
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "read" ? "active" : ""}`} 
          onClick={() => setActiveTab("read")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
          </svg>
          Leaderboard
        </button>
        <button 
          className={`tab ${activeTab === "matches" ? "active" : ""}`} 
          onClick={() => setActiveTab("matches")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
            <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
            <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
          </svg>
          Schedule
        </button>
        <button 
          className={`tab ${activeTab === "add" ? "active" : ""}`} 
          onClick={() => setActiveTab("add")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
          </svg>
          Admin
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "read" ? (
          <div className="read-todo">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="icon" viewBox="0 0 16 16">
                <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
              </svg>
              <span className="leaderboard-trophy"></span>
              Leaderboard
            </h2>
            {notes.length > 0 ? (
              <ul className="todo-list">
                {notes.map((note) => (
                  <li key={note.id} className="todo-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="check-icon" viewBox="0 0 16 16">
                      <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
                    </svg>
                    <span className="todo-content">{note.content}</span>
                    <span className="todo-date">
                      {note.createdAt && new Date(note.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Image 
                    src="/images/teams/ipl.png" 
                    width={100}
                    height={100}
                    alt="IPL Logo"
                    className="empty-state-logo"
                  />
                </div>
                <p>No leaderboard entries yet. Add player rankings, team standings, or match results!</p>
                <button className="secondary-button" onClick={() => setActiveTab("add")}>
                  Add to Leaderboard
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "add" ? (
          <div className="add-todo">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="icon" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              </svg>
              Admin
            </h2>
            <form onSubmit={createNote} className="add-form">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add player rankings, team standings, or match results..."
                className="todo-input"
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className="add-button"
                disabled={isSubmitting || !noteContent.trim()}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  <>Submit</>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="matches-tab">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="icon" viewBox="0 0 16 16">
                <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
              </svg>
              Schedule
            </h2>
            {matches.length > 0 ? (
              <ul className="matches-list">
                {matches.map((match) => {
                  const homeTeamCode = getTeamCode(match.homeTeam);
                  const awayTeamCode = getTeamCode(match.awayTeam);
                  const gradientClass = `${homeTeamCode}-gradient`;
                  const hasPrediction = predictions.some(p => p.matchNo === match.matchNo);
                  
                  return (
                    <li 
                      key={match.matchNo} 
                      className={`match-item ${gradientClass} ${hasPrediction ? 'has-prediction' : ''} ${selectedMatch === match.matchNo ? 'selected' : ''}`}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        marginBottom: '16px',
                        border: `1px solid ${hasPrediction ? '#4caf50' : '#eaeaea'}`,
                        cursor: 'pointer',
                        background: getGradientStyle(homeTeamCode)
                      }}
                      onClick={() => handleMatchClick(match.matchNo)}
                    >
                      <div className="match-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <div className="match-number" style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: '#ffffff',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          display: 'inline-block',
                          fontSize: '0.9rem',
                          position: 'relative',
                          zIndex: 1
                        }}>
                          Match #{match.matchNo}
                        </div>
                        {hasPrediction && (
                          <div className="prediction-badge" style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 500
                          }}>
                            Prediction Added
                          </div>
                        )}
                      </div>
                      
                      <div className="match-teams" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        position: 'relative',
                        zIndex: 1,
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '10px',
                        borderRadius: '8px'
                      }}>
                        <div className="team-logo-badge" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          width: '45%'
                        }}>
                          <Image 
                            src={`/images/teams/${homeTeamCode}.png`} 
                            alt={match.homeTeam}
                            width={60}
                            height={60}
                            className="match-team-logo"
                            style={{
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              padding: '4px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}
                          />
                          <span 
                            className={`home-team team-${homeTeamCode}`}
                            style={{
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: getTeamColor(homeTeamCode)
                            }}
                          >
                            {match.homeTeam}
                          </span>
                        </div>
                        <span className="vs" style={{
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          color: '#363636',
                          position: 'relative',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>vs</span>
                        <div className="team-logo-badge" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          width: '45%'
                        }}>
                          <Image 
                            src={`/images/teams/${awayTeamCode}.png`} 
                            alt={match.awayTeam}
                            width={60}
                            height={60}
                            className="match-team-logo"
                            style={{
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              padding: '4px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}
                          />
                          <span 
                            className={`away-team team-${awayTeamCode}`}
                            style={{
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: getTeamColor(awayTeamCode)
                            }}
                          >
                            {match.awayTeam}
                          </span>
                        </div>
                      </div>
                      
                      {selectedMatch === match.matchNo && (
                        <div className="prediction-form" style={{
                          marginTop: '15px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: '15px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Add Your Prediction</h4>
                          <input
                            type="text"
                            value={currentPrediction}
                            onChange={(e) => setCurrentPrediction(e.target.value)}
                            placeholder="Enter your match prediction..."
                            className="prediction-input"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              marginBottom: '10px',
                              fontSize: '1rem'
                            }}
                          />
                          <button 
                            onClick={() => savePrediction(match.matchNo)}
                            className="save-button"
                            disabled={!currentPrediction.trim()}
                            style={{
                              backgroundColor: '#4caf50',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              opacity: currentPrediction.trim() ? 1 : 0.7
                            }}
                          >
                            Save Prediction
                          </button>
                        </div>
                      )}
                      
                      {hasPrediction && !selectedMatch && (
                        <div className="saved-prediction" style={{
                          marginTop: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          padding: '10px',
                          borderRadius: '8px',
                          borderLeft: '4px solid #4caf50'
                        }}>
                          <strong>Your prediction:</strong> {getPredictionForMatch(match.matchNo)}
                        </div>
                      )}
                      
                      <div className="match-info" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: selectedMatch === match.matchNo || hasPrediction ? '15px' : '10px',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="date-icon" viewBox="0 0 16 16">
                            <path d="M4.684 11.523v-2.3h2.261v-.61H4.684V6.801h2.464v-.61H4v5.332h.684zm3.296 0h.676V8.98c0-.554.227-1.007.953-1.007.125 0 .258.004.329.015v-.613a1.806 1.806 0 0 0-.254-.02c-.582 0-.891.32-1.012.567h-.02v-.504H7.98v4.105zm2.805-5.093c0 .238.192.425.43.425a.428.428 0 1 0 0-.855.426.426 0 0 0-.43.43zm.094 5.093h.672V7.418h-.672v4.105z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          <span>{match.date} {match.time && `• ${match.time}`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="venue-icon" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                          </svg>
                          <span>{match.venue}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Image 
                    src="/images/teams/ipl.png" 
                    width={100}
                    height={100}
                    alt="IPL Logo"
                    className="empty-state-logo"
                  />
                </div>
                <p>No matches available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get team code from team name
function getTeamCode(teamName: string): string {
  if (!teamName) return '';
  
  teamName = teamName.trim();
  
  const teamCodes: { [key: string]: string } = {
    // Full names
    'Chennai Super Kings': 'csk',
    'Mumbai Indians': 'mi',
    'Royal Challengers Bengaluru': 'rcb',
    'Royal Challengers Bangalore': 'rcb', // Both Bengaluru and Bangalore variants
    'Kolkata Knight Riders': 'kkr',
    'Delhi Capitals': 'dc',
    'Sunrisers Hyderabad': 'srh',
    'Rajasthan Royals': 'rr',
    'Punjab Kings': 'pbks',
    'Gujarat Titans': 'gt',
    'Lucknow Super Giants': 'lsg',
    
    // Shortened names
    'CSK': 'csk',
    'MI': 'mi',
    'RCB': 'rcb',
    'KKR': 'kkr',
    'DC': 'dc',
    'SRH': 'srh',
    'RR': 'rr',
    'PBKS': 'pbks',
    'GT': 'gt',
    'LSG': 'lsg',
    
    // Names without spaces
    'ChennaiSuperKings': 'csk',
    'MumbaiIndians': 'mi',
    'RoyalChallengersBengaluru': 'rcb',
    'RoyalChallengersBangalore': 'rcb',
    'KolkataKnightRiders': 'kkr',
    'DelhiCapitals': 'dc',
    'SunrisersHyderabad': 'srh',
    'RajasthanRoyals': 'rr',
    'PunjabKings': 'pbks',
    'GujaratTitans': 'gt',
    'LucknowSuperGiants': 'lsg',
    
    // Additional variants
    'Chennai': 'csk',
    'Mumbai': 'mi',
    'Bengaluru': 'rcb',
    'Bangalore': 'rcb',
    'Kolkata': 'kkr',
    'Delhi': 'dc',
    'Hyderabad': 'srh',
    'Rajasthan': 'rr',
    'Punjab': 'pbks',
    'Gujarat': 'gt',
    'Lucknow': 'lsg',
    
    // Special cases
    'Qualifier 1': 'ipl',
    'Qualifier 2': 'ipl',
    'Eliminator': 'ipl',
    'Final': 'ipl'
  };
  
  // Try to find exact match
  if (teamCodes[teamName]) {
    return teamCodes[teamName];
  }
  
  // Try to find case-insensitive match
  for (const [key, value] of Object.entries(teamCodes)) {
    if (key.toLowerCase() === teamName.toLowerCase()) {
      return value;
    }
  }
  
  // If all else fails, try to detect team based on keywords
  const teamName_lower = teamName.toLowerCase();
  if (teamName_lower.includes('chennai') || teamName_lower.includes('csk')) return 'csk';
  if (teamName_lower.includes('mumbai') || teamName_lower.includes('mi')) return 'mi';
  if (teamName_lower.includes('bangalore') || teamName_lower.includes('bengaluru') || teamName_lower.includes('rcb')) return 'rcb';
  if (teamName_lower.includes('kolkata') || teamName_lower.includes('kkr')) return 'kkr';
  if (teamName_lower.includes('delhi') || teamName_lower.includes('dc')) return 'dc';
  if (teamName_lower.includes('hyderabad') || teamName_lower.includes('srh')) return 'srh';
  if (teamName_lower.includes('rajasthan') || teamName_lower.includes('rr')) return 'rr';
  if (teamName_lower.includes('punjab') || teamName_lower.includes('pbks')) return 'pbks';
  if (teamName_lower.includes('gujarat') || teamName_lower.includes('gt')) return 'gt';
  if (teamName_lower.includes('lucknow') || teamName_lower.includes('lsg')) return 'lsg';
  
  // Default fallback
  return 'ipl';
}

// Helper function to get team color
function getTeamColor(teamCode: string): string {
  const teamColors: { [key: string]: string } = {
    'csk': '#f2a900',
    'mi': '#004ba0',
    'rcb': '#d00027',
    'kkr': '#3a225d',
    'dc': '#0078bc',
    'srh': '#ff822a',
    'rr': '#254aa5',
    'pbks': '#ed1b24',
    'gt': '#1b2133',
    'lsg': '#0189d1',
    'ipl': '#0078bc'
  };
  
  return teamColors[teamCode] || '#333333';
}

// Helper function to get gradient style
function getGradientStyle(teamCode: string): string {
  const gradients: { [key: string]: string } = {
    'csk': 'linear-gradient(135deg, rgba(247, 206, 53, 0.2) 0%, rgba(247, 162, 55, 0.4) 100%)',
    'mi': 'linear-gradient(135deg, rgba(0, 75, 141, 0.2) 0%, rgba(0, 120, 188, 0.4) 100%)',
    'rcb': 'linear-gradient(135deg, rgba(208, 0, 39, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)',
    'kkr': 'linear-gradient(135deg, rgba(58, 34, 93, 0.2) 0%, rgba(123, 49, 162, 0.4) 100%)',
    'dc': 'linear-gradient(135deg, rgba(0, 120, 188, 0.2) 0%, rgba(23, 71, 158, 0.4) 100%)',
    'srh': 'linear-gradient(135deg, rgba(255, 130, 42, 0.2) 0%, rgba(220, 38, 38, 0.4) 100%)',
    'rr': 'linear-gradient(135deg, rgba(37, 74, 165, 0.2) 0%, rgba(255, 105, 180, 0.4) 100%)',
    'pbks': 'linear-gradient(135deg, rgba(234, 26, 133, 0.2) 0%, rgba(220, 38, 38, 0.4) 100%)',
    'gt': 'linear-gradient(135deg, rgba(27, 33, 51, 0.2) 0%, rgba(11, 73, 115, 0.4) 100%)',
    'lsg': 'linear-gradient(135deg, rgba(160, 230, 255, 0.2) 0%, rgba(1, 137, 209, 0.4) 100%)',
    'ipl': 'linear-gradient(135deg, rgba(0, 120, 188, 0.2) 0%, rgba(255, 124, 38, 0.4) 100%)'
  };
  
  return gradients[teamCode] || 'white';
} 