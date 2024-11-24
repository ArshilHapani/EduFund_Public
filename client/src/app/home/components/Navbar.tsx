import Image from "next/image";
import Link from "next/link";

export default function Header() {

  return (
    <header className="text-white body-font dark">
      <div className="flex flex-wrap p-5 justify-between items-center">
        <Link
          className="flex title-font font-medium text-white mb-4 md:mb-0 pr-4"
          href="/"
        >
          <Image
            alt="Logo"
            src="/EduFund-Logo-Transparent.png"
            height={100}
            width={100}
          />
          {/* <span className="ml-3 text-3xl">EDUFund</span> */}
        </Link>
        <div
          className="flex items-center"
          id="example-navbar-danger"
        >
          <button className="p-[3px] relative">
            <Link href="/">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                Launch App
              </div>
            </Link>
          </button>
        </div>
      </div>
    </header>
  );
}
