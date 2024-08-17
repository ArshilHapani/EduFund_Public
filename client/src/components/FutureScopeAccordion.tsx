import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FUTURE_SCOPE } from "@/lib/constants";

const FutureScopeAccordion = () => {
  return (
    <div>
      <Accordion type="single" collapsible>
        {FUTURE_SCOPE.map((item, index) => (
          <AccordionItem
            key={index}
            value={index + item.title.split(" ").join("")}
          >
            <AccordionTrigger className="text-2xl">
              {item.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-gray-200 text-lg">{item.description}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FutureScopeAccordion;
