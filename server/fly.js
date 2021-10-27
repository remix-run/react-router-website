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

  console.info(`Replaying:`, {
    pathname: req.originalUrl,
    method: req.method,
    PRIMARY_REGION,
    FLY_REGION,
  });

  res.setHeader("fly-replay", `region=${PRIMARY_REGION}`);
  return res.status(409).send(`retry in region ${PRIMARY_REGION}`);
}

module.exports = { getReplayResponse };
