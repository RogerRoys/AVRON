# Avron 1d Conversion First — Shopify theme

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

## Motion & interactions (v1.1)
Matches the "Avron 1d Live Preview" prototype.
- Rotating announcement bar (add up to 5 Message blocks; speed setting).
- Header shadow on scroll, animated nav underline, mega menu fade + staggered columns, promo tile zoom.
- Predictive search dropdown (Shopify /search/suggest) with popular-search chips from the Header setting.
- Hero: fade-in on load, text rises in line by line, slow Ken Burns zoom, prev/next arrows.
- Scroll reveal on section headings, cards, tiles and footer (staggered).
- Product cards: image zoom + second image, quick buy slides up, wishlist heart (saved in the visitor's browser).
- Tabs fade/rise on switch, category ring, room pill invert, UGC "Shop the look" overlay.
- Warmth picker: pick 2200K–4000K and the preview photo re-tints (set the image in Materials & guide).
- Reviews carousel with arrows on desktop (shows when 4+ review blocks), swipe on mobile.
- Smooth open/close on all accordions (FAQ, product tabs, mobile menu, filters).
- Menu drawer items slide in one after another; cart lines animate in; cart count bumps on change.
- Product page: "Adding…" → "✓ Added" button states, pulsing low-stock dot, image fade on variant change, sticky add-to-cart bar after scrolling past the main button.
- Theme settings → Animations: toggle scroll reveal, hero zoom and hover zoom. Everything turns off automatically for visitors with "reduce motion" enabled.

## v1.2 — Live Preview content built in
- 24 demo photos from the preview ship in assets/ (av-01.jpg … av-24.jpg). Every section shows them until you pick your own image, so a fresh install looks like "Avron 1d Live Preview".
- Product tabs, related products and empty collections show the 11 preview products (names, prices, badges, swatches, hover image) until real collections are chosen.
- Header → "Use demo menu" (on by default) shows the preview nav with both mega menus and the mobile drawer until your main menu has dropdown items.
- Hero now has all 3 preview slides.
- Reviews → "Show demo photos" adds preview photos to reviews without an image.

## v1.2.1
- Fixed: hero slider (dots, arrows, autoplay) crashed on load — now works.
- Header now matches preview: Track order / Trade program / Help links (until you set a utility menu), Wishlist (count) link, cart count badge.
- Hero side-card arrow and warmth tiles sized like the preview.
- Product page and collection pages no longer use demo photos — plain placeholders until you add your own.

## v1.2.2
- Mega menu: solid white panel, grey page dim behind it, larger type and promo tiles — matches the Live Preview.
- FAQ: large questions, round +/× buttons, warranty and trade cards styled like the preview.

## v1.2.3
- Mega menu type, spacing, promo tiles and Popular chips sized exactly like the 1d design. Lighter page dim. Added "Home office" to Shop by room.

## v1.2.4
- Mega menu: the grey dim now covers only the page below the menu. The utility bar and logo/search row stay white, like the design.

## v1.3
- FAQ rebuilt to the Live Preview: 30px heading, 16px questions, round + that turns into a black × when open, smooth open/close. The warranty and trade cards match the preview.
- Cart drawer rebuilt to the Live Preview: floating white panel, green shipping bar, bag icon empty state, "Customers also added" shows even when the cart is empty (demo products until you pick an upsell collection), Tracked shipping Free row, Checkout securely button.
- Menu drawer restyled to the preview: tiles, › rows, green promo, Log in / currency footer.
- Header: Account / Wishlist (0) / Cart with the orange count badge, which now shows even at 0.
- Drawer slide, overlay fade and reveal timings match the preview.

## v1.3.1 (compared against the Live Preview data)
- Hero side-card demo photos, UGC photos and mobile menu tiles (New in / Best sellers) now use the same pictures as the preview.
- Footer shows the preview link columns (Shop / Customer care / About) until you pick footer menus.
- FAQ electrician answer and 4000K glow colour now match the preview text/colour.
