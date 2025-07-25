
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBagIcon } from '../../components/Icons';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would call an API here.
        // We will just simulate the success state.
        setSubmitted(true);
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl space-y-6 border dark:border-slate-700">
                {submitted ? (
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Check your email</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            We've sent a password reset link to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>. Please follow the instructions in the email to reset your password.
                        </p>
                        <NavLink to="/signin" className="mt-6 block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Back to Sign In
                        </NavLink>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <ShoppingBagIcon className="w-12 h-12 mx-auto text-primary-600" />
                            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">Forgot your password?</h2>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    autoComplete="email" 
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    Send Reset Link
                                </button>
                            </div>
                            <div className="text-center">
                                <NavLink to="/signin" className="font-medium text-primary-600 hover:text-primary-500">
                                    &larr; Back to Sign In
                                </NavLink>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
