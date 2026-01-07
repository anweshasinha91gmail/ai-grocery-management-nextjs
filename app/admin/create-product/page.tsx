// app/pantry/page.tsx
import CreateProduct from "../../api/categories/components/CreateProduct";
import Header from "@/app/Header";

export default function Page() {
  return (
    <div className="w-full">
        <Header />
        <div className='container mx-auto px-4'><CreateProduct /></div>
    </div>
  );
}
