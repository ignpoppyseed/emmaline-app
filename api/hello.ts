import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
    var username = req.query.username
    if (username == undefined) { username = 'default user' }
    return res.json({
        message: `hello ${username}!`,
    })
}