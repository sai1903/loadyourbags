
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Address } from '../types';

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; }> = 
    ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
    </div>
);

const AddressCard: React.FC<{ address: Address }> = ({ address }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 relative">
        {address.isDefault && (
            <div className="absolute top-3 right-3 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">Default</div>
        )}
        <p className="font-semibold text-slate-800 dark:text-slate-200">{address.street}</p>
        <p className="text-slate-600 dark:text-slate-300">{address.city}, {address.state} {address.zip}</p>
        <p className="text-slate-600 dark:text-slate-300">{address.country}</p>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 flex gap-2">
            <button className="text-sm font-medium text-primary-600 hover:text-primary-800">Edit</button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button className="text-sm font-medium text-red-500 hover:text-red-700">Delete</button>
        </div>
    </div>
);

const AddressesPage: React.FC = () => {
    const { user, updateUserAddresses } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '', country: 'USA' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewAddress(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        const newAddressWithId: Address = {
            ...newAddress,
            id: `addr_${Date.now()}`,
            isDefault: !user.addresses || user.addresses.length === 0
        };
        const updatedAddressList = [...(user.addresses || []), newAddressWithId];
        
        try {
            await updateUserAddresses(updatedAddressList);
            setShowForm(false);
            setNewAddress({ street: '', city: '', state: '', zip: '', country: 'USA' });
        } catch (error) {
            console.error("Failed to add address", error);
            alert("There was an error saving your address. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Saved Addresses</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
                >
                    {showForm ? 'Cancel' : 'Add New Address'}
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField label="Street Address" id="street" value={newAddress.street} onChange={handleInputChange} required />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="City" id="city" value={newAddress.city} onChange={handleInputChange} required />
                            <InputField label="State" id="state" value={newAddress.state} onChange={handleInputChange} required />
                            <InputField label="ZIP Code" id="zip" value={newAddress.zip} onChange={handleInputChange} required />
                        </div>
                        <InputField label="Country" id="country" value={newAddress.country} onChange={handleInputChange} required />
                        <div className="flex justify-end">
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-green-400">
                                {isSubmitting ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map(address => <AddressCard key={address.id} address={address} />)
                ) : (
                    <p className="md:col-span-2 text-center text-slate-500 dark:text-slate-400 py-8">You have no saved addresses.</p>
                )}
            </div>
        </div>
    );
};

export default AddressesPage;