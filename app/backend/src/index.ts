import express from 'express'
import type { Request, Response, Express } from 'express'

const app: Express = express()

const PORT: number = 4000


app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!")
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})