export const sendSuccess = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  message = "Error occurred",
  statusCode = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
