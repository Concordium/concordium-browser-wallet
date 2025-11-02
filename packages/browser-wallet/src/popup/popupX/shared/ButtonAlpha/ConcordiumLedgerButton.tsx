import React from 'react';

interface WalletButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

function ConcordiumLedgerButton({ onClick, disabled }: WalletButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: 8,
                borderRadius: 20, // More round corners
                border: '1px solid #d1d5db',
                background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s',
                textAlign: 'left',
                gap: 16,
                cursor: 'pointer',
            }}
        >
            <div
                style={{
                    background: '#f3f4f6',
                    padding: 8,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 8.5C0 4.08172 3.58172 0.5 8 0.5H32C36.4183 0.5 40 4.08172 40 8.5V32.5C40 36.9183 36.4183 40.5 32 40.5H8C3.58172 40.5 0 36.9183 0 32.5V8.5Z"
                        fill="black"
                        fillOpacity="0.1"
                    />
                    <path
                        d="M8 25.0371V31H17.0274V29.6776H9.31532V25.0371H8ZM30.6847 25.0371V29.6776H22.9726V30.9997H32V25.0371H30.6847ZM17.0405 15.9629V25.0368H22.9726V23.8443H18.3559V15.9629H17.0405ZM8 10V15.9629H9.31532V11.3221H17.0274V10H8ZM22.9726 10V11.3221H30.6847V15.9629H32V10H22.9726Z"
                        fill="#435E7C"
                    />
                </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Concordium Ledger Account</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, marginTop: 6 }}>
                    Connect and use your hardware wallet to sign transactions
                </p>
            </div>
        </button>
    );
}

export default ConcordiumLedgerButton;
