export interface Task {
    id: string;
    name: string;
    description: string;
}

export interface Client {
    $id?: string;
    name: string;
    lastname: string;
    businessname?: string;
    adress: string;
    huisnummer: string;
    postcode: string;
    woonplaats: string;
    email: string;
    telefoonnummer: string;
    subcontractors?: Subcontractor;
    projects?: Project[];
    oppervlakte?: number;
    bouwjaar?: number;
    search?: string;
    chatwootid?: string;
    type?: 'Particulier' | 'VVE' | 'Bedrijf' | 'BedrijfZonderBTW';
}

export interface Project {
    $id?: string;
    $createdAt?: Date;
    $updatedAt?: Date;
    name: string;
    client: Client;
    items: any;
    projects: any[];
    fase: string;
    terms: Term[];
    tasks: Task[];
    opmerkingen: string;
    notities: string;
    uploadedImages: UploadedImage[];
    paymentSchedule: PaymentSchedule;
    projectNumber: string;
    adress?: string;
    progress?: number;
    description?: string;
    isEditingName?: boolean;
    signurl?: string;
    documenso?: string;
}

export interface PaymentSchedule {
    initial: number;
    during: number;
    final: number;
}

export interface UploadedImage {
    file: File;
    preview: string;
    id: string;
    category: string;
    projectId: string;
}

export interface Term {
    $id?: string;
    text: string;
    checked: boolean;
    projectId?: string;
    order: number;
}

export interface UploadedImage {
    id: string;
    category: string;
    url: string;
  }

export interface Task {
    $id?: string;
    subcategory: string;
    type: string;
    completed: boolean;
    photo: string | null;
    projectName: string;
    paymentSchedule: any;
  }

export interface Service {
    $id?: string;
    subcategory: string;
    type: string;
    price: string | number;
    unit: string;
    tasks: string | Task[];
    category?: string;
    order?: string | number;
}

export interface Services {
    [category: string]: Service[];
}

export interface ServiceToDelete {
    category: string;
    index: number;
}

export interface ServiceToEdit extends Service {
    category: string;
    index: number;
}

export interface Calculation {
    length: number;
    width: number;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    category: string;
    isEditing: boolean;
    subcategory: string;
    type: string;
    price: string;
    unit: string;
    tasks: Task[];
}

export interface ChatwootContact {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    custom_attributes: {
        postcode: string;
        huisnummer: string;
        phone: string;
    };
}

export interface Subcontractor {
    name: string;
    email: string;
    phone: string | null;
    businessname: string;
    $id?: string;
    website: string;
    address: string;
}