# IPL Fantasy Tracker

A Next.js application powered by AWS Amplify for tracking fantasy cricket scores and predictions for the Indian Premier League (IPL).

## Overview

IPL Fantasy Tracker is a web application that allows users to make predictions for IPL matches, track their performance over time, and compete with friends. The application uses Next.js App Router with AWS Amplify for backend services like authentication, API, and database functionality.

## Features

- **Match Tracking**: View the complete IPL schedule with upcoming and completed matches
- **Predictions**: Make predictions for upcoming matches
- **Performance Tracking**: Track user performance with points, rankings, and statistics
- **Leaderboard**: Compare your performance against other participants
- **Admin Dashboard**: Manage fantasy points and match statistics (password protected)
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **UI Components**: AWS Amplify UI React components
- **Authentication**: Amazon Cognito via AWS Amplify
- **Database**: Amazon DynamoDB
- **API**: GraphQL with AWS AppSync
- **Deployment**: AWS Amplify Hosting

## Getting Started

### Prerequisites

- Node.js 18 or later
- AWS Account
- Amplify CLI installed globally

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd portfolio-nextjs-amplify
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Initialize Amplify (if not already initialized)
   ```
   amplify init
   ```

4. Deploy the backend resources
   ```
   amplify push
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to see the application

## Deployment

Deploy the full-stack application to AWS using Amplify:

```
amplify publish
```

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws) of the Amplify documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for security-related information.

## License

This project is licensed under the MIT-0 License. See the LICENSE file for details.