import { createClient } from '@supabase/supabase-js';
import { Contact, Interaction } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Contacts
export async function getAllContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    title: row.title || '',
    linkedinUrl: row.linkedin_url || '',
    email: row.email || '',
    phone: row.phone || '',
    notes: row.notes || '',
    tags: row.tags || [],
    faceDescriptor: row.face_descriptor,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    lastSeen: row.last_seen,
  }));
}

export async function saveContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<string | null> {
  // Upload image to Supabase Storage
  const imageFile = dataURLtoFile(contact.imageUrl, `${Date.now()}.jpg`);
  const imagePath = `contacts/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('contact-faces')
    .upload(imagePath, imageFile);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  // Get public URL for the image
  const { data: { publicUrl } } = supabase.storage
    .from('contact-faces')
    .getPublicUrl(imagePath);

  // Save contact to database
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      name: contact.name,
      company: contact.company,
      title: contact.title,
      linkedin_url: contact.linkedinUrl,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
      tags: contact.tags,
      face_descriptor: contact.faceDescriptor,
      image_url: publicUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving contact:', error);
    return null;
  }

  return data.id;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.name) dbUpdates.name = updates.name;
  if (updates.company) dbUpdates.company = updates.company;
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.linkedinUrl) dbUpdates.linkedin_url = updates.linkedinUrl;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.phone) dbUpdates.phone = updates.phone;
  if (updates.notes) dbUpdates.notes = updates.notes;
  if (updates.tags) dbUpdates.tags = updates.tags;
  if (updates.lastSeen) dbUpdates.last_seen = updates.lastSeen;

  const { error } = await supabase
    .from('contacts')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating contact:', error);
  }
}

export async function deleteContact(id: string): Promise<void> {
  // Get contact to find image URL
  const { data: contact } = await supabase
    .from('contacts')
    .select('image_url')
    .eq('id', id)
    .single();

  // Delete image from storage if it exists
  if (contact?.image_url) {
    const imagePath = contact.image_url.split('/').pop();
    if (imagePath) {
      await supabase.storage
        .from('contact-faces')
        .remove([`contacts/${imagePath}`]);
    }
  }

  // Delete contact from database
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact:', error);
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    company: data.company,
    title: data.title || '',
    linkedinUrl: data.linkedin_url || '',
    email: data.email || '',
    phone: data.phone || '',
    notes: data.notes || '',
    tags: data.tags || [],
    faceDescriptor: data.face_descriptor,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    lastSeen: data.last_seen,
  };
}

// Interactions
export async function getInteractionsForContact(contactId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('contact_id', contactId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    contactId: row.contact_id,
    date: row.date,
    notes: row.notes || '',
    location: row.location || '',
  }));
}

export async function saveInteraction(interaction: Omit<Interaction, 'id'>): Promise<void> {
  const { error } = await supabase
    .from('interactions')
    .insert({
      contact_id: interaction.contactId,
      notes: interaction.notes,
      location: interaction.location,
    });

  if (error) {
    console.error('Error saving interaction:', error);
  }
}

// Helper function to convert data URL to File
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
