import { fetchFlights } from './_lib/opensky.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const payload = await fetchFlights(req.query || {});
    res.status(200).json(payload);
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Unexpected server error' : error.message,
      details: error?.details || (error instanceof Error ? error.message : String(error))
    });
  }
}
