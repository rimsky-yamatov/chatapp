const http = require("http")
const fs = require("fs")
const path = require("path")
const WebSocket = require("ws")
const Database = require("better-sqlite3")

const PORT = 3000
const PUBLIC_DIR = path.join(__dirname, "public")

const db = new Database(path.join(__dirname, "chat.db"))

db.pragma("journal_mode = WAL")

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        day TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
`)

function getJapanDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date())
}

function cleanupMessages() {
    const today = getJapanDate()
    db.prepare("DELETE FROM messages WHERE day != ?").run(today)
}

cleanupMessages()

let currentDay = getJapanDate()

const insertMessage = db.prepare(`
    INSERT INTO messages (name, message, day, created_at)
    VALUES (?, ?, ?, ?)
`)

const getTodayMessages = db.prepare(`
    SELECT id, name, message, created_at
    FROM messages
    WHERE day = ?
    ORDER BY id ASC
`)

const server = http.createServer((req, res) => {
    let requestPath = req.url.split("?")[0]

    if (requestPath === "/") {
        requestPath = "/index.html"
    }

    const filePath = path.normalize(path.join(PUBLIC_DIR, requestPath))

    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403)
        res.end("Forbidden")
        return
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404)
            res.end("Not Found")
            return
        }

        const ext = path.extname(filePath)

        const contentTypes = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8"
        }

        res.writeHead(200, {
            "Content-Type": contentTypes[ext] || "application/octet-stream"
        })

        res.end(data)
    })
})

const wss = new WebSocket.Server({ server })

function broadcast(data) {
    const text = JSON.stringify(data)

    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(text)
        }
    }
}

wss.on("connection", ws => {
    cleanupMessages()

    const messages = getTodayMessages.all(getJapanDate())

    ws.send(JSON.stringify({
        type: "history",
        messages
    }))

    ws.on("message", data => {
        let input

        try {
            input = JSON.parse(data.toString())
        } catch {
            return
        }

        if (
            typeof input.name !== "string" ||
            typeof input.message !== "string"
        ) {
            return
        }

        const name = input.name.trim()
        const message = input.message.trim()

        if (!name || !message) {
            return
        }

        if (name.length > 30 || message.length > 500) {
            return
        }

        const day = getJapanDate()
        const createdAt = new Date().toISOString()

        const result = insertMessage.run(
            name,
            message,
            day,
            createdAt
        )

        broadcast({
            type: "message",
            message: {
                id: result.lastInsertRowid,
                name,
                message,
                created_at: createdAt
            }
        })
    })
})

setInterval(() => {
    const day = getJapanDate()

    if (day !== currentDay) {
        currentDay = day
        cleanupMessages()

        broadcast({
            type: "clear"
        })
    }
}, 1000)

server.listen(PORT, () => {
    console.log(`Chat server started: http://localhost:${PORT}`)
})