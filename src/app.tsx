import { Header } from "./layouts/Header";
import { Navigation } from "./layouts/Navigation";
import { Main } from "./layouts/Main";
import { Footer } from "./layouts/Footer";
import { Toaster } from "react-hot-toast";

export function App() {
  return (
    <div class="flex flex-col bg-stone-200 font-nunito min-h-screen">
      <Header />
      <Navigation />
      <Main />
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}
