const { FLY, PRIMARY_REGION, FLY_REGION } = process.env;

if (!PRIMARY_REGION || !FLY_REGION) {
  throw new Error(
    'Missing environment variables "PRIMARY_REGION" and "FLY_REGION'
  );
}

const isPrimaryRegion = PRIMARY_REGION === FLY_REGION;

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function getReplayResponse(req, res, next) {
  if (["GET", "OPTIONS", "HEAD"].includes(req.method)) {
    return next();
  }

  if (!FLY || isPrimaryRegion) {
    return next();
  }

  res.set("fly-replay", `region=${PRIMARY_REGION}`);
  return res.sendStatus(409);
}

module.exports = { getReplayResponse };
