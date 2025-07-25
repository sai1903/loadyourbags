
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SellerInfo } from '../../types';
import apiService from '../../services/apiService';

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 dark:disabled:bg-slate-700" />
    </div>
);

const FileInputField: React.FC<{ label: string; id: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; fileName: string; required?: boolean }> = ({ label, id, onChange, fileName, required }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor={id} className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input id={id} name={id} type="file" className="sr-only" onChange={onChange} required={required} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                {fileName ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{fileName}</p>
                ) : (
                    <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
                )}
            </div>
        </div>
    </div>
);


const SellerRegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        companyName: '',
        gstNumber: '',
        cidNumber: '',
        panNumber: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        productList: '',
    });
    const [files, setFiles] = useState({ companyPan: '', other: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prev => ({ ...prev, [id]: selectedFiles[0].name }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const sellerInfo: SellerInfo = {
            companyName: formData.companyName,
            gstNumber: formData.gstNumber,
            cidNumber: formData.cidNumber,
            panNumber: formData.panNumber,
            phoneNumber: formData.phoneNumber,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: formData.country,
            },
            productList: formData.productList,
            documents: files
        };

        try {
            await apiService.registerSeller({
                name: formData.name,
                email: formData.email,
                sellerInfo: sellerInfo
            });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (success) {
        return (
             <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
                 <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-4">Registration Successful!</h2>
                 <p className="text-slate-600 dark:text-slate-300 mt-2">
                     Thank you for registering. Your application is now under review by our admin team. You will be notified via email once your account is approved.
                 </p>
                 <button onClick={() => navigate('/')} className="mt-6 px-8 py-3 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700">
                     Back to Home
                 </button>
             </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Become a Seller on Load Your Bags</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Fill out the form below to get started. All fields are required.</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                <fieldset className="p-4 border dark:border-slate-700 rounded-lg space-y-6">
                    <legend className="px-2 font-semibold text-lg text-primary-700 dark:text-primary-300">Personal & Company Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Your Full Name" id="name" value={formData.name} onChange={handleInputChange} required />
                        <InputField label="Company Name" id="companyName" value={formData.companyName} onChange={handleInputChange} required />
                        <InputField label="Email Address" id="email" value={formData.email} onChange={handleInputChange} type="email" required />
                        <InputField label="Phone Number" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" required />
                        <InputField label="Company GST Number" id="gstNumber" value={formData.gstNumber} onChange={handleInputChange} required />
                        <InputField label="Company CID Number" id="cidNumber" value={formData.cidNumber} onChange={handleInputChange} required />
                        <InputField label="Company PAN Number" id="panNumber" value={formData.panNumber} onChange={handleInputChange} required />
                    </div>
                </fieldset>
                
                 <fieldset className="p-4 border dark:border-slate-700 rounded-lg space-y-6">
                    <legend className="px-2 font-semibold text-lg text-primary-700 dark:text-primary-300">Business Address</legend>
                    <InputField label="Street Address" id="street" value={formData.street} onChange={handleInputChange} required />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="City" id="city" value={formData.city} onChange={handleInputChange} required />
                        <InputField label="State" id="state" value={formData.state} onChange={handleInputChange} required />
                        <InputField label="ZIP / Postal Code" id="zip" value={formData.zip} onChange={handleInputChange} required />
                    </div>
                    <InputField label="Country" id="country" value={formData.country} onChange={handleInputChange} required />
                </fieldset>

                <fieldset className="p-4 border dark:border-slate-700 rounded-lg space-y-6">
                    <legend className="px-2 font-semibold text-lg text-primary-700 dark:text-primary-300">Product Information</legend>
                     <div>
                        <label htmlFor="productList" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">List of Products & Categories</label>
                        <textarea
                            id="productList"
                            value={formData.productList}
                            onChange={handleInputChange}
                            rows={5}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g.&#10;- Acoustic Guitars (Music) - est. price ₹25000&#10;- Wireless Headphones (Electronics) - est. price ₹12000"
                            required
                        />
                    </div>
                </fieldset>

                <fieldset className="p-4 border dark:border-slate-700 rounded-lg space-y-6">
                    <legend className="px-2 font-semibold text-lg text-primary-700 dark:text-primary-300">Document Upload</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FileInputField label="Company PAN Card" id="companyPan" onChange={handleFileChange} fileName={files.companyPan} required />
                         <FileInputField label="Company Related Documents" id="other" onChange={handleFileChange} fileName={files.other} required />
                     </div>
                </fieldset>
                
                {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-300"
                    >
                        {isSubmitting ? 'Submitting Application...' : 'Submit for Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// A placeholder icon for the success page
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default SellerRegistrationPage;
