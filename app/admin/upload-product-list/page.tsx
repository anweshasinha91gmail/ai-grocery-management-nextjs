// app/pantry/page.tsx
import UploadProductList from "@/app/api/categories/components/UploadProductList";
import Header from "@/app/Header";

export default function Page() {
  return (
    <div className="w-full">
      <Header />
      <div className='container mx-auto px-4 mt-4'><UploadProductList /></div>
    </div>
  );
}
