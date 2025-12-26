import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiX, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart } = useCart();

  // Disable body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isCartOpen ? "visible" : "invisible"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 w-full md:w-[400px] h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-bg-color">
            <h2 className="text-lg font-bold text-font-title">
              Your Shopping Bag ({cartItems.length})
            </h2>
            <button
              onClick={closeCart}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <FiShoppingBag size={64} className="mb-4 text-green-200" />
                <p className="font-medium text-gray-500 tracking-wide">
                  YOUR BAG IS EMPTY
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-gray-100 pb-4"
                  >
                    <div className="relative w-20 h-20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2 mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-font-title text-sm mb-1 line-clamp-2">
                        <Link href={`/product/${item.id}`}>{item.name}</Link>
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-500">
                          {item.quantity} x{" "}
                          <span className="font-bold text-font-title">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (Subtotal & Buttons) */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between mb-4 text-font-title font-bold">
                <span>Subtotal:</span>
                <span>
                  ₹
                  {cartItems
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
              <button className="w-full bg-primary text-white py-3 rounded-sm font-bold hover:bg-opacity-90 transition-opacity mb-2">
                CHECKOUT
              </button>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full text-center text-font-title text-sm font-medium hover:text-primary"
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
