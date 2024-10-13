import { useRoutes } from "react-router-dom";
import AddProduct from "../pages/add-product";

export default function Routes() {
  return useRoutes([
    {
      path: "/",
      element: <AddProduct />,
    },
  ]);
}
