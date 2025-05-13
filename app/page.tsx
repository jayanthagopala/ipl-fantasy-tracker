"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import "./../app/app.css";
import IPLFantasyTracker from "./components/Todo";
import Image from 'next/image';

Amplify.configure(outputs);

export default function App() {
  return (
    <main>
      <header className="app-header">
        <Image 
          src="/images/teams/ipl.png" 
          width={40} 
          height={40} 
          alt="IPL Logo" 
          className="logo-icon" 
        />
        <h1>IPL Fantasy Tracker</h1>
      </header>
      
      <IPLFantasyTracker />
      
      <footer className="app-footer">
        <p>Ee sala cup namde | Build by AI 🧠</p>
      </footer>
    </main>
  );
}
