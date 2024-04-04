const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const token = req.headers['workerauth'];
  if (!token) {
    return res.status(401).json({error: 'Authorization header missing'});
  }

  try {
    const tokenWithoutBearer = token.split(' ')[1];
    const decodedToken = jwt.verify(
        tokenWithoutBearer,
        process.env.ACCESS_TOKEN_WORKER,
    );
    if (!decodedToken) {
      return res.status(401).json({error: 'Invalid token'});
    }

    req.decodedWorkerToken = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({error: 'Token verification failed'});
  }
};

module.exports = authenticateToken;

