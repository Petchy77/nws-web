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

## Company data reference

Company registration, business categories, address, and registered capital are based on the public record at [Data for Thai](https://www.dataforthai.com/company/0135569018076/), accessed 16 September 2026.
