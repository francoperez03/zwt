# Deploying ZWT Documentation to Vercel

This guide will help you deploy the ZWT documentation site to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your ZWT repository pushed to GitHub, GitLab, or Bitbucket

## Deployment Steps

### 1. Import Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your `zwt` repository
4. Vercel will auto-detect it as a monorepo

### 2. Configure the Project

When configuring your project in Vercel:

**Root Directory:**
```
packages/docs
```

**Framework Preset:**
```
Docusaurus
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
build
```

**Install Command:**
```
npm install
```

### 3. Environment Variables (Optional)

If you want to customize URLs for the frontend app:

- `FRONTEND_APP_URL` - URL of your deployed frontend (defaults to localhost:5173)

### 4. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies
2. Build the Docusaurus site
3. Deploy to a production URL

Your documentation will be live at: `https://your-project.vercel.app`

## Deploying the Frontend Separately

To make the "Launch App" button work in production:

1. Deploy the frontend (`packages/frontend`) as a separate Vercel project
2. Update the navbar button URL in `docusaurus.config.ts`:

```typescript
{
  type: 'html',
  position: 'right',
  value: '<a href="https://your-frontend.vercel.app" target="_blank" rel="noopener noreferrer" class="button button--primary" style="margin-left: 0.5rem;">Launch App</a>',
},
```

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys:
- **Production**: On pushes to `main` branch
- **Preview**: On pull requests

## Local Testing

Before deploying, test the production build locally:

```bash
cd packages/docs
npm run build
npm run serve
```

Visit `http://localhost:3000` to preview.

## Troubleshooting

### Build Fails

- Ensure Node.js version is >= 20 (set in `vercel.json`)
- Check that all dependencies are properly installed
- Review build logs in Vercel dashboard

### Broken Links

- Update `url` in `docusaurus.config.ts` to match your Vercel domain
- Ensure `baseUrl` is set to `/`

### Frontend Button Not Working

- Deploy frontend separately to Vercel
- Update the "Launch App" button URL to your frontend's production URL

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Docusaurus Deployment Guide](https://docusaurus.io/docs/deployment)
- [Vercel Monorepo Support](https://vercel.com/docs/monorepos)
