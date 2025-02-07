export default async function handler(req, res) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/upload`, {
        method: 'POST',
        body: req.body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const data = await response.json()
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }