
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../../context/AuthContext";

/**
 * Component for handling a failed payment response.
 *
 * This component allows users to check the status of a failed payment and request a refund if necessary.
 * It uses the `useParams` hook to retrieve the `PaymentId` and `amount` from the URL.
 * The component maintains local state for loading, payment status, refund status, and error messages.
 * 
 * The `checkPaymentStatus` function checks the payment status using an API call.
 * If the user is not authenticated, it requests the payment status for non-logged-in orders.
 * If the user is authenticated, it requests the payment status for logged-in orders.
 * 
 * The `requestRefund` function allows users to request a refund for the payment if the status is "captured".
 * It makes an API call to request the refund and updates the local state based on the response.
 * 
 * Displays loading indicators, payment status, refund status, and error messages to the user.
 * Provides a button to navigate back to the home page.
 */

const FailureResponse = () => {
  const { PaymentId, amount } = useParams();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [refundStatus, setRefundStatus] = useState(null);
  const [error, setError] = useState(null);
  const { Authuser } = useAuthContext();
  /**
   * Checks the status of a payment using the payment ID.
   * Retrieves and returns the payment status.
   * Logs an error and sets the error state if the fetch operation fails.
   * If the user is not authenticated, it requests the payment status for non-logged-in orders.
   * If the user is authenticated, it requests the payment status for logged-in orders.
   * The function sets the loading state while the API call is in progress.
   */
  const checkPaymentStatus = async () => {
    if (!Authuser) {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `http://3.25.86.182:5000/api/Payment/check-status-orders-not-logged-in/`,
          { paymentId: PaymentId },
          { withCredentials: true }
        );
        setPaymentStatus(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "An error occurred while checking payment status"
        );
      } finally {
        setLoading(false);
      }
    }
    else {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `http://3.25.86.182:5000/api/Payment/check-status-orders/`,
          { paymentId: PaymentId },
          { withCredentials: true }
        );
        setPaymentStatus(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "An error occurred while checking payment status"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Requests a refund for the given payment ID and amount.
   * 
   * This function sends a POST request to the server to request a refund.
   * If the server responds with a 200 status code, it sets the refund status to the message
   * returned by the server or a default success message.
   * If the server responds with an error, it sets the error state to the error message returned
   * by the server or a default error message.
   * Always sets the loading state to false.
   * 
   * @returns {Promise<void>}
   */
  const requestRefund = async () => {
    setLoading(true);
    setError(null);
    setRefundStatus(null);

    try {
      const response = await axios.post(
        `http://3.25.86.182:5000/api/Payment/request-refund/`,
        { paymentId: PaymentId, amount: amount },
        { withCredentials: true }
      );
      setRefundStatus(response.data.message || "Refund processed successfully");
      if (response.data.refund.status === 'processed') {
        checkPaymentStatus();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "An error occurred while requesting the refund"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          Order Processing Failed. Check Status Below
        </h2>
        <p style={styles.text}>
          <strong>Payment ID:</strong> {PaymentId}
        </p>
        <p style={styles.text}>
          <strong>Amount:</strong> ₹{amount}
        </p>
        <button
          onClick={checkPaymentStatus}
          style={loading ? { ...styles.button, ...styles.disabledButton } : styles.button}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Payment Status"}
        </button>

        {paymentStatus && (
          <div style={styles.statusCard}>
            {/* <h3 style={styles.statusHeading}>Payment Status:</h3> */}
            {/* <pre style={styles.statusText}>
              {JSON.stringify(paymentStatus, null, 2)}
            </pre> */}
            {paymentStatus.status === "captured" && (
              <>
                <p style={styles.infoText}>
                  We have received your payment. Since your order has not been
                  placed, you can request a refund.
                </p>
                <button
                  onClick={requestRefund}
                  style={loading ? { ...styles.button, ...styles.disabledButton } : styles.button}
                  disabled={loading}
                >
                  {loading ? "Processing Refund..." : "Request Refund"}
                </button>
              </>
            )}
          </div>
        )}

        {refundStatus && (
          <div style={styles.statusCard}>
            <p style={styles.successText}>{refundStatus}</p>
          </div>
        )}

        {error && (
          <div style={styles.errorCard}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}
        <button
          onClick={() => (window.location.href = "/")}
          style={styles.backButton}
        >
          BACK TO HOME
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#000",
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
    maxWidth: "400px",
    textAlign: "center",
    width: "100%",
  },
  heading: {
    fontSize: "22px",
    marginBottom: "20px",
    color: "#FF5555",
    fontWeight: "bold",
  },
  text: {
    fontSize: "16px",
    marginBottom: "10px",
    color: "#E0E0E0",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
  disabledButton: {
    backgroundColor: "#666666",
    cursor: "not-allowed",
  },
  statusCard: {
    marginTop: "20px",
    backgroundColor: "#1E2E1E",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #4CAF50",
  },
  statusHeading: {
    fontSize: "18px",
    color: "#4CAF50",
    marginBottom: "10px",
  },
  statusText: {
    fontSize: "14px",
    color: "#E0E0E0",
    backgroundColor: "#2E2E2E",
    padding: "10px",
    borderRadius: "5px",
    overflow: "auto",
  },
  infoText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#4CAF50",
  },
  successText: {
    fontSize: "16px",
    color: "#4CAF50",
  },
  errorCard: {
    marginTop: "20px",
    backgroundColor: "#2E1E1E",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #FF5555",
  },
  errorText: {
    fontSize: "16px",
    color: "#FF5555",
  },
  backButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#333333",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
};

export default FailureResponse;
