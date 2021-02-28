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
  remove(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  async function loadProducts(): Promise<void> {
    // await AsyncStorage.clear();
    const storegedProducts = await AsyncStorage.getItem(
      '@GoMarketPlace:products',
    );
    if (storegedProducts) {
      setProducts([...JSON.parse(storegedProducts)]);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // verificar se o produto já existe,
      // caso sim, apenas incrementar a quantidade, caso não, criar um novo
      const productExists = products.find(
        singleProduct => singleProduct.id === product.id,
      );

      if (productExists !== undefined) {
        setProducts(
          products.map(singleProduct =>
            singleProduct.id === product.id
              ? { ...product, quantity: singleProduct.quantity + 1 }
              : singleProduct,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const addProduct = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      setProducts(addProduct);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(addProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const removeProduct = products.map(singleProduct =>
        singleProduct.id === id
          ? {
            ...singleProduct,
            quantity:
              singleProduct.quantity <= 1
                ? singleProduct.quantity
                : singleProduct.quantity - 1,
          }
          : singleProduct,
      );
      setProducts(removeProduct);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(removeProduct),
      );
    },
    [products],
  );

  const remove = useCallback(
    async id => {
      const removedProduct = products.filter(function (i) {
        return i.id !== id;
      });

      setProducts(removedProduct);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(removedProduct),
      );
      loadProducts();
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, remove, products }),
    [products, addToCart, increment, decrement, remove],
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
