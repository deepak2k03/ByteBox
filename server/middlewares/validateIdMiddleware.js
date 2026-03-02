export default function (req, res, next, id) {
  // const uuidRegex =
  //   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id.length !== 24)
    return res.status(400).json({ message: `Invalid File ID! ${id}` });
  next();
}
