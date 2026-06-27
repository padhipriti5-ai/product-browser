import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, Package, Tag, DollarSign, Clock, ChevronLeft, ChevronRight, LayoutGrid, ExternalLink, RefreshCw } from "lucide-react";
import { api } from "../services/api";
// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "Electronics" | "Fashion" | "Books" | "Sports" | "Home";

interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  created_at: string;
  updated_at: string;
}

// ─── Data Generation ─────────────────────────────────────────────────────────

const TOTAL_PRODUCTS = 225200;
const PAGE_SIZE = 20;

const CATEGORY_NAMES: Category[] = ["Electronics", "Fashion", "Books", "Sports", "Home"];

const PRODUCT_DATA: Record<Category, { adjectives: string[]; nouns: string[] }> = {
  Electronics: {
    adjectives: ["Pro", "Ultra", "Smart", "Wireless", "Portable", "Advanced", "Compact", "Digital", "Precision", "Elite"],
    nouns: ["Headphones", "Speaker", "Monitor", "Keyboard", "Mouse", "Webcam", "Tablet", "Charger", "Hub", "Earbuds", "Camera", "Projector", "Router", "Drone", "Console"],
  },
  Fashion: {
    adjectives: ["Premium", "Classic", "Slim", "Relaxed", "Tailored", "Vintage", "Modern", "Essential", "Luxe", "Casual"],
    nouns: ["Jacket", "Trousers", "Sneakers", "Tote Bag", "Watch", "Sunglasses", "Scarf", "Boots", "Shirt", "Jeans", "Blazer", "Dress", "Belt", "Cap", "Loafers"],
  },
  Books: {
    adjectives: ["Complete", "Essential", "Advanced", "Practical", "Modern", "Definitive", "Illustrated", "Revised", "Ultimate", "Concise"],
    nouns: ["Guide", "Handbook", "Compendium", "Encyclopedia", "Manual", "Atlas", "Memoir", "Novel", "Anthology", "Workbook", "Journal", "Biography", "Companion", "Reference", "Textbook"],
  },
  Sports: {
    adjectives: ["Performance", "Pro", "Endurance", "Flex", "Impact", "Speed", "Power", "Ultra", "Agile", "Core"],
    nouns: ["Running Shoes", "Yoga Mat", "Resistance Bands", "Water Bottle", "Backpack", "Gloves", "Helmet", "Jersey", "Shorts", "Dumbbells", "Jump Rope", "Foam Roller", "Tracker", "Bag", "Towel"],
  },
  Home: {
    adjectives: ["Modern", "Minimalist", "Ergonomic", "Bamboo", "Ceramic", "Woven", "Marble", "Artisan", "Linen", "Organic"],
    nouns: ["Lamp", "Cushion", "Throw", "Candle", "Diffuser", "Planter", "Mirror", "Frame", "Rug", "Shelf", "Tray", "Vase", "Curtains", "Clock", "Basket"],
  },
};

const BRANDS: Record<Category, string[]> = {
  Electronics: ["Apex", "Nexus", "Orion", "Vega", "Pulse", "Volt", "Zenith", "Aero", "Nova", "Prism"],
  Fashion: ["Atelier", "Maison", "Studio", "Craft", "Form", "Line", "House", "Arc", "Loft", "Edit"],
  Books: ["Meridian", "Horizon", "Beacon", "Anchor", "Compass", "Summit", "Crest", "Harbor", "Bridge", "Arch"],
  Sports: ["Apex", "Stride", "Kinetic", "Peak", "Forge", "Surge", "Rush", "Drive", "Apex", "Bolt"],
  Home: ["Haven", "Nest", "Grove", "Form", "Craft", "Studio", "Loom", "Clay", "Timber", "Bloom"],
};

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}





// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<Category, string> = {
  Electronics: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  Fashion: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  Books: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  Sports: "bg-green-50 text-green-700 ring-1 ring-green-100",
  Home: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 bg-muted rounded-md flex-1" />
        <div className="h-5 w-20 bg-muted rounded-full" />
      </div>
      <div className="h-3 bg-muted rounded-md w-2/3" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-5 w-16 bg-muted rounded-md" />
        <div className="h-3 w-20 bg-muted rounded-md" />
      </div>
      <div className="h-9 bg-muted rounded-lg w-full" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <div>
        <div className="text-2xl font-semibold text-foreground tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  displayId,
}: {
  product: Product;
  displayId: number;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md hover:border-[#c5d3f0] transition-all duration-200 group">

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>

        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_STYLES[product.category]}`}
        >
          {product.category}
        </span>
      </div>

      <div className="text-xs text-muted-foreground font-medium">
        Product #{displayId}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">
          {formatPrice(product.price)}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span title={formatDate(new Date(product.updated_at))}>
            {timeAgo(new Date(product.updated_at))}
          </span>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-1.5 bg-accent text-primary text-sm font-medium py-2 rounded-lg hover:bg-secondary transition-colors duration-150 group-hover:bg-primary group-hover:text-white">
        <ExternalLink className="w-3.5 h-3.5" />
        View Details
      </button>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-5">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
        <Package className="w-9 h-9 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-lg">No products found</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
      <button
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Clear Filters
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0); // 0-indexed page
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<any>(null);
  const [total, setTotal] = useState(TOTAL_PRODUCTS);
  const [recentCount, setRecentCount] = useState(0);
  console.log("search =", search);
  console.log("debouncedSearch =", debouncedSearch);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, category]);

  // Load products

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let url = "https://product-browser-1-lgza.onrender.com/products?limit=500";
        if (category) {
          url += `&category=${category}`;
        }
        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        console.log("URL:", url);

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        console.log("recent_count =", data.recent_count);
        console.log("count =", data.count);
        console.log("products length =", data.products.length);
        console.log("API products =", data.products);

        setProducts(data.products);
        setTotal(data.count);
        setRecentCount(data.recent_count);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, debouncedSearch]);


  const totalPages = Math.ceil(total / PAGE_SIZE);

  const paginatedProducts = products.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );
  const hasFilters = !!debouncedSearch || !!category;

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setPage(0);
  }, []);

  // Stats
  const avgPrice = useMemo(() => {
    if (products.length === 0) return 0;

    return (
      products.reduce((sum, p) => sum + p.price, 0) /
      products.length
    );
  }, [products]);


  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm leading-none">Product Browser</div>
                <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Browse and manage 200000+ products efficiently</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                {formatNumber(total)} products
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page hero ── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Search and filter across {formatNumber(total)} products in 5 categories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Package} label="Total Products" value={formatNumber(total)} sub="across all categories" />
          <StatCard icon={Tag} label="Categories" value="5" sub="Electronics, Fashion & more" />
          <StatCard icon={DollarSign} label="Average Price" value={formatPrice(avgPrice)} sub="across catalog" />
          <StatCard
            icon={Clock}
            label="Recently Updated"
            value={formatNumber(recentCount)}
            sub="in the last 7 days"
          />
        </div>

        {/* ── Search & Filter ── */}
        <div className="bg-card rounded-xl border border-border p-4 sticky top-16 z-20 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by name or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground text-foreground"
              />
            </div>

            {/* Category */}
            <div className="flex gap-2 shrink-0">
              <div className="relative">
                <select
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value);
                    setSearch("");
                    setDebouncedSearch("");
                    setPage(0);
                  }}
                  className="appearance-none pl-4 pr-9 py-2.5 text-sm bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Books">Books</option>
                  <option value="Sports">Sports</option>
                  <option value="Home">Home</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Active filter tags */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full ring-1 ring-blue-100">
                  <Search className="w-3 h-3" />
                  "{debouncedSearch}"
                  <button onClick={() => { setSearch(""); setDebouncedSearch(""); }} className="hover:text-blue-900 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${CATEGORY_STYLES[category as Category]}`}>
                  <Tag className="w-3 h-3" />
                  {category}
                  <button onClick={() => setCategory("")} className="ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-xs text-muted-foreground self-center">
                {loading ? "Searching…" : `${formatNumber(total)} result${total !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </div>

        {/* ── Products Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Loading products…
                </span>
              ) : (
                <>
                  Total Products: {formatNumber(total)}
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="text-xs text-muted-foreground">
                Page {page + 1} of {formatNumber(totalPages)}
              </div>
            )}
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : products.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              paginatedProducts.map((p, index) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  displayId={page * PAGE_SIZE + index + 1}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Pagination ── */}
        {!loading && products.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            {/* Load more */}
            <div className="order-2 sm:order-1">
              {page < totalPages - 1 && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-5 py-2.5 text-sm font-medium text-primary bg-accent rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-blue-200"
                >
                  Load more products
                </button>
              )}
            </div>

            {/* Prev / Next */}
            <div className="order-1 sm:order-2 flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page numbers (show a sliding window) */}
              <div className="hidden sm:flex items-center gap-1">
                {(() => {
                  const pages: (number | "...")[] = [];
                  const total_p = Math.min(totalPages, 9999);
                  if (total_p <= 7) {
                    for (let i = 0; i < total_p; i++) pages.push(i);
                  } else {
                    pages.push(0);
                    if (page > 2) pages.push("...");
                    const start = Math.max(1, page - 1);
                    const end = Math.min(total_p - 2, page + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (page < total_p - 3) pages.push("...");
                    pages.push(total_p - 1);
                  }
                  return pages.map((p_val, idx) =>
                    p_val === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm select-none">…</span>
                    ) : (
                      <button
                        key={p_val}
                        onClick={() => setPage(p_val as number)}
                        className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${page === p_val
                          ? "bg-primary text-white"
                          : "border border-border bg-card hover:bg-muted text-foreground"
                          }`}
                      >
                        {(p_val as number) + 1}
                      </button>
                    )
                  );
                })()}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-6 pb-4 text-center text-xs text-muted-foreground">
          Product Browser · {formatNumber(total)} products across 5 categories · Built with React
        </div>
      </div>
    </div>
  );
}
