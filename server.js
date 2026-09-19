const http = require("http")
const fs = require("fs")
const path = require("path")
const WebSocket = require("ws")

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url)

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404)
            res.end("Not Found")
            return
        }

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        })
        res.end(data)
    })
})

const wss = new WebSocket.Server({ server })

wss.on("connection", ws => {
    ws.on("message", data => {
        const message = data.toString()

        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        }
    })
})

server.listen(3000, () => {
    console.log("Chat server started: http://localhost:3000")
})