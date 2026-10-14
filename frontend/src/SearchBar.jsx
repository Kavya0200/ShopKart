export default function SearchBar({ search, setSearch, category, setCategory, sort, setSort }) {
  return (
    <div className="catalog-filters">
      <input
        type="text"
        placeholder="Search products by name..."
        aria-label="Search products by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={category}
        aria-label="Filter by category"
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="All">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Accessories">Accessories</option>
        <option value="Fashion">Fashion</option>
        <option value="Books">Books</option>
        <option value="Home">Home</option>
        <option value="Stationery">Stationery</option>
        <option value="Jewelry">Jewelry</option>
        <option value="Toys">Toys</option>
        <option value="Marvel">Marvel</option>
        <option value="Keychains">Keychains</option>
      </select>

      <select
        value={sort}
        aria-label="Sort products by price"
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">Sort by Price</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}  