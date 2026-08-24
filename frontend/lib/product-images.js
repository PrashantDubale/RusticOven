// Maps a product to a real photo. The backend's ProductOut has an
// optional `image` field (see backend/models.py) but every seeded
// product currently has image: None - the frontend previously fell
// back to a generic ☕ emoji for every single item regardless of
// category (menu grid, product detail, cart, customer dashboard all
// did this independently). Meanwhile /public/images already ships a
// full set of real, on-brand food photography that was only wired
// into the homepage. This resolves, in priority order:
//   1. product.image, if the backend ever actually sets one
//   2. a specific dish photo, matched by name keyword
//   3. a generic photo for the product's category
export const CATEGORY_IMAGE = {
  sandwiches: '/images/rustic-sandwich.png',
  burgers: '/images/rustic-burger.png',
  pizza: '/images/rustic-pizza-hero.png',
  fries: '/images/rustic-fries.png',
  beverages: '/images/rustic-beverage.png',
}

// [keyword, imagePath] pairs, checked against the product name
// (case-insensitive). First match wins, so more specific keywords
// should come first within a category.
const NAME_MATCHERS = [
  ['grilled cheese', '/images/sandwich-grilled-cheese.png'],
  ['paneer burger', '/images/burger-paneer.png'],
  ['paneer', '/images/burger-paneer.png'],
  ['margherita', '/images/pizza-margherita.png'],
  ['farm house', '/images/pizza-farmhouse.png'],
  ['farmhouse', '/images/pizza-farmhouse.png'],
  ['rustic oven special', '/images/pizza-special.png'],
  ['cold coffee', '/images/beverage-cold-coffee.png'],
]

export function getProductImage(product) {
  if (!product) return CATEGORY_IMAGE.pizza
  if (product.image) return product.image

  const name = (product.name || '').toLowerCase()
  for (const [keyword, path] of NAME_MATCHERS) {
    if (name.includes(keyword)) return path
  }

  return CATEGORY_IMAGE[product.category] || CATEGORY_IMAGE.pizza
}
