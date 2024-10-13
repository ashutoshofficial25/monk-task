export interface IProduct {
  id: number;
  title: string;
  vendor: string;
  handle: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  tags: string;
  options: Option[];
  image: Image;
  images: Image[];
  admin_graphql_api_id: string;
  status: string;
  variants: IVariant[];
}

interface Option {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

interface Image {
  id: number;
  product_id: number;
  src: string;
}

export interface IVariant {
  id: number;
  product_id: number;
  title: string;
  inventory_policy: string;
  price: string;
  compare_at_price: string;
  option1: string;
  created_at: string;
  updated_at: string;
  admin_graphql_api_id: string;
  inventory_quantity: number;
}

export interface ISelectedProduct extends IProduct {
  discount: {
    type: "";
    value: "percent" | "flat" | "";
  };
}
