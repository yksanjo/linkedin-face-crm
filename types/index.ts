export interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  linkedinUrl: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  faceDescriptor: number[];
  imageUrl: string;
  createdAt: string;
  lastSeen?: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  date: string;
  notes: string;
  location?: string;
}
