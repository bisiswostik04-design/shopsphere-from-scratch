import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:18082/api/products";

const productPhotos = {
  iphone: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85",
  phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
  macbook: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  jacket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
  tv: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85",
  home: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=85",
  default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
};

function getProductImage(product) {
  const name = `${product.name || product.title || ""} ${product.category || ""}`.toLowerCase();

  if (name.includes("iphone")) return productPhotos.iphone;
  if (name.includes("macbook")) return productPhotos.macbook;
  if (name.includes("laptop")) return productPhotos.laptop;
  if (name.includes("headphone") || name.includes("sony")) return productPhotos.headphones;
  if (name.includes("nike") || name.includes("shoe") || name.includes("sneaker")) return productPhotos.shoes;
  if (name.includes("jacket") || name.includes("adidas") || name.includes("fashion")) return productPhotos.jacket;
  if (name.includes("tv") || name.includes("television") || name.includes("samsung")) return productPhotos.tv;
  if (name.includes("home")) return productPhotos.home;
  if (name.includes("phone") || name.includes("mobile")) return productPhotos.phone;

  return productPhotos.default;
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price unavailable";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getCategory(product) {
  const text = `${product.name || product.title || ""} ${product.category || ""}`.toLowerCase();
  if (/iphone|phone|mobile|macbook|laptop|sony|headphone|samsung|tv/.test(text)) return "Electronics";
  if (/nike|shoe|sneaker|adidas|jacket|fashion|shirt|clothing/.test(text)) return "Fashion";
  if (/home|kitchen|decor|lamp|furniture/.test(text)) return "Home";
  return product.category || "Featured";
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [bag, setBag] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.products || data.data || data.items || [];

        if (active) {
          setProducts(list);
          setApiError("");
        }
      })
      .catch(() => {
        if (active) setApiError("We couldn't reach the product service. Check that the API gateway is running on port 18082.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = ["All", "Electronics", "Fashion", "Home"];

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = String(product.name || product.title || "Product");
      const matchesSearch = !term || name.toLowerCase().includes(term);
      const matchesCategory = category === "All" || getCategory(product) === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const bagCount = bag.reduce((total, item) => total + item.quantity, 0);
  const bagTotal = bag.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);

  function addToBag(product) {
    const id = product._id || product.id || product.name || product.title;
    setBag((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...current,
        {
          id,
          name: product.name || product.title || "Product",
          price: Number(product.price || 0),
          image: getProductImage(product),
          quantity: 1,
        },
      ];
    });

    setNotice(`${product.name || product.title || "Product"} added to your bag`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function toggleWishlist(product) {
    const id = product._id || product.id || product.name || product.title;
    setWishlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <div className="shop">
      <div className="announcement">
        <span>Complimentary delivery on orders over ₹1,999</span>
        <span className="announcement-right">Thoughtfully picked. Made for everyday.</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="ShopSphere home">
          <span className="brand-mark">S</span>
          <span>shop<span className="brand-light">sphere</span></span>
        </a>

        <div className="header-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search products"
            placeholder="Search for products, brands and more"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && <button onClick={() => setSearch("")} aria-label="Clear search">×</button>}
        </div>

        <div className="header-actions">
          <button className="header-action" onClick={() => {
            setCategory("All");
            setNotice(wishlist.length ? `${wishlist.length} item(s) in your wishlist` : "Your wishlist is waiting for a favourite");
            window.setTimeout(() => setNotice(""), 2200);
          }}>
            <span className="action-icon">♡</span>
            <span>Wishlist <b>{wishlist.length}</b></span>
          </button>
          <button className="header-action bag-action" onClick={() => setBagOpen(true)}>
            <span className="action-icon">▱</span>
            <span>Bag <b>{bagCount}</b></span>
          </button>
        </div>
      </header>

      <nav className="main-nav" aria-label="Main navigation">
        <div className="nav-links">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "nav-link active" : "nav-link"}
              onClick={() => setCategory(item)}
            >
              {item === "All" ? "Shop all" : item}
            </button>
          ))}
          <a className="nav-link" href="#new-arrivals">New arrivals</a>
          <a className="nav-link" href="#our-promise">Our promise</a>
        </div>
        <span className="nav-note">A little something for every day</span>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> THE EVERYDAY EDIT</span>
            <h1>Good things.<br /><em>Better living.</em></h1>
            <p>Discover useful little luxuries and everyday favourites, thoughtfully brought together in one place.</p>
            <button className="primary-button" onClick={() => {
              setCategory("All");
              document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Explore the collection <span>↗</span>
            </button>
            <div className="hero-proof">
              <div className="proof-avatars"><span>✦</span><span>✿</span><span>◈</span></div>
              <span>Loved by shoppers who value the little things</span>
            </div>
          </div>
          <div className="hero-visual" role="img" aria-label="Curated everyday products">
            <div className="hero-image" />
            <div className="hero-caption">
              <span>THE NEW SEASON</span>
              <strong>Find your everyday favourite.</strong>
            </div>
            <div className="hero-sticker"><span>GOOD<br />FINDS</span><b>✳</b></div>
          </div>
        </section>

        <section className="promise-strip" id="our-promise">
          <div><span className="promise-icon">↗</span><span><strong>Easy delivery</strong><small>Convenience, right to you</small></span></div>
          <div><span className="promise-icon">♡</span><span><strong>Thoughtful finds</strong><small>Everyday things, well chosen</small></span></div>
          <div><span className="promise-icon">✓</span><span><strong>Secure checkout</strong><small>Shop with confidence</small></span></div>
        </section>

        <section className="products-section" id="new-arrivals">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A FEW GOOD THINGS</span>
              <h2>Worth a closer look<span>.</span></h2>
              <p>Useful favourites for work, weekends and everything in between.</p>
            </div>
            <div className="product-count">{visibleProducts.length} products <span>↘</span></div>
          </div>

          <div className="filter-row">
            <div className="category-pills">
              {categories.map((item) => (
                <button key={item} onClick={() => setCategory(item)} className={category === item ? "filter-pill selected" : "filter-pill"}>
                  {item}
                </button>
              ))}
            </div>
            <span className="sort-note">CURATED FOR YOU</span>
          </div>

          {loading && <div className="state-message">Finding your good things…</div>}
          {apiError && <div className="state-message error-message">{apiError}</div>}

          {!loading && !apiError && visibleProducts.length === 0 && (
            <div className="state-message">No products found. Try another search or category.</div>
          )}

          <div className="product-grid">
            {visibleProducts.map((product, index) => {
              const id = product._id || product.id || product.name || product.title || index;
              const name = product.name || product.title || "Everyday essential";
              const stock = Number(product.stock ?? product.quantity ?? 0);
              const isWishlisted = wishlist.includes(id);

              return (
                <article className="product-card" key={id}>
                  <div className="product-photo-wrap">
                    <img
                      className="product-photo"
                      src={getProductImage(product)}
                      alt={name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = productPhotos.default;
                      }}
                    />
                    <span className="product-tag">{index < 3 ? "THE EDIT" : getCategory(product).toUpperCase()}</span>
                    <button
                      className={isWishlisted ? "wishlist-button wishlisted" : "wishlist-button"}
                      aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
                      onClick={() => toggleWishlist(product)}
                    >
                      {isWishlisted ? "♥" : "♡"}
                    </button>
                    <button className="quick-add" onClick={() => addToBag(product)}>
                      Add to bag <span>+</span>
                    </button>
                  </div>
                  <div className="product-details">
                    <div className="product-category">{getCategory(product)}</div>
                    <h3>{name}</h3>
                    <div className="product-bottom">
                      <strong>{formatPrice(product.price)}</strong>
                      <span className={stock > 0 ? "stock-label" : "stock-label out-of-stock"}>
                        {stock > 0 ? "In stock" : "Check availability"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="closing-banner">
          <div><span className="eyebrow">A BETTER KIND OF BROWSE</span><h2>Everyday, made<br /><em>a little more lovely.</em></h2></div>
          <button className="light-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to the top ↑</button>
          <span className="closing-flower">✳</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark">S</span><span>shop<span className="brand-light">sphere</span></span></a>
        <span>Good things for real life.</span>
        <span>© {new Date().getFullYear()} ShopSphere</span>
      </footer>

      {notice && <div className="toast" role="status">{notice}</div>}

      {bagOpen && (
        <div className="drawer-backdrop" onClick={() => setBagOpen(false)}>
          <aside className="bag-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading">
              <div><span className="eyebrow">YOUR PICKS</span><h2>Your bag <span>({bagCount})</span></h2></div>
              <button className="close-drawer" onClick={() => setBagOpen(false)} aria-label="Close bag">×</button>
            </div>
            {bag.length === 0 ? (
              <div className="empty-bag"><span>▱</span><h3>Your bag is taking a little break.</h3><p>When something catches your eye, add it here.</p><button className="primary-button" onClick={() => setBagOpen(false)}>Keep exploring</button></div>
            ) : (
              <>
                <div className="bag-items">
                  {bag.map((item) => (
                    <div className="bag-item" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <div className="bag-item-info"><strong>{item.name}</strong><span>{formatPrice(item.price)}</span><div className="quantity-control"><button onClick={() => setBag((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>−</button><span>{item.quantity}</span><button onClick={() => setBag((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button><button className="remove-item" onClick={() => setBag((current) => current.filter((entry) => entry.id !== item.id))}>Remove</button></div></div>
                    </div>
                  ))}
                </div>
                <div className="bag-total"><span>Subtotal</span><strong>{formatPrice(bagTotal)}</strong></div>
                <p className="checkout-note">Checkout and payment are not connected yet.</p>
                <button className="primary-button checkout-button" onClick={() => setNotice("Checkout is the next feature to connect.")}>Continue to checkout <span>↗</span></button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
