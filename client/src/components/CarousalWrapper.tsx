/* eslint-disable @next/next/no-img-element */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

type Props = {
  images: string[];
};

const CarousalWrapper = ({ images }: Props) => {
  return (
    <Carousel className="dark my-8">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <img
              src={image}
              alt={`slide-${index}`}
              className="mx-auto rounded-lg h-auto w-auto object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default CarousalWrapper;
