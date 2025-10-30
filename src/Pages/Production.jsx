import { Outlet } from "react-router-dom";

const Production = () => {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
};

export default Production;
