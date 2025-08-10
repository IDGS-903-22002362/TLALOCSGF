export interface QuoteLine {
  productId: number;
  quantity:  number;
}
export interface CreateQuoteDto {
  lines: QuoteLine[];
}

export interface QuoteLineDto {
  productId: number;
  name?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteDetailDto {
  id: number;
  status: string;
  quoteDate: string;
  validUntil?: string | null;
  fulfillment?: 'DevicesOnly'|'Shipping'|'Installation'|null;
  stateCode?: string | null;
  productsSubtotal: number;
  installBase: number;
  transportCost: number;
  shippingCost: number;
  grandTotal: number;
  lines: { productId:number; name:string; quantity:number; unitPrice:number; lineTotal:number; }[];
}