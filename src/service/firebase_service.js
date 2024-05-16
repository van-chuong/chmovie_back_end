
class FirebaseService {

    async sendRatingMessage(req, res) {
        const id = req.query.id;
        const username = req.query.username;
        res.send(`Page: ${id}, ID: ${username}`);
    }

}

module.exports = new FirebaseService;