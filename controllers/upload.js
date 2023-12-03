exports.upload = async (req, res) => {
  try {
    res.send(req.file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
