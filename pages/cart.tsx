import {useEffect, useState} from 'react';
import Link from 'next/link';
import LoadingOverlay from 'react-loading-overlay-ts';
import toast from 'react-hot-toast';

import {useCart} from '@/context/CartContext';
import styles from '@/app/cart.module.css';
import {PaymentOptions, Product} from "@/context/cartTypes";
declare global {
    interface Window {
        GetPay: new (arg0: PaymentOptions) => {initialize: () => void};
    }
}

const Cart = () => {
    const {cartItems, removeFromCart, calculateTotal, clearCart, calculateCheckoutTotal} = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [isGetPayReady, setIsGetPayReady] = useState(false);

    const BUNDLE_URL = process.env.NEXT_PUBLIC_BUNDLE_URL || 'https://minio.finpos.global/getpay-cdn/webcheckout/v5/bundle.js';

    const getOrderInformationHtml = (cartItems: Product[], totalAmount: number) => {
        let html = `
            <div>
              <h3>Order Information</h3>
              <div class="item" style="margin-bottom: 20px;">`;
        cartItems.forEach((cartItem) => {
            const productName = cartItem?.name;
            const productPrice = cartItem?.price.toFixed(2);
            const productImageUrl = cartItem?.image;

            html += `
              <div class="item" style="margin-bottom: 20px; display: flex; align-items: center;">
                <img style="max-width: 50px; margin-right: 10px;" src="${productImageUrl}" alt="${productName}">
                <p>${productName}&nbsp;</p>
                <span>Rs ${productPrice}</span>
              </div>`;
        });

        html += `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background-color: #ddd; margin-top: 20px; border-radius: 5px;" class="total">
                <label>Total:</label>
                <span>Rs ${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>`;

        return html;
    };

    const orderInformationHtml = getOrderInformationHtml(cartItems, calculateTotal());

    const initializeGetPay = () => {
        if (!window.GetPay || !isGetPayReady) {
            toast.error('Payment system is not ready yet. Please try again.');
            return;
        }

        setIsLoading(true);
        const options:PaymentOptions = {
            userInfo: {
                name: "John Doe",
                email: "john@gmail.com",
                state: "Bagmati",
                country: "Nepal",
                zipcode: "44600",
                city: "Kathmandu",
                address: "Chabahil",
            },
            clientRequestId: "CLIENT123",
            papInfo: process.env.NEXT_PUBLIC_PAP_INFO,
            oprKey: process.env.NEXT_PUBLIC_OPR_KEY,
            insKey: process.env.NEXT_PUBLIC_INS_KEY,
            websiteDomain: process.env.NEXT_PUBLIC_WEBSITE_DOMAIN,
            price: calculateTotal(),
            businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME,
            imageUrl: process.env.NEXT_PUBLIC_LOGO_URL,
            currency: "NPR",
            baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://getpay-uat.machbank.com/ecom-gateway/v1/secure-merchant/transactions',
            prefill: {
                name: true, email: true, state: true, city: true, address: true, zipcode: true, country: true
            },
            disableFields: {
                address: true, state: true,
            },
            callbackUrl: {
                successUrl: process.env.NEXT_PUBLIC_SUCCESS_URL, failUrl: process.env.NEXT_PUBLIC_FAIL_URL,
            },
            themeColor: "#5662FF",
            orderInformationUI: `${orderInformationHtml}`,
            onSuccess: () => {
                window.location.href = "./payment";
            },
            onError: (error:{error:string}) => {
                setIsLoading(false);
                toast?.error(error?.error)
                console.log("Error details:", error);
            },
        };


        const getPay = new window.GetPay(options);
        getPay.initialize();
    };

    useEffect(() => {
        if (cartItems?.length > 0) {
            const script = document.createElement('script');
            script.src = BUNDLE_URL;
            script.async = true;
            script.onload = () => {
                console.log('GetPay script loaded successfully');
                setTimeout(() => {
                    setIsGetPayReady(true);
                }, 100);
            };
            document.body.appendChild(script);
            
            return () => {
                document.body.removeChild(script);
                setIsGetPayReady(false);
            };
        }
    }, [cartItems, BUNDLE_URL]);

    return (<LoadingOverlay
            active={isLoading}
            spinner
            text="Loading..."
            styles={{
                wrapper: {
                    width: '100%', height: '100%', position: 'relative', zIndex: 9999,
                }, overlay: (base) => ({
                    ...base,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }), spinner: (base) => ({
                    ...base, width: '100px', // Customize the spinner size if necessary
                }), content: {
                    textAlign: 'center', color: '#fff', fontSize: '20px', // Customize the loading text size
                },
            }}
        >
            <div className={styles.cartContainer}>
                <h1>My Cart</h1>
                {cartItems?.length === 0 ? (<div className={styles.emptyCart}>
                        <h2>Your cart is empty</h2>
                        <Link href="/" className={styles.shopLink}>Go back to shopping</Link>
                    </div>) : (<>
                        <ul className={styles.cartList}>
                            {cartItems.map((item, idx) => (<li key={idx} className={styles.cartItem}>
                                    <div className={styles.productImage}>
                                        <img src={item?.image} alt={item?.name}/>
                                    </div>
                                    <div className={styles.productDetails}>
                                        <h2>{item?.name}</h2>
                                        <p>Rs {item?.price}</p>
                                        <button onClick={() => removeFromCart(item?.id)} className={styles.removeBtn}>
                                            Remove
                                        </button>
                                    </div>
                                </li>))}
                        </ul>

                        <div className={styles.cartSummary}>
                            <h2>Total: Rs {calculateCheckoutTotal()}</h2>
                            <button onClick={clearCart} className={styles.clearBtn}>
                                Clear Cart
                            </button>
                            <div className={styles.checkoutContainer}>
                                <div id="checkout" hidden></div>
                                <button id="checkout-btn" className={styles.checkoutBtn}
                                        onClick={initializeGetPay}>Checkout
                                </button>
                            </div>
                        </div>
                    </>)}
            </div>
        </LoadingOverlay>);
};

export default Cart;
