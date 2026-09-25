const crypto = require("crypto");

const generateOneTimeToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashOneTimeToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {generateOneTimeToken,hashOneTimeToken,};