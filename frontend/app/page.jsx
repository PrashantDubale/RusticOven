'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Star, Truck, Award } from 'lucide-react'
import { getProducts } from '@/services/products'
import { formatPrice } from '@/lib/utils-cafe'
import { getProductImage, CATEGORY_IMAGE } from '@/lib/product-images'

export default function Home() {
  // Replaces the static `products` import from lib/mockdata with a
  // real fetch from the backend's /products/ endpoint. Loading state
  // Keep the menu connected to Atlas while rendering the brand hero
  // immediately from a local image.
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products:', err))
  }, [])

  const featured = products.slice(0, 3)
  const pizzas = products.filter((p) => p.category === 'pizza').slice(0, 4)
  const burgers = products.filter((p) => p.category === 'burgers').slice(0, 4)
  const sandwiches = products.filter((p) => p.category === 'sandwiches').slice(0, 4)
  const beverages = products.filter((p) => p.category === 'beverages').slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Large Image with Overlay Content */}
      <section className="relative overflow-hidden md:h-[600px] flex items-center justify-center">
        <img
          src={CATEGORY_IMAGE.pizza}
          alt="Rustic Oven Premium Pizza"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-14 md:py-0 text-center text-white">
          <div className="mb-4 inline-block bg-accent px-4 py-2 rounded-lg font-semibold">
            Best Seller Badge
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
            Rustic Oven
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-lg">
            Premium Wood Fired Kitchen
          </p>
          <p className="text-lg mb-8 text-white/95 drop-shadow-lg max-w-2xl mx-auto">
            Fresh pizzas, burgers, sandwiches, beverages and café specials prepared with quality ingredients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="px-9 h-[44px] w-auto text-[18px] bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors shadow-lg inline-flex items-center justify-center gap-2"
            >
              Order Now
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/menu"
              className="px-9 h-[44px] w-auto text-[18px] bg-white text-primary font-bold rounded-lg hover:bg-primary text-primary hover:text-white transition-colors shadow-lg inline-flex items-center justify-center gap-2"
            >
              Explore Menu
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Specials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Featured Specials</h2>
            <p className="text-lg text-foreground/70">Our chef's signature creations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="h-full">
                <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img 
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {product.isFeatured && (
                      <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star size={14} className="fill-current" />
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">{product.name}</h3>
                    <p className="text-foreground/70 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-2xl font-bold text-accent">{formatPrice(product.price)}</span>
                      <button className="px-5 h-[44px] w-auto inline-flex items-center justify-center bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-[18px]">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Pizzas */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">Signature Pizzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pizzas.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer">
                  <div className="h-40 bg-muted relative">
                    <img 
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1">{product.name}</h3>
                    <p className="text-sm text-foreground/60 mb-3 line-clamp-1">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent">{formatPrice(product.price)}</span>
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded font-semibold hover:bg-primary/90">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Burgers */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">Burgers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {burgers.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer">
                  <div className="h-40 bg-muted">
                    <img 
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1">{product.name}</h3>
                    <p className="text-sm text-foreground/60 mb-3 line-clamp-1">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent">{formatPrice(product.price)}</span>
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded font-semibold hover:bg-primary/90">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sandwiches */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">Sandwiches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sandwiches.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer">
                  <div className="h-40 bg-muted">
                    <img 
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1">{product.name}</h3>
                    <p className="text-sm text-foreground/60 mb-3 line-clamp-1">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent">{formatPrice(product.price)}</span>
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded font-semibold hover:bg-primary/90">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Beverages */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">Beverages & Café</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beverages.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer">
                  <div className="h-40 bg-muted">
                    <img 
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1">{product.name}</h3>
                    <p className="text-sm text-foreground/60 mb-3 line-clamp-1">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent">{formatPrice(product.price)}</span>
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded font-semibold hover:bg-primary/90">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Rustic Oven */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Why Choose Rustic Oven</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Award size={48} className="mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-2">Premium Quality</h3>
              <p className="text-white/90">Imported ingredients and authentic recipes</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck size={48} className="mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-white/90">Hot meals delivered in 30 minutes or less</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Star size={48} className="mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-2">Wood-Fired</h3>
              <p className="text-white/90">Authentic wood-fired oven baked dishes</p>
            </div>
          </div>
        </div>
      </section>

      {/* About — the navbar's "About" link (href="/#about") scrolls
      here. This section, and Contact below, didn't exist anywhere in
      the original v0 project at all — the nav already had working
      links pointing at #about/#contact, but nothing on the page ever
      defined those IDs, so clicking them did nothing. */}
      <section id="about" className="py-16 md:py-24 bg-background scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Our Story</h2>
              <p className="text-lg text-foreground/80 mb-4 leading-relaxed">
                Rustic Oven is a portfolio demo for a cozy wood-fired kitchen. Explore a
                sample menu of pizzas, burgers, sandwiches, fries, and café drinks.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed">
                The site demonstrates a restaurant menu and ordering flow. Menu prices and
                availability are sample data; it does not accept real orders.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg h-80">
              <img
                src="/images/rustic-pizza-hero.png"
                alt="Rustic Oven wood-fired pizza"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact — the navbar's "Contact" link (href="/#contact")
      scrolls here. */}
      <section id="contact" className="py-16 md:py-24 bg-muted scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12 text-center">About This Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 text-center shadow">
              <Award size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-bold text-lg mb-2">Sample Menu</h3>
              <p className="text-foreground/70">Browse 22 dishes across five categories.</p>
            </div>
            <div className="bg-card rounded-xl p-8 text-center shadow">
              <Truck size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-bold text-lg mb-2">Ordering Flow</h3>
              <p className="text-foreground/70">Try the demo cart and checkout screens.</p>
            </div>
            <div className="bg-card rounded-xl p-8 text-center shadow">
              <Star size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-bold text-lg mb-2">Portfolio Project</h3>
              <p className="text-foreground/70">Menu prices and availability are sample data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Explore?</h2>
          <p className="text-xl mb-8 text-white/95">Browse the demo menu and sample ordering experience</p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-9 h-[44px] w-auto text-[18px] bg-white text-accent font-bold rounded-lg hover:bg-primary hover:text-white transition-colors shadow-lg"
          >
            Browse Full Menu
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
