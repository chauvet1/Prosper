
To automate blog generation on Vercel using the new API route, follow these steps:

Deploy your updated code to Vercel.
In your Vercel dashboard, go to your project settings → "Cron Jobs".
Click "Add Cron Job".
Set the schedule you want (e.g., every day at 8am).
Set the URL to:
https://<your-vercel-domain>/api/scheduled-blog-generate
Choose the HTTP method: POST (recommended) or GET.
Optional:

For security, you can add a secret token check in the API route and pass it as a header or query param from the Cron Job.
Let me know if you want help adding authentication or have any issues with the setup!