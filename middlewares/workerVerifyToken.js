const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const token = req.headers['workerauth'];
  console.log(`Token:${token}`);
  if (!token) {
    return res.status(401).json({error: 'Authorization header missing'});
  }

  try {
    const tokenWithoutBearer = token.split(' ')[1];
    const decodedToken = jwt.verify(
        tokenWithoutBearer,
        process.env.ACCESS_TOKEN_WORKER,
    );
    console.log(`tok${decodedToken}`);
    if (!decodedToken) {
      return res.status(401).json({error: 'Invalid token'});
    }

    req.decodedWorkerToken = decodedToken;
    console.log(req.decodedWorkerToken);
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(401).json({error: 'Token verification failed'});
  }
};

module.exports = authenticateToken;

