export interface QuoteLine {
  productId: number;
  quantity:  number;
}
export interface CreateQuoteDto {
  lines: QuoteLine[];
}

export interface QuoteLineDto {
  productId: number;
  name:      string;
  quantity:  number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteDetailDto {
  id:          number;
  status:      string;
  quoteDate:   string;
  validUntil?: string;
  totalAmount: number;
  lines:       QuoteLineDto[];
}