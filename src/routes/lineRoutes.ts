import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const filters = req.body;

        res.status(200).json({ message: 'Filters recieved', filters });
    } catch (error) {
        console.error('Neúspěšné zpracování filteru:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

export default router;