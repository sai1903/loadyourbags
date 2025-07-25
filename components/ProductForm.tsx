

import React, { useState, useEffect } from 'react';
import { generateFaqs, generateProductDescription } from '../services/geminiService';
import { SparklesIcon, PlusIcon, TrashIcon } from './Icons';
import { Product, FaqItem } from '../types';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
    </div>
);

type ProductFormData = Omit<Product, 'id' | 'sellerId' | 'reviews' | 'status'>;

interface ProductFormProps {
    onSubmit: (data: ProductFormData) => Promise<void>;
    isSubmitting: boolean;
    initialData?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isSubmitting, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        retailPrice: '',
        mrp: '',
        wholesalePrice: '',
        description: '',
        imageUrl: '',
        colors: ['Black', 'White'],
        isTrialAvailable: true,
        pickupStreet: '',
        pickupCity: '',
        pickupState: '',
        pickupZip: '',
        pickupCountry: 'India',
    });
    const [specifications, setSpecifications] = useState<{ key: string, value: string }[]>([]);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [keywords, setKeywords] = useState('');
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGeneratingFaqs, setIsGeneratingFaqs] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                retailPrice: String(initialData.retailPrice),
                mrp: initialData.mrp ? String(initialData.mrp) : '',
                wholesalePrice: String(initialData.wholesalePrice),
                description: initialData.description,
                imageUrl: initialData.imageUrl,
                colors: initialData.colors || ['Black', 'White'],
                isTrialAvailable: initialData.isTrialAvailable !== false,
                pickupStreet: initialData.pickupAddress?.street || '',
                pickupCity: initialData.pickupAddress?.city || '',
                pickupState: initialData.pickupAddress?.state || '',
                pickupZip: initialData.pickupAddress?.zip || '',
                pickupCountry: initialData.pickupAddress?.country || 'India',
            });
            if (initialData.specifications) {
                setSpecifications(Object.entries(initialData.specifications).map(([key, value]) => ({ key, value })));
            }
             if (initialData.faq) {
                setFaqs(initialData.faq);
            }
        }
    }, [initialData]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };
    
    // --- Specifications Handlers ---
    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const addSpecField = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };
    
    const removeSpecField = (index: number) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    // --- FAQ Handlers ---
    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    const addFaqField = () => {
        setFaqs([...faqs, { question: '', answer: '' }]);
    };

    const removeFaqField = (index: number) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };


    // --- AI Handlers ---
    const handleGenerateDescription = async () => {
        if (!formData.name || !keywords) {
            alert("Please enter a Product Name and some Keywords first.");
            return;
        }
        setIsGeneratingDesc(true);
        const generatedDesc = await generateProductDescription(formData.name, keywords);
        setFormData(prev => ({ ...prev, description: generatedDesc.replace(/^"|"$/g, '') }));
        setIsGeneratingDesc(false);
    };
    
    const handleGenerateFaqs = async () => {
        if (!formData.name) {
            alert("Please provide a product name and description before generating FAQs.");
            return;
        }
        setIsGeneratingFaqs(true);
        const specsString = specifications.map(s => `${s.key}: ${s.value}`).join(', ');
        const context = `${formData.description}. Specifications: ${specsString}`;
        const generatedFaqs = await generateFaqs(formData.name, context);
        if (generatedFaqs && generatedFaqs.length > 0) {
            setFaqs(generatedFaqs);
        } else {
            alert("Could not generate FAQs. Please try again or add them manually.");
        }
        setIsGeneratingFaqs(false);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const specsObject = specifications.reduce((acc, spec) => {
            if (spec.key && spec.value) acc[spec.key] = spec.value;
            return acc;
        }, {} as Record<string, string>);

        const hasPickupAddress = formData.pickupStreet && formData.pickupCity && formData.pickupState && formData.pickupZip;

        const submissionData: ProductFormData = {
            name: formData.name,
            category: formData.category,
            retailPrice: parseFloat(formData.retailPrice),
            wholesalePrice: parseFloat(formData.wholesalePrice),
            mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
            onSale: !!(formData.mrp && parseFloat(formData.mrp) > parseFloat(formData.retailPrice)),
            description: formData.description,
            imageUrl: formData.imageUrl,
            specifications: specsObject,
            colors: formData.colors,
            isTrialAvailable: formData.isTrialAvailable,
            faq: faqs.filter(f => f.question && f.answer),
            pickupAddress: hasPickupAddress ? {
                street: formData.pickupStreet,
                city: formData.pickupCity,
                state: formData.pickupState,
                zip: formData.pickupZip,
                country: formData.pickupCountry,
            } : undefined,
        };

        onSubmit(submissionData);
    };
    
    const pageTitle = initialData ? "Edit Product" : "Add a New Product";
    const submitButtonText = initialData ? (isSubmitting ? 'Saving...' : 'Save Changes') : (isSubmitting ? 'Submitting...' : 'Add Product');

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{pageTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Product Name" id="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
                <InputField label="Category" id="category" value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} required />
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Wholesale Price (₹)" id="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} type="number" step="any" placeholder="e.g., 1500" required />
                        <InputField label="Retail Price (₹)" id="retailPrice" value={formData.retailPrice} onChange={handleInputChange} type="number" step="any" placeholder="e.g., 1999" required />
                        <InputField label="MRP (for discount)" id="mrp" value={formData.mrp} onChange={handleInputChange} type="number" step="any" placeholder="e.g., 2499" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Retail price is shown to customers. If MRP is higher than retail, a discount is shown.</p>
                </div>

                <InputField label="Image URL" id="imageUrl" value={formData.imageUrl} onChange={handleInputChange} type="text" placeholder="https://example.com/image.jpg" />
                
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-900">
                    <h3 className="font-semibold text-lg text-primary-800 dark:text-primary-200 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6" /> AI-Powered Description
                    </h3>
                    <p className="text-sm text-primary-700 dark:text-primary-300 mt-1 mb-4">Enter some keywords to help our AI generate a stunning description for your product.</p>
                    <InputField label="Keywords" id="keywords" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g., sleek, wireless, long battery" />
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDesc}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                        rows={6}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                 <fieldset className="p-4 border dark:border-slate-700 rounded-lg space-y-6">
                    <legend className="px-2 font-semibold text-lg text-primary-700 dark:text-primary-300">Frequently Asked Questions (FAQ)</legend>
                    <div className="space-y-4">
                         {faqs.map((faq, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                                <div className="flex-grow w-full space-y-2">
                                     <input type="text" placeholder="Question" value={faq.question} onChange={e => handleFaqChange(index, 'question', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                                      <textarea placeholder="Answer" value={faq.answer} onChange={e => handleFaqChange(index, 'answer', e.target.value)} rows={2} className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                                </div>
                                <button type="button" onClick={() => removeFaqField(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full shrink-0">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                     <div className="flex flex-wrap gap-4">
                        <button type="button" onClick={addFaqField} className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">
                            <PlusIcon className="w-5 h-5"/> Add FAQ
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerateFaqs}
                            disabled={isGeneratingFaqs}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                             <SparklesIcon className="w-5 h-5"/> {isGeneratingFaqs ? 'Generating...' : 'Generate FAQs with AI'}
                        </button>
                    </div>
                </fieldset>

                <fieldset className="p-4 border dark:border-slate-700 rounded-lg space-y-6">
                    <legend className="px-2 font-semibold text-lg text-primary-700 dark:text-primary-300">Product Pickup Address (Optional)</legend>
                    <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">
                        Provide the address where this product is stored. This is for internal use and will not be shown to customers.
                    </p>
                    <InputField label="Street Address" id="pickupStreet" value={formData.pickupStreet} onChange={handleInputChange} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="City" id="pickupCity" value={formData.pickupCity} onChange={handleInputChange} />
                        <InputField label="State" id="pickupState" value={formData.pickupState} onChange={handleInputChange} />
                        <InputField label="ZIP / Postal Code" id="pickupZip" value={formData.pickupZip} onChange={handleInputChange} />
                    </div>
                    <InputField label="Country" id="pickupCountry" value={formData.pickupCountry} onChange={handleInputChange} />
                </fieldset>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Specifications</h3>
                    <div className="space-y-3">
                        {specifications.map((spec, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" placeholder="Key (e.g., Brand)" value={spec.key} onChange={e => handleSpecChange(index, 'key', e.target.value)} className="w-1/3 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                                <input type="text" placeholder="Value (e.g., Chroma)" value={spec.value} onChange={e => handleSpecChange(index, 'value', e.target.value)} className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                                <button type="button" onClick={() => removeSpecField(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addSpecField} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">
                        <PlusIcon className="w-5 h-5"/> Add Specification
                    </button>
                </div>

                <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                    >
                        {submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;