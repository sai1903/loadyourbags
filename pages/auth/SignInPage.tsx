
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingBagIcon } from '../../components/Icons';

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
    </div>
);

const SignInPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            // Navigate based on user role after successful login
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Legacy Role Login for Admin/Seller for demo purposes
    const handleRoleLogin = async (role: string) => {
         setError('');
         setIsSubmitting(true);
         try {
             await login(role);
             navigate(role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard', { replace: true });
         } catch(err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred.');
         } finally {
            setIsSubmitting(false);
         }
    }


    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl space-y-6 border dark:border-slate-700">
                <div className="text-center">
                    <ShoppingBagIcon className="w-12 h-12 mx-auto text-primary-600" />
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Or{' '}
                        <NavLink to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                            create a new account
                        </NavLink>
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <InputField label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                    <div>
                        <div className="flex justify-between items-baseline">
                           <label htmlFor="password"  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                           <NavLink to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                Forgot password?
                           </NavLink>
                        </div>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    
                    <div>
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => alert('OTP login is a planned feature!')} className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                       Sign in with OTP
                    </button>
                    <NavLink to="/seller/register" className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                       Become a Seller
                    </NavLink>
                </div>
                 {/* Demo quick-login buttons */}
                 <div className="pt-4 border-t dark:border-slate-700">
                     <p className="text-center text-xs text-slate-400 mb-2">For demo purposes:</p>
                     <div className="flex justify-center gap-2">
                         <button onClick={() => handleRoleLogin('ADMIN')} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">Login as Admin</button>
                         <button onClick={() => handleRoleLogin('SELLER')} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">Login as Seller</button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default SignInPage;
