// Visit https://your-project-name.vercel.app/api/health in a browser
// after deploying — if you see {"status":"ok"}, your deployment worked.

module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
};
