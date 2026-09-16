# New World Solutions website

Static corporate website for **New World Solutions Co., Ltd.**

## Local preview

Open `index.html` directly, or run:

```sh
python3 -m http.server 4173
```

Then visit <http://localhost:4173>.

## Deployment

The site is ready for GitHub Pages. The `CNAME` file requests `nwsthai.com` as the custom domain.

1. Create/push the repository to GitHub.
2. In **Settings → Pages**, set **Deploy from a branch**, choose `main` and `/(root)`.
3. In the DNS manager authoritative for `nwsthai.com`, point the apex domain to GitHub Pages using GitHub's current documented A/AAAA records, and set `www` as a CNAME to `Petchy77.github.io`.
4. Add `www.nwsthai.com` in GitHub Pages as a redirect domain if desired, then enable HTTPS once DNS verification completes.

Microsoft 365's Domains page is not necessarily the authoritative DNS host. Verify the nameservers before changing any DNS records, and retain existing Microsoft 365 MX/TXT records.

## SEO and discovery

The site includes a canonical URL, crawl directives, social metadata, organization structured data, `robots.txt`, `sitemap.xml`, and `llms.txt` (a concise plain-language company summary for AI tools that choose to read it).

After a deployment is live at `https://nwsthai.com/`, the site owner should:

1. Add and verify the domain property in [Google Search Console](https://search.google.com/search-console/).
2. Submit `https://nwsthai.com/sitemap.xml` through the Sitemaps report.
3. Use URL Inspection to request indexing for the homepage and review indexing status periodically.

These are discovery and monitoring steps, not a guarantee of a particular ranking or display time. Keep titles and page copy accurate, helpful, and updated as company services change.

## Company data reference

Company registration, business categories, address, and registered capital are based on the public record at [Data for Thai](https://www.dataforthai.com/company/0135569018076/), accessed 16 September 2026.
