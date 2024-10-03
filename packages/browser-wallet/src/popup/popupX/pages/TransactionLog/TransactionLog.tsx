import React from 'react';
import Note from '@assets/svgX/note.svg';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

const transaction_log = [
    {
        date: '21 May 2024',
        total: '4029.87',
        transactions: [
            {
                type: 'Unstaked amount',
                amount: 10.02,
                currency: 'CCD',
                time: '11:24',
                info: 'with fee 0.02 CCD',
            },
            {
                type: 'Staked amount',
                amount: -100.26,
                currency: 'CCD',
                time: '09:21',
                info: 'with fee 0.26 CCD',
            },
        ],
    },
    {
        date: '18 May 2024',
        total: '4120.13',
        transactions: [
            {
                type: 'Transfer',
                amount: 600,
                currency: 'CCD',
                time: '16:34',
                info: 'from 3a2XYe',
            },
            {
                type: 'Transfer',
                amount: -0.32591,
                currency: 'ETH',
                time: '16:21',
                info: 'with fee 0.0091 ETH',
                note: 'That was a test transfer for the UX research',
            },
            {
                type: 'Transfer',
                amount: 100,
                currency: 'CCD',
                time: '12:50',
                info: 'from 3a2XYe',
            },
            {
                type: 'Transfer',
                amount: 120,
                currency: 'CCD',
                time: '00:56',
                info: 'from 3a2XYe',
            },
            {
                type: 'Shielded amount',
                amount: -100.26,
                currency: 'CCD',
                time: '08:32',
                info: 'with fee 0.26 CCD',
            },
        ],
    },
];

export default function TransactionLog() {
    const nav = useNavigate();
    const navToTransactionDetails = () => nav(relativeRoutes.home.transactionLog.details.path);
    return (
        <div className="transaction-log-container">
            <div className="transaction-log__title">
                <span className="heading_medium">Transaction log</span>
            </div>
            <div className="transaction-log__history">
                {transaction_log.map((day, day_idx) => (
                    <div key={day_idx} className="transaction-log__history_day">
                        <div className="transaction-log__history_day-date">
                            <span className="capture__additional_small">{day.date}</span>
                            <span className="capture__additional_small">${day.total}</span>
                        </div>
                        {day.transactions.map((transaction, transaction_idx) => (
                            <div
                                key={`${day_idx}_${transaction_idx}`}
                                className="transaction-log__history_transaction"
                                onClick={() => navToTransactionDetails()}
                            >
                                <div className="transaction value">
                                    <span className="label__main">{transaction.type}</span>
                                    <span className={`label__main ${transaction.amount > 0 && 'income'}`}>
                                        {transaction.amount} {transaction.currency}
                                    </span>
                                </div>
                                <div className="transaction info">
                                    <span className="capture__main_small">{transaction.time}</span>
                                    <span className="capture__main_small">{transaction.info}</span>
                                </div>
                                {transaction.note && (
                                    <div className="transaction note">
                                        <Note />
                                        <span className="capture__main_small">{transaction.note}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}