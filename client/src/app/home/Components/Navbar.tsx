/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Header() {
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  return (
    <header className="text-white body-font dark">
      <div className="container mx-auto flex flex-wrap p-5 md:flex-row">
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
        <button
          className="text-white cursor-pointer text-xl leading-none py-1 border border-solid border-transparent rounded bg-transparent block md:hidden outline-none focus:outline-none ml-auto pb-3"
          type="button"
          onClick={() => setNavbarOpen(!navbarOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-menu"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div
          className={
            "md:flex flex-grow items-center" +
            (navbarOpen ? " flex" : " hidden")
          }
          id="example-navbar-danger"
        >
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center font-semibold pl-7">
            <button className="p-[3px] relative">
              <Link href="/">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                  Launch App
                </div>
              </Link>
            </button>
            {/* <a href="/manual">
              <button className="px-8 py-2  text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400">
                Manual
              </button>
            </a> */}
          </nav>
        </div>
      </div>
    </header>
  );
}
