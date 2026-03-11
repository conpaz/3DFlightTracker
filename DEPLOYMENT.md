# Deployment Checklist

## Put the app online with GitHub + Vercel

1. Create a GitHub repository.
2. Upload the full contents of this folder.
3. In Vercel, choose **Add New Project**.
4. Import the GitHub repository.
5. In project environment variables, add:
   - `OPENSKY_CLIENT_ID`
   - `OPENSKY_CLIENT_SECRET`
6. Deploy.

## Verify after deploy

- Open the deployed homepage
- Confirm the globe loads
- Confirm aircraft appear after the first fetch
- Confirm `/api/health` returns a JSON object with `ok: true`
- Confirm `/api/flights` returns JSON and not an HTML error page

## Recommended repository settings

- Keep the repo private if you do not want to share the source publicly
- Do not commit `.env.local`
- Keep OpenSky secrets only in Vercel environment variables

## Optional GitHub README button

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)
```

Replace `YOUR_GITHUB_REPO_URL` after the repo is created.
