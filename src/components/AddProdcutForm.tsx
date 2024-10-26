import { CiSearch } from "react-icons/ci";
import Dialog from "./Dialog";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { IProduct, IVariant } from "../interfaces/product";
import Checkbox from "./Checkbox";

interface IProps {
  open: boolean;
  onClose: VoidFunction;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setPage: Dispatch<SetStateAction<number>>;
  products: IProduct[];
  selected: ISelect[];
  isLoading: boolean;
  onAddProduct: VoidFunction;
  onParentSelect: (productId: number, variantIds: number[]) => void;
  onChildSelect: (productId: number, variantId: number) => void;
}

interface ISelect {
  id: number;
  children: number[];
}

export default function AddProductForm({
  open,
  onClose,
  products,
  search,
  setSearch,
  setPage,
  selected,
  isLoading,
  onAddProduct,
  onChildSelect,
  onParentSelect,
}: IProps) {
  const observer = useRef<IntersectionObserver>();

  const lastProductRef = useRef<HTMLDivElement>(null);

  const isParentSelected = (productId: number) => {
    const checked = selected.find((el) => el.id === productId);

    if (checked) return true;
    else return false;
  };

  console.log("log: length", products.length);

  function loadMore() {
    console.log("log: load", products.length);
    setPage((prev) => prev + 1);
  }

  useEffect(() => {
    if (isLoading) return;

    const handleObserver = (entries: any) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        loadMore();
      }
    };

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(handleObserver);
    if (lastProductRef.current)
      observer.current.observe(lastProductRef.current);
  }, [isLoading]);

  const isChildSelected = (productId: number, variantId: number) => {
    const checked = selected.find((el) => el.id === productId);

    if (!checked) return false;

    const child = checked.children.find((el) => el === variantId);

    if (child === 0) return true;

    if (child) return true;
    else return false;
  };

  return (
    <div>
      <Dialog open={open} title="Add Product" onClose={onClose}>
        <div className="px-8">
          <div className="border border-gray-300 px-3 py-2 flex items-center my-2">
            <CiSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none px-2 w-full"
            />
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center">
            No product found matching for search "{search}"
          </div>
        )}

        <div className="h-[480px] overflow-y-scroll">
          {products?.map((product, index) => (
            <div
              key={product.id}
              ref={index === products.length - 1 ? lastProductRef : null}
            >
              <div className="py-2 px-3 border-t border-gray-400 flex gap-2 items-center">
                <Checkbox
                  checked={isParentSelected(product.id)}
                  onClick={() =>
                    onParentSelect(
                      product.id,
                      product.variants?.map((el) => el.id)
                    )
                  }
                />

                <img
                  src={product?.image?.src}
                  className="h-10 w-10"
                  alt="img"
                />

                <p className="text-md">{product.title}</p>
              </div>

              {/* children */}
              {product?.variants?.map((variant: IVariant, childIndex) => (
                <div key={variant.id}>
                  <div className="py-4 px-8 border-t border-gray-400 flex gap-2 items-center justify-between text-text">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isChildSelected(product.id, variant?.id)}
                        onClick={() => onChildSelect(product.id, variant?.id)}
                      />
                      <p className="text-md">{variant.title}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>{variant?.inventory_quantity || 0} available</div>
                      <div>${variant.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {isLoading && (
            <div>
              {" "}
              <p className="text-center text-primary text-bold">
                Loading...
              </p>{" "}
            </div>
          )}
        </div>

        <div className="py-2 px-4 flex justify-between items-center border-t">
          <div>{selected.length} Product Selected</div>

          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-1 rounded-md text-sm border border-[#00000066]"
            >
              Cancel
            </button>
            <button
              onClick={onAddProduct}
              className="bg-primary px-4 py-1 rounded-md text-sm border border-primary"
            >
              Add
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
