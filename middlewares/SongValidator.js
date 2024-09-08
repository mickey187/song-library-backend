const Joi = require("joi");

// validation for song related data
const validateSongData = (req, res, next) => {
  const schema = new Joi.object({
    title: Joi.string().required(),
    artist: Joi.string().required(),
    album: Joi.string(),
    genre: Joi.string().required(),
    artwork: Joi.string(),
    file: Joi.object()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    console.log("validateSongData:", error.message);
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = { validateSongData };
