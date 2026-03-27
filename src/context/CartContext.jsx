import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case "UPDATE_QTY":
      if (action.qty <= 0) return state.filter((i) => i.productId !== action.productId);
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: action.qty } : i
      );
    case "REMOVE":
      return state.filter((i) => i.productId !== action.productId);
    case "CLEAR":
      return [];
    case "INIT":
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(
    cartReducer,
    [],
    () => {
      try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
      } catch {
        return [];
      }
    }
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const totalCount  = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const addItem    = (product) => dispatch({ type: "ADD", item: { productId: product.id, name: product.name, price: product.price, imageUrl: product.main_image_url } });
  const updateQty  = (productId, qty) => dispatch({ type: "UPDATE_QTY", productId, qty });
  const removeItem = (productId) => dispatch({ type: "REMOVE", productId });
  const clear      = () => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider value={{ items, totalCount, totalAmount, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
