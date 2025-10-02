import { HeaderHome } from "@/components/layouts";
import { HeroSection } from "@/components/layouts";
import { FoodList } from "@/components/layouts";
import { FooterHome } from "@/components/layouts";

export const HomePage = () => {
  return (
    <div>
      <HeaderHome />
      <HeroSection />
      <FoodList />
      <FooterHome />
    </div>
  );
};
