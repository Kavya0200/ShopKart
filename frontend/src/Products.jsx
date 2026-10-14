import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { fetchProducts } from './api';

export default function Products() {
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('All');
	const [sort, setSort] = useState('');
	const [result, setResult] = useState(null);
	const filterKey = JSON.stringify([search, category, sort]);

	useEffect(() => {
		let isCurrent = true;

		fetchProducts({ search, category, sort })
			.then((items) => {
				if (isCurrent) setResult({ key: filterKey, products: items, error: '' });
			})
			.catch(() => {
				if (isCurrent) {
					setResult({ key: filterKey, products: [], error: 'Products could not be loaded. Please try again.' });
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [search, category, sort, filterKey]);

	const loading = result?.key !== filterKey;
	const products = loading ? [] : result.products;
	const error = loading ? '' : result.error;

	return (
		<main className="catalog-page">
			<header className="catalog-heading">
				<div>
					<span className="eyebrow">The ShopKart edit</span>
					<h1>Find your next favorite.</h1>
				</div>
				<p>Thoughtful picks for everyday living.</p>
			</header>

			<SearchBar
				search={search}
				setSearch={setSearch}
				category={category}
				setCategory={setCategory}
				sort={sort}
				setSort={setSort}
			/>

			{loading ? (
				<p className="catalog-message" role="status">Loading products...</p>
			) : error ? (
				<p className="catalog-message catalog-error" role="alert">{error}</p>
			) : products.length === 0 ? (
				<p className="catalog-message">No products match these filters.</p>
			) : (
				<section className="product-grid" aria-label="Products">
					{products.map((product) => <ProductCard key={product._id} product={product} />)}
				</section>
			)}
		</main>
	);
}
