import React from "react";

export default function PaymentSelector({ paymentMethod, setPaymentMethod }) {
     return (
          <div className="mt-6 pt-6 border-t border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4">Payment</h3>

               <div
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all mb-3 ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                         }`}
                    onClick={() => setPaymentMethod("COD")}
               >
                    <input
                         type="radio"
                         name="paymentMethod"
                         value="COD"
                         checked={paymentMethod === "COD"}
                         onChange={() => setPaymentMethod("COD")}
                         className="text-primary focus:ring-primary"
                    />
                    <span className="font-medium">Cash on Delivery (COD)</span>
               </div>

               <div
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "Online" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                         }`}
                    onClick={() => setPaymentMethod("Online")}
               >
                    <input
                         type="radio"
                         name="paymentMethod"
                         value="Online"
                         checked={paymentMethod === "Online"}
                         onChange={() => setPaymentMethod("Online")}
                         className="text-primary focus:ring-primary"
                    />
                    <div>
                         <span className="font-medium block">Pay via Razorpay</span>
                         <span className="text-xs text-gray-500">UPI, Cards, NetBanking</span>
                    </div>
               </div>
          </div>
     );
}
