import Link from 'next/link'

import { useCart } from '@/context/CartContext';
import {products} from '@/mock';
import styles from '@/app/product.module.css';

const Index = () => {
    const { addToCart, getCartItemCount } = useCart();

    return (
        <div className={styles.productContainer}>
            <header className={styles.header}>
                <h1>Product List</h1>
                <div className={styles.cartCountContainer}>
                    <Link href="/cart">
                    <span className={styles.cartCountIcon}>🛒</span>
                    <span className={styles.cartCount}>{getCartItemCount()} items</span>
                    </Link>
                </div>
            </header>
            <div className={styles.productGrid}>
                {products?.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                        <img src={product.image} alt={product.name} className={styles.productImage} />
                        <div className={styles.productDetails}>
                            <h2>{product.name}</h2>
                            <p>{product.description}</p>
                            <p className={styles.productPrice}>Rs {product.price.toFixed(2)}</p>
                            <button onClick={() => addToCart(product)} className={styles.addToCartBtn}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Index;
