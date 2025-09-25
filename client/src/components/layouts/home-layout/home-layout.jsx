import { HeaderHome } from "./component"
import { FooterHome } from "./component"
import { FoodCategoriesHome } from "./component"
import { HeroSectionHome } from "./component"

export const HomeLayout = () => {
    return (
        <div className="min-h-screen">
            <HeaderHome />
            <HeroSectionHome />
            <FoodCategoriesHome />
            <FooterHome />
        </div>
    )
}
