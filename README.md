# HeyGen AI Spokesperson

![HeyGen AI Spokesperson Demo](./public/demo.png)

## Overview

HeyGen AI Spokesperson is a Next.js application that demonstrates the power of HeyGen's Interactive Avatar API. This project showcases how to create interactive, AI-powered digital avatars that can respond to text and voice input in real-time, making it perfect for creating virtual spokespersons, customer service agents, or interactive guides.

## Features

- **Interactive AI Avatars**: Create lifelike digital avatars that respond to user input
- **Text-to-Speech**: Convert text input into natural-sounding speech
- **Voice Recognition**: Process user voice input for interactive conversations
- **Multi-language Support**: Support for 28+ languages for global accessibility
- **OpenAI Integration**: Optional connection to OpenAI's GPT models for intelligent responses
- **Survey Collection**: Example implementation of a health questionnaire with MongoDB storage

## Tech Stack

- **Frontend**: 
  - Next.js 14.2.4
  - React 18.3.1
  - TailwindCSS 3.4.3
  - NextUI Components
  - Framer Motion for animations

- **Backend**:
  - Next.js API Routes
  - MongoDB for data storage
  - HeyGen Streaming Avatar SDK (v2.0.8)
  
- **AI Integration**:
  - HeyGen Interactive Avatar API
  - OpenAI API (optional for enhanced conversational capabilities)
  - Speech recognition using Web Speech API

## Getting Started

### Prerequisites

- Node.js and npm
- HeyGen Enterprise API Token or Trial Token
- OpenAI API Key (optional)

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/HeyGen---AI-Spokesperson.git
   ```

2. Navigate to the project directory
   ```
   cd HeyGen---AI-Spokesperson
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   HEYGEN_API_KEY=your_heygen_api_key_or_trial_token
   OPENAI_API_KEY=your_openai_api_key (optional)
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key (optional)
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

### Interactive Avatar Demo

1. On the home page, you can start a session with an interactive avatar
2. Enter a custom avatar ID or select from example avatars
3. Choose between text mode or voice mode for interaction
4. In text mode, type messages for the avatar to speak
5. In voice mode, speak directly to the avatar for a conversational experience

### Survey Demo

1. Navigate to `/survey` to see an example health questionnaire
2. Enter your name to begin the survey
3. Answer questions by voice or text input
4. Responses are stored in MongoDB for later analysis

## Avatar Options

You can use public avatars provided by HeyGen or upgrade your own avatars to be interactive. To find available avatar IDs:

1. Navigate to [app.heygen.com/interactive-avatar](https://app.heygen.com/interactive-avatar)
2. Click 'Select Avatar' to view and copy avatar IDs
3. Use these IDs in the application to customize your experience

## API Reference

The application includes several API endpoints:

- `/api/get-access-token`: Generates secure access tokens for HeyGen API
- `/api/chat`: Connects to OpenAI for intelligent responses (requires OpenAI API key)
- `/api/savesurvey`: Stores survey responses in MongoDB

## License

This project is licensed under the terms included in the LICENSE file.
