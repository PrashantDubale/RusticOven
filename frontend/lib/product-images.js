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

// Each seeded menu item has its own image file. A few categories only
// shipped with one source photo, so those variants are locally cropped
// and color-balanced from the supplied photography in /public/images.
const DISH_IMAGES = {
  'bread butter': '/images/dishes/bread-butter.webp',
  'veg sandwich': '/images/dishes/veg-sandwich.webp',
  'cheese sandwich': '/images/dishes/cheese-sandwich.webp',
  'chutney sandwich': '/images/dishes/chutney-sandwich.webp',
  'paneer sandwich': '/images/dishes/paneer-sandwich.webp',
  'jain sandwich': '/images/dishes/jain-sandwich.webp',
  'grilled cheese': '/images/dishes/grilled-cheese.webp',
  'veg burger': '/images/dishes/veg-burger.webp',
  'falafel burger': '/images/dishes/falafel-burger.webp',
  'paneer burger': '/images/dishes/paneer-burger.webp',
  'margherita pizza': '/images/dishes/margherita-pizza.webp',
  'neapolitan pizza': '/images/dishes/neapolitan-pizza.webp',
  'farm house pizza': '/images/dishes/farm-house-pizza.webp',
  'veg delight pizza': '/images/dishes/veg-delight-pizza.webp',
  'rustic oven special pizza': '/images/dishes/rustic-oven-special-pizza.webp',
  'salted fries': '/images/dishes/salted-fries.webp',
  'peri peri fries': '/images/dishes/peri-peri-fries.webp',
  'cheese fries': '/images/dishes/cheese-fries.webp',
  'peri peri cheese fries': '/images/dishes/peri-peri-cheese-fries.webp',
  'hot coffee': '/images/dishes/hot-coffee.webp',
  'cold coffee': '/images/dishes/cold-coffee.webp',
  'cold coffee with crush': '/images/dishes/cold-coffee-with-crush.webp',
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
  const name = (product.name || '').toLowerCase()
  // Prefer our local dish photo over legacy image paths already stored
  // in Atlas. Existing records may still reference one generic image.
  if (DISH_IMAGES[name]) return DISH_IMAGES[name]
  for (const [keyword, path] of NAME_MATCHERS) {
    if (name.includes(keyword)) return path
  }

  if (product.image) return product.image

  return CATEGORY_IMAGE[product.category] || CATEGORY_IMAGE.pizza
}
