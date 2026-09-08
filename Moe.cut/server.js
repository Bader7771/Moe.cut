// Local server entry point. Vercel imports api/index.js -> app.js instead.
import app from './app.js';
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5001;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}
