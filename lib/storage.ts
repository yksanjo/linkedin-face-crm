import { Contact, Interaction } from '@/types';

const CONTACTS_KEY = 'linkedin-face-crm-contacts';
const INTERACTIONS_KEY = 'linkedin-face-crm-interactions';

// Contacts
export function getAllContacts(): Contact[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CONTACTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveContact(contact: Contact): void {
  const contacts = getAllContacts();
  contacts.push(contact);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export function updateContact(id: string, updates: Partial<Contact>): void {
  const contacts = getAllContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates };
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }
}

export function deleteContact(id: string): void {
  const contacts = getAllContacts();
  const filtered = contacts.filter((c) => c.id !== id);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(filtered));
}

export function getContactById(id: string): Contact | undefined {
  return getAllContacts().find((c) => c.id === id);
}

// Interactions
export function getInteractionsForContact(contactId: string): Interaction[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(INTERACTIONS_KEY);
  const all: Interaction[] = data ? JSON.parse(data) : [];
  return all.filter((i) => i.contactId === contactId);
}

export function saveInteraction(interaction: Interaction): void {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(INTERACTIONS_KEY);
  const interactions: Interaction[] = data ? JSON.parse(data) : [];
  interactions.push(interaction);
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
}
