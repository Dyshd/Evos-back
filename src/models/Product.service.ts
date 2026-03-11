import { ProductStatus } from "../libs/enums/product.enum";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { T } from "../libs/types/common";
import { measureMemory } from "vm";
import { ObjectId } from "mongoose";
import mongoose from "mongoose/types";
import ViewService from "./View.service";
import { ViewGroup } from "../libs/enums/view.enum";
import { ViewInput } from "../libs/types/view";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }
  // /**SPA */
  // public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
  //   const match: T = { productStatus: ProductStatus.PROCESS };

  //   if (inquiry.productCollection)
  //     match.productCollection = inquiry.productCollection;
  //   if (inquiry.search) {
  //     match.productName = { $regex: new RegExp(inquiry.search, "i") };
  //   }
  //   const sort: T =
  //     inquiry.order === "productPrice"
  //       ? { [inquiry.order]: 1 }
  //       : { [inquiry.order]: -1 };

  //   const result = await this.productModel
  //     .aggregate([
  //       { $match: match },
  //       { $sort: sort },
  //       { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, // 0
  //       { $limit: inquiry.limit * 1 }, //3
  //     ])
  //     .exec();
  //   if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

  //   return result;
  // }
  /** SPA */
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCollection) {
      match.productCollection = inquiry.productCollection;
    }

    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const allowedOrders = ["productPrice", "productViews", "createdAt"];
    const order =
      inquiry.order && allowedOrders.includes(inquiry.order)
        ? inquiry.order
        : "createdAt";

    const page =
      Number.isFinite(inquiry.page) && inquiry.page > 0 ? inquiry.page : 1;

    const limit =
      Number.isFinite(inquiry.limit) && inquiry.limit > 0 ? inquiry.limit : 10;

    const sort: T =
      order === "productPrice"
        ? { [order]: 1 }
        : { [order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .exec();

    return Array.isArray(result) ? result : [];
  }
  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        ViewGroup: ViewGroup.PRODUCT,
      };
      const existView = await this.viewService.checkViewExistence(input);
      console.log("exsist:", !!existView)
      if (!existView) {
        await this.viewService.insertMemberView(input);

        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: +1 } },
            { new: true }
          )
          .exec();
      }
    }
    return result;
  }

  /**SSR */
  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      // console.log("kildi");
      return await this.productModel.create(input);
    } catch (err) {
      console.error("Error, model:createNewProduct ", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async getAllProducts(): Promise<Product[]> {
    // string => objectid
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    // string => objectid
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductService;
