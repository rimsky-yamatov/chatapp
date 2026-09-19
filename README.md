# Realtime Chat

A simple real-time chat application built with Node.js, WebSocket, SQLite, and 98.css.

## Features

- Real-time messaging with WebSocket
- User name and message input
- Messages are broadcast to all connected clients
- Messages are stored in SQLite
- Messages from previous days are automatically deleted
- Message history is restored when a client connects
- Windows 98-style user interface using 98.css
- Runs locally with Node.js

## Requirements

- Node.js
- npm

## Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd chat
npm install
```

## Running

Start the server:

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

Open the page in multiple browser windows or devices on the same network to test real-time messaging.

## Project Structure

```text
chat/
├── server.js
├── package.json
├── chat.db
└── public/
    └── index.html
```

`chat.db` is created automatically when the server starts.

## Message Storage

Messages are stored in a local SQLite database using `better-sqlite3`.

Each message contains:

- ID
- User name
- Message
- Date
- Creation time

Only messages from the current day are kept.

When the date changes, messages from previous days are automatically removed.

## Technologies

- [Node.js](https://nodejs.org/)
- [WebSocket](https://github.com/websockets/ws)
- [SQLite](https://www.sqlite.org/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [98.css](https://jdan.github.io/98.css/)

## License

This project is licensed under the MIT License.

See [LICENSE](LICENSE) for details.