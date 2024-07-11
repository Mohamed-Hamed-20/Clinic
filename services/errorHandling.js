export const asyncHandler = (controller) => {
  return (req, res, next) => {
    controller(req, res, next).catch(async (error) => {
      let result = {};

      process.env.MOOD == "DEV"
        ? (result = { message: error.message, stack: error.stack })
        : (result = { message: "something went wrong ! , SERVER ERROR ! :( " });

      return res.status(error.code || 500).json(result);
    });
  };
};

export const GlobalErrorHandling = (error, req, res, next) => {
  let result = {};

  process.env.MOOD == "DEV"
    ? (result = { message: error.message, stack: error.stack })
    : (result = { message: error.message });

  return res.status(error.code || 500).json(result);
};
