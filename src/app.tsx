import { Header } from "./layouts/Header";
import { Navigation } from "./layouts/Navigation";
import { Main } from "./layouts/Main";
import { Footer } from "./layouts/Footer";

export function App() {
  return (
    <div class="flex flex-col bg-stone-200 font-nunito min-h-screen">
      <Header />
      <Navigation />
      <Main />
      <Footer />
    </div>
  )
}
