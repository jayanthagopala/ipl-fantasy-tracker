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

interface FantasyUser {
  id: number;
  team_name: string;
}

interface FantasyPoints {
  matchNo: number;
  userId: number;
  points: number;
}

const FANTASY_USERS: FantasyUser[] = [
  { id: 1, team_name: "CheemsRajah" },
  { id: 2, team_name: "Anantha Team" },
  { id: 3, team_name: "JUSTIN CHALLENGERS" },
  { id: 4, team_name: "Vjvignesh94" },
  { id: 5, team_name: "Garuda Tejas" },
  { id: 6, team_name: "Sundar Night Fury" },
  { id: 7, team_name: "JAYAGAN ARMY" },
  { id: 8, team_name: "Jais Royal Challengers" },
  { id: 9, team_name: "Devilish 11" }
];

const client = generateClient<Schema>();

export default function IPLFantasyTracker() {
  const [notes, setNotes] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [activeTab, setActiveTab] = useState("read");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [selectedAdminMatch, setSelectedAdminMatch] = useState<number | null>(null);
  const [fantasyPoints, setFantasyPoints] = useState<FantasyPoints[]>([]);
  const [userPoints, setUserPoints] = useState<{[userId: number]: string}>({});
  const [jsonPointsInput, setJsonPointsInput] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);

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
    
    // Load saved fantasy points from localStorage
    const savedFantasyPoints = localStorage.getItem('iplFantasyPoints');
    if (savedFantasyPoints) {
      setFantasyPoints(JSON.parse(savedFantasyPoints));
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
  }

  function savePrediction(matchNo: number) {
    // Function no longer needed since input and button were removed
    setSelectedMatch(null);
  }

  function getPredictionForMatch(matchNo: number): string {
    const prediction = predictions.find(p => p.matchNo === matchNo);
    return prediction?.prediction || "";
  }

  function handleAdminMatchClick(matchNo: number, e?: React.MouseEvent) {
    // If the click came from inside the form area, ignore it
    if (e && (e.target as HTMLElement).closest('.fantasy-points-form')) {
      return;
    }
    
    if (selectedAdminMatch === matchNo) {
      setSelectedAdminMatch(null);
      setUserPoints({});
      setJsonPointsInput("");
      setJsonError(null);
    } else {
      setSelectedAdminMatch(matchNo);
      setJsonError(null);
      
      // Initialize user points input fields
      const initialPoints: {[userId: number]: string} = {};
      FANTASY_USERS.forEach(user => {
        // Check if there are existing points for this user and match
        const existingPoints = fantasyPoints.find(
          p => p.matchNo === matchNo && p.userId === user.id
        );
        initialPoints[user.id] = existingPoints ? existingPoints.points.toString() : '';
      });
      setUserPoints(initialPoints);
      
      // Create JSON string of existing points or template
      const pointsForMatch = fantasyPoints.filter(p => p.matchNo === matchNo);
      if (pointsForMatch.length > 0) {
        // Create JSON from existing points
        const jsonData = pointsForMatch.map(point => {
          const user = FANTASY_USERS.find(u => u.id === point.userId);
          return {
            team_name: user?.team_name || '',
            points: point.points
          };
        });
        setJsonPointsInput(JSON.stringify(jsonData, null, 2));
      } else {
        // Create template JSON with all users
        const templateJson = FANTASY_USERS.map(user => ({
          team_name: user.team_name,
          points: 0
        }));
        setJsonPointsInput(JSON.stringify(templateJson, null, 2));
      }
    }
  }
  
  function handlePointsChange(userId: number, value: string) {
    setUserPoints(prev => ({
      ...prev,
      [userId]: value
    }));
  }
  
  function handleJsonInputChange(value: string) {
    setJsonPointsInput(value);
    setJsonError(null);
  }
  
  function validateAndParseJson(): FantasyPoints[] | null {
    try {
      const parsedData = JSON.parse(jsonPointsInput);
      
      if (!Array.isArray(parsedData)) {
        setJsonError("Input must be an array of user points");
        return null;
      }
      
      const validPoints: FantasyPoints[] = [];
      const matchNo = selectedAdminMatch as number;
      
      for (const entry of parsedData) {
        if (typeof entry !== 'object' || entry === null) {
          setJsonError("Each entry must be an object with team_name and points");
          return null;
        }
        
        const { team_name, points } = entry;
        
        if (!team_name || typeof team_name !== 'string') {
          setJsonError("Each entry must have a valid team_name string");
          return null;
        }
        
        if (points === undefined || typeof points !== 'number') {
          setJsonError("Each entry must have valid numeric points");
          return null;
        }
        
        // Find user by team name
        const user = FANTASY_USERS.find(u => u.team_name === team_name);
        if (!user) {
          setJsonError(`Unknown team name: ${team_name}`);
          return null;
        }
        
        validPoints.push({
          matchNo,
          userId: user.id,
          points
        });
      }
      
      return validPoints;
    } catch (error) {
      setJsonError("Invalid JSON format");
      return null;
    }
  }
  
  function saveFantasyPoints(matchNo: number) {
    const validPoints = validateAndParseJson();
    
    if (validPoints && validPoints.length > 0) {
      // Remove existing points for this match
      const filteredPoints = fantasyPoints.filter(p => p.matchNo !== matchNo);
      
      // Add new points
      const newFantasyPoints = [...filteredPoints, ...validPoints];
      
      // Save to state and localStorage
      setFantasyPoints(newFantasyPoints);
      localStorage.setItem('iplFantasyPoints', JSON.stringify(newFantasyPoints));
      
      // Reset selected match
      setSelectedAdminMatch(null);
      setUserPoints({});
      setJsonPointsInput("");
      setJsonError(null);
    }
  }
  
  function getPointsForMatch(matchNo: number, userId: number): number | null {
    const pointsEntry = fantasyPoints.find(
      p => p.matchNo === matchNo && p.userId === userId
    );
    
    return pointsEntry ? pointsEntry.points : null;
  }
  
  function getMatchStatus(match: Match): string {
    const matchDate = new Date(match.date);
    const now = new Date();
    
    // Check if the match has points recorded
    const hasPoints = fantasyPoints.some(p => p.matchNo === match.matchNo);
    
    if (hasPoints) {
      return "completed";
    } else if (matchDate < now) {
      return "in-progress";
    } else {
      return "upcoming";
    }
  }
  
  function calculateLeaderboard() {
    // Calculate total points for each user
    const userTotals: { userId: number; team_name: string; totalPoints: number; }[] = [];
    
    FANTASY_USERS.forEach(user => {
      // Get all points for this user
      const userPoints = fantasyPoints.filter(p => p.userId === user.id);
      
      // Calculate total
      const totalPoints = userPoints.reduce((sum, entry) => sum + entry.points, 0);
      
      userTotals.push({
        userId: user.id,
        team_name: user.team_name,
        totalPoints
      });
    });
    
    // Sort by total points (descending)
    return userTotals.sort((a, b) => b.totalPoints - a.totalPoints);
  }
  
  // Count completed matches
  function getCompletedMatchesCount(): number {
    return matches.filter(match => 
      fantasyPoints.some(p => p.matchNo === match.matchNo)
    ).length;
  }
  
  // Get user's position changes based on points
  function getPositionChange(currentIndex: number, userId: number): number {
    // This is simplified - in a real app you'd track position history
    // For demo purposes, we'll return a random change
    const changes = [-2, -1, 0, 1, 2];
    return changes[Math.floor(Math.random() * changes.length)];
  }

  return (
    <div className="fantasy-tracker-container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "read" ? "active" : ""}`} 
          onClick={() => setActiveTab("read")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
          </svg>
          Fantasy Leaderboard
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
          <div className="leaderboard-section">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="icon" viewBox="0 0 16 16">
                <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
              </svg>
              <span className="leaderboard-trophy"></span>
              Fantasy Leaderboard
            </h2>
            
            <div className="leaderboard-stats">
              <div className="stat-item">
                <div className="stat-value">{getCompletedMatchesCount()}</div>
                <div className="stat-label">Matches Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{matches.length - getCompletedMatchesCount()}</div>
                <div className="stat-label">Upcoming Matches</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{FANTASY_USERS.length}</div>
                <div className="stat-label">Fantasy Players</div>
              </div>
            </div>
            
            {fantasyPoints.length > 0 ? (
              <div className="fantasy-leaderboard">
                <div className="leaderboard-header">
                  <div className="rank-header">Rank</div>
                  <div className="team-header">Team</div>
                  <div className="points-header">Points</div>
                </div>
                <ul className="leaderboard-list">
                  {calculateLeaderboard().map((entry, index) => {
                    const position = index + 1;
                    const positionChange = getPositionChange(index, entry.userId);
                    
                    return (
                      <li key={entry.userId} className={`leaderboard-item rank-${position <= 3 ? position : 'other'}`}>
                        <div className="user-rank">
                          <span className="rank-number">{position}</span>
                          {positionChange !== 0 && (
                            <span className={`position-change ${positionChange > 0 ? 'positive' : 'negative'}`}>
                              {positionChange > 0 ? '↑' : '↓'}{Math.abs(positionChange)}
                            </span>
                          )}
                        </div>
                        <div className="user-team">{entry.team_name}</div>
                        <div className="user-total-points">{entry.totalPoints.toFixed(2)}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
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
                <p>No fantasy points available yet. Submit points in the Admin tab after matches are completed!</p>
                <button className="secondary-button" onClick={() => setActiveTab("add")}>
                  Go to Admin
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "add" ? (
          <div className="matches-tab admin-tab">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="icon" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              </svg>
              Dream11 Fantasy Points Tracker
            </h2>
            
            <p className="admin-description">
              Submit Dream11 fantasy points for each match. Select a match to enter points for all users.
            </p>
            
            {matches.length > 0 ? (
              <ul className="matches-list">
                {matches.map((match) => {
                  const homeTeamCode = getTeamCode(match.homeTeam);
                  const awayTeamCode = getTeamCode(match.awayTeam);
                  const gradientClass = `${homeTeamCode}-gradient`;
                  const matchStatus = getMatchStatus(match);
                  const hasPoints = fantasyPoints.some(p => p.matchNo === match.matchNo);
                  
                  return (
                    <li 
                      key={match.matchNo} 
                      className={`match-item ${gradientClass} ${matchStatus} ${selectedAdminMatch === match.matchNo ? 'selected' : ''}`}
                      onClick={(e) => handleAdminMatchClick(match.matchNo, e)}
                    >
                      <div className="match-header">
                        <div className="match-number">
                          Match #{match.matchNo}
                        </div>
                        {matchStatus === "completed" && (
                          <div className="match-status completed">
                            Points Recorded
                          </div>
                        )}
                        {matchStatus === "in-progress" && (
                          <div className="match-status in-progress">
                            Match Completed
                          </div>
                        )}
                        {matchStatus === "upcoming" && (
                          <div className="match-status upcoming">
                            Upcoming
                          </div>
                        )}
                      </div>
                      
                      <div className="match-teams">
                        <div className="team-logo-badge">
                          <Image 
                            src={`/images/teams/${homeTeamCode}.png`} 
                            alt={match.homeTeam}
                            width={60}
                            height={60}
                            className="match-team-logo"
                          />
                          <span 
                            className={`home-team team-${homeTeamCode}`}
                            style={{
                              color: getTeamColor(homeTeamCode)
                            }}
                          >
                            {match.homeTeam}
                          </span>
                        </div>
                        <span className="vs">vs</span>
                        <div className="team-logo-badge">
                          <Image 
                            src={`/images/teams/${awayTeamCode}.png`} 
                            alt={match.awayTeam}
                            width={60}
                            height={60}
                            className="match-team-logo"
                          />
                          <span 
                            className={`away-team team-${awayTeamCode}`}
                            style={{
                              color: getTeamColor(awayTeamCode)
                            }}
                          >
                            {match.awayTeam}
                          </span>
                        </div>
                      </div>
                      
                      {selectedAdminMatch === match.matchNo && (
                        <div className="fantasy-points-form" onClick={(e) => e.stopPropagation()}>
                          <h4 className="points-form-title">Enter Dream11 Fantasy Points (JSON)</h4>
                          <div className="json-input-container">
                            <textarea
                              className={`json-points-input ${jsonError ? 'has-error' : ''}`}
                              value={jsonPointsInput}
                              onChange={(e) => handleJsonInputChange(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              placeholder="Enter points as JSON array"
                              rows={10}
                              spellCheck="false"
                              autoCorrect="off"
                              autoComplete="off"
                            ></textarea>
                            {jsonError && (
                              <div className="json-error-message">{jsonError}</div>
                            )}
                            <div className="json-help-text">
                              <p>Enter points as a JSON array with team_name and points for each user:</p>
                              <pre onClick={(e) => e.stopPropagation()}>
{`[
  { "team_name": "CheemsRajah", "points": 85.5 },
  { "team_name": "Anantha Team", "points": 92.0 }
]`}
                              </pre>
                              <button 
                                className="template-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Create template JSON with all users
                                  const templateJson = FANTASY_USERS.map(user => ({
                                    team_name: user.team_name,
                                    points: 0
                                  }));
                                  setJsonPointsInput(JSON.stringify(templateJson, null, 2));
                                }}
                              >
                                Insert Template
                              </button>
                            </div>
                          </div>
                          <button 
                            className="save-points-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveFantasyPoints(match.matchNo);
                            }}
                          >
                            Save Points
                          </button>
                        </div>
                      )}
                      
                      {!selectedAdminMatch && hasPoints && (
                        <div className="fantasy-points-summary">
                          <h4 className="points-summary-title">Recorded Points</h4>
                          <div className="fantasy-points-grid">
                            {FANTASY_USERS.map(user => {
                              const points = getPointsForMatch(match.matchNo, user.id);
                              if (points !== null) {
                                return (
                                  <div key={user.id} className="user-points-entry">
                                    <span className="user-name">{user.team_name}</span>
                                    <span className="user-points">{points}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="match-info">
                        <div className="match-date-container">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="date-icon" viewBox="0 0 16 16">
                            <path d="M4.684 11.523v-2.3h2.261v-.61H4.684V6.801h2.464v-.61H4v5.332h.684zm3.296 0h.676V8.98c0-.554.227-1.007.953-1.007.125 0 .258.004.329.015v-.613a1.806 1.806 0 0 0-.254-.02c-.582 0-.891.32-1.012.567h-.02v-.504H7.98v4.105zm2.805-5.093c0 .238.192.425.43.425a.428.428 0 1 0 0-.855.426.426 0 0 0-.43.43zm.094 5.093h.672V7.418h-.672v4.105z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          <span>{match.date} {match.time && `• ${match.time}`}</span>
                        </div>
                        <div className="match-venue">
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
                      onClick={() => handleMatchClick(match.matchNo)}
                    >
                      <div className="match-header">
                        <div className="match-number">
                          Match #{match.matchNo}
                        </div>
                        {hasPrediction && (
                          <div className="prediction-badge">
                            Prediction Added
                          </div>
                        )}
                      </div>
                      
                      <div className="match-teams">
                        <div className="team-logo-badge">
                          <Image 
                            src={`/images/teams/${homeTeamCode}.png`} 
                            alt={match.homeTeam}
                            width={60}
                            height={60}
                            className="match-team-logo"
                          />
                          <span 
                            className={`home-team team-${homeTeamCode}`}
                            style={{
                              color: getTeamColor(homeTeamCode)
                            }}
                          >
                            {match.homeTeam}
                          </span>
                        </div>
                        <span className="vs">vs</span>
                        <div className="team-logo-badge">
                          <Image 
                            src={`/images/teams/${awayTeamCode}.png`} 
                            alt={match.awayTeam}
                            width={60}
                            height={60}
                            className="match-team-logo"
                          />
                          <span 
                            className={`away-team team-${awayTeamCode}`}
                            style={{
                              color: getTeamColor(awayTeamCode)
                            }}
                          >
                            {match.awayTeam}
                          </span>
                        </div>
                      </div>
                      
                      {hasPrediction && !selectedMatch && (
                        <div className="saved-prediction">
                          <strong>Your prediction:</strong> {getPredictionForMatch(match.matchNo)}
                        </div>
                      )}
                      
                      <div className="match-info">
                        <div className="match-date-container">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="date-icon" viewBox="0 0 16 16">
                            <path d="M4.684 11.523v-2.3h2.261v-.61H4.684V6.801h2.464v-.61H4v5.332h.684zm3.296 0h.676V8.98c0-.554.227-1.007.953-1.007.125 0 .258.004.329.015v-.613a1.806 1.806 0 0 0-.254-.02c-.582 0-.891.32-1.012.567h-.02v-.504H7.98v4.105zm2.805-5.093c0 .238.192.425.43.425a.428.428 0 1 0 0-.855.426.426 0 0 0-.43.43zm.094 5.093h.672V7.418h-.672v4.105z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          <span>{match.date} {match.time && `• ${match.time}`}</span>
                        </div>
                        <div className="match-venue">
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