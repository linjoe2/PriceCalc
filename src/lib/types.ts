export interface Task {
    $id?: string;
    description: string;
    completed: boolean;
    category: string;
    subcategory: string;
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
}

export interface Project {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
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
    projectId: string;
    checked: boolean;
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
    id?: string;
    name: string;
    price: string;
    description: string;
    unit: string;
    category: string;
    subcategory: string;
    type: string;
    isEditing: boolean;
    tasks: Task[];
    isOpen: boolean;
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