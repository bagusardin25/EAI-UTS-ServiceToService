const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send("hello nigga")
})
app.get('/niggaboy', (req, res) => {
    res.send("FUCK NIGGA")
})

app.listen(3000, () => {
    console.log("SERVER BERJALAN NGAB DI PORT 3000")
})