import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

import { MdEdit } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

import axiosInstance from "../utils/axios";

import { IProduct, ISelectedProduct, IVariant } from "../interfaces/product";
import AddProductForm from "../components/AddProdcutForm";

interface ISelect {
  id: number;
  children: number[];
}
const API_KEY = "72njgfa948d9aS7gs5";

export default function AddProduct() {
  const [open, setOpen] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);

  const [search, setSearch] = useState<string>("");

  const [debounceSearch, setDebounceSearch] = useState<string>("");

  const [products, setProducts] = useState<IProduct[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedProduct, setSelectedProduct] = useState<ISelectedProduct[]>(
    []
  );

  const [editId, setEditId] = useState<{
    index: number;
    productId: number;
  } | null>(null);

  const [selected, setSelected] = useState<ISelect[]>([]);

  const [showVariant, setShowVariant] = useState<number[]>([]);

  const [openDiscount, setOpenDiscount] = useState<number[]>([]);

  const rearrange = (
    array: any[],
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const temp = Array.from(array);

    const [removed] = temp.splice(sourceIndex, 1);

    temp.splice(destinationIndex, 0, removed);

    return temp;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const updated = rearrange(
      selectedProduct,
      result.source.index,
      result.destination.index
    );
    setSelectedProduct(updated);
  };

  const handleDragChild = (result: DropResult) => {
    if (!result.destination) return;

    const parent = selectedProduct.find(
      (_, index) => index === Number(result.source.droppableId)
    );

    if (!parent) return;

    const arrange = rearrange(
      parent.variants,
      result.source.index,
      result.destination.index
    );

    const data = [...selectedProduct];

    data[Number(result.source.droppableId)] = { ...parent, variants: arrange };

    setSelectedProduct(data);
  };

  const handleParentSelect = (productId: number, variantIds: number[]) => {
    const temp = [...selected];

    const index = temp.findIndex((el) => el.id === productId);

    if (index !== -1) {
      temp.splice(index, 1);
    } else {
      temp.push({
        id: productId,
        children: variantIds,
      });
    }

    setSelected(temp);
  };

  const handleChildSelect = (productId: number, childId: number) => {
    const temp = [...selected];

    const parentIndex = temp.findIndex((item) => item.id === productId);

    if (parentIndex === -1) {
      temp.push({
        id: productId,
        children: [childId],
      });
    } else {
      const children = temp[parentIndex].children;

      const childIndex = children.findIndex((el) => el === childId);

      if (childIndex !== -1) {
        temp[parentIndex] = {
          id: productId,
          children: children.filter((el) => el !== childId),
        };
      } else {
        const i = children.push(12);
        temp[parentIndex] = {
          id: productId,
          children: [...children, childId],
        };
      }
    }

    setSelected(temp);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setSearch("");
    setSelected([]);
  };

  const handleAddProduct = () => {
    const temp: ISelectedProduct[] = [];

    selected.map((item) => {
      const product = products.find((el) => el.id === item.id);

      let child: IVariant[] = [];
      if (!product) return;

      product.variants.map((el: IVariant) => {
        if (item.children.includes(el.id)) {
          child.push(el);
        }
      });

      product.variants = child;

      temp.push({ ...product, discount: { value: "", type: "" } });
    });

    setSelectedProduct((prev) => [...prev, ...temp]);
    handleClose();
  };

  const handleEditProduct = () => {
    const temp = [...selectedProduct];

    //check this time selected or not
    const isExist = selected.find((item) => item.id === editId?.productId);

    //filter new selected
    const newSelected = selected.filter(
      (item) => !temp.some((el) => el.id === item.id)
    );

    const newSelectedProduct: ISelectedProduct[] = [];

    //find new products
    products.map((item) => {
      if (newSelected.some((el) => el.id === item.id)) {
        newSelectedProduct.push({
          ...item,
          discount: { type: "", value: "" },
        });
      }
    });

    //exist then insert without delete else delete
    if (isExist) {
      temp.splice(editId?.index!, 0, ...newSelectedProduct);
    } else {
      temp.splice(editId?.index!, 1, ...newSelectedProduct);
    }

    setSelectedProduct(temp);

    handleClose();
  };

  const addDiscount = (productId: number) => {
    setOpenDiscount((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );
  };

  const handleShowVariant = (productId: number) => {
    setShowVariant((prev) =>
      prev.includes(productId)
        ? prev.filter((item) => item !== productId)
        : [...prev, productId]
    );
  };

  const removeProduct = (productId: number) => {
    setSelectedProduct((prevProducts) =>
      prevProducts.filter((item) => item.id !== productId)
    );
  };

  const removeChild = (productId: number, variantId: number) => {
    setSelectedProduct((prevProducts) =>
      prevProducts.map((item) => {
        if (item.id === productId) {
          const updatedVariants = item.variants.filter(
            (el) => el.id !== variantId
          );

          return { ...item, variants: updatedVariants };
        }
        return item;
      })
    );
  };

  useEffect(() => {
    const getProduct = async () => {
      try {
        let params = {
          page: page,
          limit: page * 10,
          search: debounceSearch,
        };
        setIsLoading(true);
        const res = await axiosInstance.get("/products/search", {
          params,
          headers: {
            "x-api-key": API_KEY,
          },
        });
        setIsLoading(false);
        if (res.data) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setIsLoading(false);
        console.error("log: er", error);
      }
    };
    getProduct();
  }, [page, debounceSearch]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      setDebounceSearch(search);
    }, 500);

    return () => {
      clearTimeout(debounce);
    };
  }, [search]);

  return (
    <div>
      <div className="max-w-xl mx-auto p-6  rounded-lg mt-16 text-dark">
        <h2 className="text-xl font-semibold mb-4">Add Products</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <span className="block  text-sm font-medium text-gray-700 mb-4">
                Product
              </span>

              {selectedProduct.length === 0 && (
                <div className="flex items-center gap-2">
                  <img src="/assets/drag.png" />
                  1.
                  <div className="bg-white rounded-md shadow-md border w-full flex items-center pr-2">
                    <input
                      type="text"
                      className="px-4 py-1 outline-none w-full "
                      name=""
                      id=""
                      placeholder="Select Product"
                    />
                    <MdEdit
                      className="text-gray-400 text-xl cursor-pointer"
                      onClick={() => setOpen(true)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-4">
                Discount
              </span>
              {selectedProduct.length === 0 && (
                <button className="px-4 py-1 bg-primary text-white rounded-md shadow-md ">
                  Add Discount
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="max-w-xl mx-auto"
            >
              {selectedProduct.map((product, index) => (
                <Draggable
                  key={product?.id}
                  draggableId={product?.id?.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="drag-item  px-6 py-4   border-b"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <img
                              src="/assets/drag.png"
                              {...provided.dragHandleProps}
                              className="cursor-pointer"
                            />
                            {index + 1}.
                            <div className="bg-white rounded-md shadow-md border w-full flex items-center pr-2">
                              <input
                                type="text"
                                className="px-4 py-1 outline-none w-full rounded-md "
                                name=""
                                id=""
                                value={product.title}
                                placeholder="Select Product"
                              />
                              <MdEdit
                                className="text-gray-400 text-xl"
                                onClick={() => {
                                  setOpen(true);
                                  setEditId({ productId: product.id, index });
                                  return;
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {openDiscount.includes(product.id) ? (
                            <>
                              <input className="bg-white rounded-md shadow-md border outline-none w-10 text-center py-1 px-2" />
                              <select className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
                                <option value="percent">% off</option>
                                <option value="flat">flat off</option>
                              </select>
                            </>
                          ) : (
                            <button
                              onClick={() => addDiscount(product.id)}
                              className="px-4 py-1 bg-primary text-white rounded-md shadow-md "
                            >
                              Add Discount
                            </button>
                          )}
                        </div>
                        <IoMdClose
                          className="text-lightDark text-xl font-bold cursor-pointer"
                          onClick={() => removeProduct(product.id)}
                        />
                      </div>

                      <div>
                        {product.variants.length > 1 && (
                          <div
                            className="flex justify-end my-1"
                            onClick={() => handleShowVariant(product.id)}
                          >
                            <p className="text-xs underline">Show Variants</p>{" "}
                            {showVariant.includes(product.id) ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                          </div>
                        )}
                        <div className="ml-12 mt-2">
                          {(showVariant.includes(product.id) ||
                            product.variants.length === 1) && (
                            <DragDropContext onDragEnd={handleDragChild}>
                              <Droppable droppableId={index.toString()}>
                                {(provided, snapshot) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    {product.variants.map(
                                      (variant: any, index: number) => (
                                        <Draggable
                                          key={variant?.id}
                                          draggableId={variant?.id}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="drag-item flex gap-2 mb-2 items-center"
                                            >
                                              <img
                                                src="/assets/drag.png"
                                                {...provided.dragHandleProps}
                                                className="cursor-pointer"
                                              />
                                              <div className="bg-white rounded-full shadow-md border w-full flex items-center px-4 py-1">
                                                {variant.title}
                                              </div>

                                              <div className="flex gap-2 items-center">
                                                <>
                                                  <input className="bg-white rounded-full shadow-md border outline-none w-12 text-center py-1 px-2" />
                                                  <select className="w-24 bg-transparent placeholder:text-slate-400 border bg-white text-slate-700 text-sm rounded-full px-2  py-2 outline-none focus:border-slate-400 shadow-md appearance-none cursor-pointer">
                                                    <option value="percent">
                                                      % off
                                                    </option>
                                                    <option value="flat">
                                                      flat off
                                                    </option>
                                                  </select>
                                                </>
                                              </div>
                                              <IoMdClose
                                                className="text-lightDark text-xl font-bold cursor-pointer"
                                                onClick={() =>
                                                  removeChild(
                                                    product.id,
                                                    variant.id
                                                  )
                                                }
                                              />
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div className="flex justify-end mr-6">
                <button
                  className="px-4 py-2 border border-primary  rounded-md bg-primary text-white transition"
                  onClick={() => setOpen(true)}
                >
                  Add Product
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div>
        <AddProductForm
          open={open}
          onClose={handleClose}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          onAddProduct={editId ? handleEditProduct : handleAddProduct}
          onParentSelect={handleParentSelect}
          onChildSelect={handleChildSelect}
          products={
            editId
              ? products
              : products.filter(
                  (product) =>
                    !selectedProduct.some((el) => el.id === product.id)
                )
          }
          selected={selected}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
