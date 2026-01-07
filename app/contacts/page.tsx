'use client';

import { useState, useEffect } from 'react';
import { getAllContacts, deleteContact } from '@/lib/supabase';
import { Contact } from '@/types';
import { ArrowLeft, ExternalLink, Search, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const contactsData = await getAllContacts();
    setContacts(contactsData);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
      await loadContacts();
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Manage Contacts ({contacts.length})
          </h1>
          <Link
            href="/enroll"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Add New Contact
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contacts List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {searchTerm
                      ? 'No contacts found'
                      : 'No contacts yet. Add your first contact!'}
                  </p>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={contact.imageUrl}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {contact.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {contact.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-2">
            {selectedContact ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Contact Details
                  </h2>
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={selectedContact.imageUrl}
                      alt={selectedContact.name}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {selectedContact.name}
                      </h3>
                      <p className="text-xl text-gray-600">
                        {selectedContact.title}
                      </p>
                      <p className="text-lg text-gray-600">
                        {selectedContact.company}
                      </p>
                    </div>

                    {selectedContact.linkedinUrl && (
                      <a
                        href={selectedContact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <ExternalLink className="w-5 h-5" />
                        View LinkedIn Profile
                      </a>
                    )}

                    <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                      {selectedContact.email && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Email
                          </p>
                          <a
                            href={`mailto:${selectedContact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedContact.email}
                          </a>
                        </div>
                      )}

                      {selectedContact.phone && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Phone
                          </p>
                          <a
                            href={`tel:${selectedContact.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedContact.phone}
                          </a>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Added
                        </p>
                        <p className="text-gray-600">
                          {new Date(selectedContact.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {selectedContact.lastSeen && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Last Seen
                          </p>
                          <p className="text-gray-600">
                            {new Date(selectedContact.lastSeen).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedContact.tags && selectedContact.tags.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedContact.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedContact.notes && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Notes
                        </p>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {selectedContact.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-xl text-gray-500">
                  Select a contact from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
