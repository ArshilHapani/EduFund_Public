"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type Props = {
  markdown: string;
  className?: string;
};

const RenderMD = ({ markdown, className }: Props) => {
  return (
    <div className={cn("prose dark mx-auto md:prose-lg", className)}>
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </div>
  );
};

export default RenderMD;
