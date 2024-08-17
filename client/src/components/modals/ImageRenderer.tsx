/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type Props = {
  imageUrl: string;
  alt?: string;
};

export default function ImageRenderer({ imageUrl, alt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = () => {
    if (isOpen) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsTransitioning(false);
      }, 300);
    } else {
      setIsOpen(true);
    }
  };
  return (
    <>
      <img
        src={imageUrl}
        alt={alt}
        className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.03]"
        onClick={handleClick}
      />

      {isOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClick}
        >
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md transition-all duration-300 ${
              isTransitioning ? "backdrop-blur-0" : "backdrop-blur-sm"
            }`}
          ></div>
          <div
            className={`relative z-10 max-w-full max-h-full transition-transform duration-300 transform ${
              isTransitioning ? "scale-90" : "scale-100"
            }`}
          >
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-screen-lg max-h-screen rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
