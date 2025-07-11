import { Link } from "wouter";
import { FiX, FiHome } from "react-icons/fi";

export default function Cancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-white to-accent flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="card bg-base-100 shadow-xl p-8">
          <FiX className="mx-auto h-16 w-16 text-error mb-4" />
          <h1 className="text-2xl font-bold text-error mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled and nothing was charged to your account.
          </p>
          <Link href="/">
            <button className="btn btn-primary">
              <FiHome className="h-4 w-4 mr-2" />
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}