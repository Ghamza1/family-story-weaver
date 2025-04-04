
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  prefix?: string;
  suffix?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  occupation?: string;
  notes?: string;
  photoUrl?: string;
  fatherId?: string;
  motherId?: string;
  spouseIds: string[];
  childrenIds: string[];
  siblingIds: string[];
}

export interface Relationship {
  id: string;
  type: 'spouse' | 'parent-child';
  person1Id: string;
  person2Id: string;
  marriageDate?: string;
  marriagePlace?: string;
}

export interface FamilyTree {
  id: string;
  name: string;
  ownerId: string;
  rootPersonId?: string;
  people: Record<string, Person>;
  relationships: Relationship[];
  created: Date;
  lastModified: Date;
  sharedWith: {
    email: string;
    permission: 'view' | 'edit';
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  trees: string[];
}
