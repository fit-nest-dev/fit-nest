import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * A component to display a success message after a user makes a payment to a trainer.
 *
 * This component displays a success message with the order ID, trainer ID, user ID, and payment amount.
 * It also provides a button to go back to the home page.
 *
 * @returns A JSX element containing the success message and the button to go back to the home page.
 */
const SuccessPagePaymentTrainer = () => {
  const navigate = useNavigate();
  const { orderId, userId, TrainerId, amount } = useParams();
  const location = useLocation();
  const { invoice_url, trainer } = location.state || {};
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        background: '#000000',
        height: '100vh',
        color: '#FFFFFF',
      }}
    >
      <div
        style={{
          background: '#000000',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(15, 70, 2, 0.91)',
          maxWidth: '530px',
          textAlign: 'center',
          padding: '20px',
          border: '1px solid #333',
        }}
      >
        <h1 style={{ fontSize: '2.4rem', marginBottom: '10px', color: '#FFFFFF' }}>
          🎉Payment Successful!🎉
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#CCCCCC' }}>
          Thank you for your payment to the trainer!
        </p>

        <div
          style={{
            backgroundColor: '#000',
            borderRadius: '8px',
            padding: '15px',
            margin: '20px 0',

          }}
        >
          <p style={{ color: '#FFFFFF', fontWeight: 'bold', marginBottom: '10px' }}>
            Trainer Name: <span style={{ color: '#66FF66' }}>{trainer.trainer_name}</span>
          </p>
          <p style={{ color: '#FFFFFF', fontWeight: 'bold', marginBottom: '10px' }}>
            Trainer Email: <span style={{ color: '#66FF66' }}>{trainer.email}</span>
          </p>
          <p style={{ color: '#FFFFFF', fontWeight: 'bold', marginBottom: '10px' }}>
            Trainer Contact: <span style={{ color: '#66FF66' }}>{trainer.trainer_contact}</span>
          </p>
          <p style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Payment Amount: <span style={{ color: '#66FF66' }}>₹{amount}</span>
          </p>
          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            INVOICE_URL:{' '}
            <span style={{ color: '#66FF66' }}>
              {invoice_url ? (
                <a href={invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: '#66FF66' }}>
                  {invoice_url}
                </a>
              ) : (
                'Not Available'
              )}
            </span>
          </p>
        </div>

        <button
          style={{
            backgroundColor: 'rgba(17, 138, 6, 0.89)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onClick={() => {
            navigate('/profile-page');
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#55CC55')}
          onMouseOut={(e) => (e.target.style.backgroundColor = 'rgba(17, 138, 6, 0.89)')}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
};

export default SuccessPagePaymentTrainer;
