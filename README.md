# Avron — Shopify theme (Conversion-first, option 1d)

Online Store 2.0 theme built from the "Avron 1d Conversion First" design.

## Install
1. Zip the **contents** of this folder (layout/, sections/, snippets/, templates/, config/, locales/, assets/ must be at the zip root).
2. Shopify admin → Online Store → Themes → Add theme → Upload zip file.
3. Customize → set logo, colours and content. (The Avron SVG logo in assets/ is used when no logo is uploaded.)

Or use Shopify CLI: `shopify theme dev --store your-store` from this folder.

## What's included
- **Header group:** announcement bar, utility bar (text + menu + country/currency), search-led header, **mega menu** (3-level menu + promo tiles + popular search chips), **mobile menu drawer** (tiles, accordions, promo, links, localization).
- **Cart drawer:** Ajax add/update/remove, free-shipping progress bar, upsell collection, discount code field, accelerated checkout buttons. Setting: Theme settings → Cart → Drawer / Page.
- **Quick buy popup:** on product cards with variants (bottom sheet on mobile). Single-variant products add straight to cart.
- **Home sections:** Hero split (slideshow + 2 side cards), Trust bar, Category circles, Product tabs, Room grid, Materials & colour-temperature guide, Reviews (manual + app block), UGC gallery, FAQ & support (warranty + trade cards), Newsletter, Footer.
- **Product page:** gallery (lead image + grid on desktop, swipe + thumbs on mobile, variant image switching), rating, price + compare-at + savings, low-stock notice, variant buttons with swatches, qty, add to cart, Shop Pay / dynamic checkout, installments, payment icons, trust grid, frequently-bought-together bundle, collapsible tabs, features row, colour-temperature banner, reviews, related products.
- **Collection:** storefront filters (sidebar on desktop, drawer on mobile), sort, active filter chips, pagination.
- Cart page, search, page, contact, blog, article, 404, list-collections, password and gift card templates.

## Set-up notes
- **Mega menu:** Navigation → main-menu. Top item (e.g. *Pendants*) → children become column headings → grandchildren become links. Add "Mega menu promo tile" blocks in the Header section and type the exact top item title in *Show under menu item*.
- **Badges:** add product tags like `badge:Best seller` or `badge:New`.
- **Ratings:** stars read the standard `reviews.rating` / `reviews.rating_count` metafields that Judge.me, Okendo, Loox and Shopify Product Reviews write. For full review widgets add the app block in the Reviews section.
- **Swatches:** use Shopify's native colour swatches (Settings → Metafields → category metafield "Color") and they appear on cards and the variant picker.
- **Low stock:** needs inventory tracking; threshold in Theme settings → Product.
- **Free shipping bar:** threshold is in your store's base currency. With multiple currencies the bar compares against the converted cart total, so it's approximate for foreign currencies.
- **Frequently bought together:** pick up to 3 products in the product page block (per template). For per-product bundles, create alternate product templates.
- **Fonts:** Theme settings → Typography → any Google Font family name (default Onest).
