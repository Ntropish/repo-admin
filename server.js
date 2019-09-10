const express = require('express')
const app = express()
const port = 3000
const admin = require('./admin')

admin.administrate(app)

app.listen(port, () => console.log(`Serving on port ${port}!`))
