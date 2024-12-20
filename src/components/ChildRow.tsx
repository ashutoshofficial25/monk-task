import { ListChildComponentProps } from "react-window";
import Checkbox from "./Checkbox";
import { memo } from "react";

const ChildRow: React.FC<ListChildComponentProps> = memo(
  ({ data, index, style }) => {
    const { variants, isChildSelected, onChildSelect, productId } = data;

    const variant = variants[index];

    return (
      <div key={variant.id}>
        <div className="py-4 px-8 border-t border-gray-400 flex gap-2 items-center justify-between text-text">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isChildSelected(productId, variant?.id)}
              onClick={() => onChildSelect(productId, variant?.id)}
            />
            <p className="text-md">{variant.title}</p>
          </div>

          <div className="flex items-center gap-6">
            <div>{variant?.inventory_quantity || 0} available</div>
            <div>${variant.price}</div>
          </div>
        </div>
      </div>
    );
  }
);
