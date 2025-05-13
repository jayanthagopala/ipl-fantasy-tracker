import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  FantasyUser: a
    .model({
      team_name: a.string().required(),
      user_id: a.integer().required(),
      total_points: a.float().default(0), // Track total points for easy leaderboard access
      matches_played: a.integer().default(0), // Track number of matches participated in
      highest_score: a.float().default(0), // Track user's highest score in any match
      average_score: a.float().default(0), // Track average score across matches
      last_match_points: a.float().default(0), // Points from most recent match
      last_match_no: a.integer().default(0), // Most recent match number
      position_change: a.integer().default(0), // Track position changes in leaderboard
      last_position: a.integer().default(0), // Previous position in leaderboard
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  FantasyPoint: a
    .model({
      matchNo: a.integer().required(),
      userId: a.integer().required(),
      points: a.float().required(),
      // Add composite key to ensure uniqueness for matchNo + userId
      matchUserIndex: a.string().required(), // Will store as "matchNo:userId"
      match_date: a.string(), // Store match date for time-based queries
      team_name: a.string(), // Denormalize team name for easier queries
      match_details: a.string(), // Store match details (team vs team)
      relative_rank: a.integer(), // User's rank in this specific match
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  MatchStat: a
    .model({
      matchNo: a.integer().required(),
      highest_scorer_id: a.integer(), // User with highest score in this match
      highest_score: a.float().default(0), // Highest score in this match
      average_score: a.float().default(0), // Average score across all users
      total_participants: a.integer().default(0), // Number of participants
      match_date: a.string(), // Match date for time-based queries
      match_details: a.string(), // Match details (team vs team)
      match_status: a.string(), // completed, in-progress, upcoming
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
