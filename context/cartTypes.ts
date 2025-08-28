export interface PaymentOptions {
    userInfo: {
        name: string;
        email: string;
        state: string;
        country: string;
        zipcode: string;
        city: string;
        address: string;
    };
    clientRequestId: string;
    papInfo?: string;
    oprKey?: string;
    insKey?: string;
    websiteDomain?: string;
    price: number;
    businessName?: string;
    imageUrl?: string;
    currency: string;
    baseUrl:string;
    prefill: {
        name: boolean;
        email: boolean;
        state: boolean;
        city: boolean;
        address: boolean;
        zipcode: boolean;
        country: boolean;
    };
    disableFields: {
        address: boolean;
        state: boolean;
    };
    callbackUrl: {
        successUrl?: string;
        failUrl?: string;
    };
    themeColor: string;
    orderInformationUI: string;
    onSuccess: () => void;
    onError: (error: { error: string }) => void;
}

export interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    brand: string;
    availableSizes: number[];
    description: string;
}

export interface CartContextType {
    cartItems: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    calculateTotal: () => number;
    getCartItemCount: () => number;
    calculateCheckoutTotal: () => string;
}
