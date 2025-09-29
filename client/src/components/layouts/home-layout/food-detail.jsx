import { HeaderHome } from "./component";
import { FooterHome } from "./component";
import { FoodDetailHome } from "./component";

export const FoodDetail = () => {
  return (
    <div className="min-h-screen">
      <HeaderHome />
      <FoodDetailHome/>
      <FooterHome />
    </div>
  );
};
