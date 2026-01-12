export interface ImageData {
  file: File;
  preview: string;
  base64: string; // Kept for reference, but we will use 'file' for upload
}

export interface CompetitionFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  ticketPrice: number | '';
  maxTickets: number | '';
  startDate: string;
  endDate: string;
  upsellProducts: string;
  publishImmediately: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  productUrl?: string;
  id?: string | number;
}
