import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addToCartApi, addToWishlistApi, removeFromWishlistApi } from './api';
import { notifyToast } from './toastBus';

const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 600%22%3E%3Crect width=%22800%22 height=%22600%22 fill=%22%23e5e7de%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%2369736b%22 font-family=%22sans-serif%22 font-size=%2232%22%3EImage unavailable%3C/text%3E%3C/svg%3E';
const productBadges = {
	'Plush Teddy Bear': '🧸 Cute Choice',
	'Wooden Building Blocks': '🧸 Cute Choice',
	'Iron Man Mark 85 with Arc Reactor': '🔥 Best Seller',
	'Spider-Man Poseable Figure': '🕷️ Fan Favorite',
	'Kawaii Boba Milk Tea Keychain': '🧋 Trending',
	'Plush Astronaut Charm': '🧸 Cute Choice'
};

export default function ProductCard({ product, onRemoveFromWishlist }) {
	const [adding, setAdding] = useState(false);
	const [addingToCart, setAddingToCart] = useState(false);
	const [isWishlisted, setIsWishlisted] = useState(Boolean(onRemoveFromWishlist));
	const navigate = useNavigate();
	const category = String(product.category || '').toLowerCase();
	const badge = product.badge || productBadges[product.name] || (category.includes('jewel')
		? '✨ Best Seller'
		: category.includes('top') ? '💎 New Arrival' : '');

	const toggleWishlist = async () => {
		setAdding(true);
		try {
			if (onRemoveFromWishlist) {
				await onRemoveFromWishlist(product._id);
			} else if (isWishlisted) {
				await removeFromWishlistApi(product._id);
			} else {
				await addToWishlistApi(product._id);
			}
			setIsWishlisted(!isWishlisted);
			notifyToast(isWishlisted ? 'Removed from your wishlist' : 'Added to your wishlist 💗', 'success');
		} catch (error) {
			if (error.response?.status === 401) {
				navigate('/login');
				return;
			}
			notifyToast(error.response?.data?.message || 'Could not update your wishlist.', 'error');
		} finally {
			setAdding(false);
		}
	};

	const addToCart = async () => {
		setAddingToCart(true);
		try {
			await addToCartApi(product._id);
			notifyToast(`${product.name} added to your cart 🛍️`, 'success');
		} catch (error) {
			if (error.response?.status === 401) {
				navigate('/login');
				return;
			}
			notifyToast(error.response?.data?.message || 'Could not add this product.', 'error');
		} finally {
			setAddingToCart(false);
		}
	};

	return (
		<article className="product-card">
			<div className="product-card-media">
			<Link className="product-card-image-link" to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
				<img
					className="product-card-image"
					src={product.image}
					alt={product.name}
					loading="lazy"
					onError={(event) => {
						event.currentTarget.onerror = null;
						event.currentTarget.src = fallbackImage;
					}}
				/>
			</Link>
			{badge && <span className="product-badge">{badge}</span>}
			<button className={`wishlist-heart${isWishlisted ? ' is-active' : ''}`} type="button" onClick={toggleWishlist} disabled={adding} aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={isWishlisted}>
				<svg aria-hidden="true" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
			</button>
			</div>
			<div className="product-card-content">
				<div className="product-card-meta">
					<span>{product.category}</span>
					<span>{product.stock > 0 ? 'In stock' : 'Sold out'}</span>
				</div>
				<h2>{product.name}</h2>
				<p className="product-card-description">{product.description}</p>
				<div className="product-card-footer">
					<strong>${Number(product.price).toFixed(2)}</strong>
					<Link to={`/products/${product._id}`}>View details <span aria-hidden="true">-&gt;</span></Link>
				</div>
				<button className="cart-action-button" type="button" onClick={addToCart} disabled={addingToCart || product.stock < 1}>
					{product.stock < 1 ? 'Out of stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
				</button>
			</div>
		</article>
	);
}
