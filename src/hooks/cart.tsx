import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  async function loadProducts(): Promise<void> {
    const getProducts = await AsyncStorage.getItem('@GoMarketPlace:products');

    if (getProducts) {
      const parsedProducts = JSON.parse(getProducts);
      setProducts(parsedProducts.filter(({ quantity }) => quantity > 0));
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const newProducts = products;
    const exists = products.findIndex(({ id }) => id === product.id);

    if (exists === -1) newProducts.push({ ...product, quantity: 1 });

    await AsyncStorage.setItem(
      '@GoMarketPlace:products',
      JSON.stringify(newProducts),
    );

    loadProducts();
  }, []);

  const increment = useCallback(async id => {
    const newProducts = products;
    const index = products.findIndex(({ id: newId }) => id === newId);

    newProducts[index].quantity += 1;

    await AsyncStorage.setItem(
      '@GoMarketPlace:products',
      JSON.stringify(newProducts),
    );

    loadProducts();
  }, []);

  const decrement = useCallback(async id => {
    const newProducts = products;
    const index = products.findIndex(({ id: newId }) => id === newId);

    newProducts[index].quantity -= 1;

    await AsyncStorage.setItem(
      '@GoMarketPlace:products',
      JSON.stringify(newProducts),
    );

    loadProducts();
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
