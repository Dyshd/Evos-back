import { ObjectId } from "mongoose"
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
} from "../enums/product.enum";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize: ProductSize;
  productVolume: number;
  productDesc?: string;
  productImages: string[];
  productViews: number;

  // ✅ Qo‘shimcha flaglar
  isBreakfast?: boolean;
  isCombo?: boolean;

  createdAt: Date;
  updatedAt: Date;
}
export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}

export interface ProductInput {
  isBreakfastCombo: any;
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;

  isBreakfast?: boolean; // Breakfast mahsuloti
  isCombo?: boolean;     // Combo
}



export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productVolume?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}


