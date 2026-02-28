export default function ReceiptView({ receipt }) {
  return (
    <div className="max-w-md mx-auto bg-white p-6 border rounded-xl">
      <h2 className="text-center text-lg font-bold mb-4">
        School Fee Receipt
      </h2>

      <p>Receipt No: {receipt.receiptNo}</p>
      <p>Student: {receipt.studentName}</p>
      <p>Amount Paid: ₹{receipt.amount}</p>
      <p>Mode: {receipt.paymentMode}</p>
      <p>Date: {new Date(receipt.paidAt).toLocaleDateString()}</p>

      <button
        onClick={() => window.print()}
        className="btn-primary w-full mt-4"
      >
        Print Receipt
      </button>
    </div>
  );
}
