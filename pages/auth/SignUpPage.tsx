
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingBagIcon } from '../../components/Icons';

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
    </div>
);

const SignUpPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsSubmitting(true);
        try {
            await signUp({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl space-y-6 border dark:border-slate-700">
                <div className="text-center">
                    <ShoppingBagIcon className="w-12 h-12 mx-auto text-primary-600" />
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">Create a new account</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?{' '}
                        <NavLink to="/signin" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </NavLink>
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSignUp}>
                    <InputField label="Full Name" id="name" type="text" value={formData.name} onChange={handleInputChange} required autoComplete="name" />
                    <InputField label="Email Address" id="email" type="email" value={formData.email} onChange={handleInputChange} required autoComplete="email" />
                    <InputField label="Phone Number" id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required autoComplete="tel" />
                    <InputField label="Password" id="password" type="password" value={formData.password} onChange={handleInputChange} required autoComplete="new-password" />
                    <InputField label="Confirm Password" id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required autoComplete="new-password" />
                    
                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    
                    <div>
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                            {isSubmitting ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
