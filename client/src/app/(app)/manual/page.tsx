/* eslint-disable @next/next/no-img-element */
"use client";

import Manual from "./manual.mdx";

const ManualPage = () => {
  return (
    <div className="my-20">
      <Manual
        components={{
          h1: (props) => (
            <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-2xl font-bold mt-5 mb-2" {...props} />
          ),
          h4: (props) => (
            <h4 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h5: (props) => (
            <h5 className="text-lg font-bold mt-3 mb-2" {...props} />
          ),
          h6: (props) => (
            <h6 className="text-base font-bold mt-2 mb-1" {...props} />
          ),
          p: (props) => <p className="text-lg mt-4 mb-4" {...props} />,
          a: (props) => (
            <a className="text-primaryPurple hover:underline" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-primaryPurple pl-4 italic"
              {...props}
            />
          ),
          ul: (props) => <ul className="list-disc list-inside" {...props} />,
          ol: (props) => <ol className="list-decimal list-inside" {...props} />,
          li: (props) => (
            <li className="text-lg list-decimal mt-2" {...props} />
          ),
          table: (props) => <table className="table-auto w-full" {...props} />,
          thead: (props) => <thead className="bg-primaryBlack" {...props} />,
          tbody: (props) => (
            <tbody className="divide-y divide-primaryBlack" {...props} />
          ),
          tr: (props) => <tr className="bg-primaryBlack" {...props} />,
          th: (props) => <th className="p-2 font-bold" {...props} />,
          td: (props) => <td className="p-2" {...props} />,
          code: (props) => (
            <code
              className="bg-primaryBlack text-white p-1 rounded"
              {...props}
            />
          ),
          pre: (props) => (
            <pre
              className="bg-primaryBlack text-white p-4 rounded"
              {...props}
            />
          ),
          img: (props) => (
            <img
              className="rounded-lg my-10 h-auto w-[800px] object-cover"
              {...props}
              alt={props.alt ?? "Image"}
            />
          ),
        }}
      />
    </div>
  );
};

export default ManualPage;
