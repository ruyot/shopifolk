# Shopifolk

A webring for everyone Shopify - interns, full-time employees, and alumni.

## What is a Webring?

A webring is a collection of websites linked together in a circular structure. Each site has navigation links to the previous and next sites, allowing visitors to explore the entire ring. (Like a visual representation of everyone)

## Joining the Webring

1. **Add the widget** to your personal website (template below) - usually in the footer
2. **Fork this repo** and add your info to the bottom of `webringData` in `webring.js`:
   ```js
   { name: "Your Name", website: "https://your-site.com" }
   ```
3. **Submit a Pull Request** - will be reviewed and merged

## Widget Template

Add this to your site's footer:

```html
<div style="display: flex; align-items: center; gap: 8px;">
  <a href="https://shopifolk.com/#your-site-url?nav=prev">←</a>
  <a href="https://shopifolk.com" target="_blank">
    <img src="https://shopifolk.com/shopify_logo.svg" alt="Shopifolk" style="width: 24px; height: auto; opacity: 0.8;"/>
  </a>
  <a href="https://shopifolk.com/#your-site-url?nav=next">→</a>
</div>
<!-- Replace 'your-site-url' with your actual site URL -->
```

Feel free to style the widget to match your site's theme!

## Features

- Browse Shopify engineers by name
- Filter by semester/cohort (F = Fall, W = Winter, S = Summer)
- Links to individual profiles and personal sites

## Contributing

Submit a PR to join, any design or development suggestions are welcome 
