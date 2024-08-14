type EmptyStateProps = {
  title?: string;
  subtitle?: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filter",
}) => {
  return (
    <div className="h-[60vh] flex flex-col gap-2 justify-center items-center  ">
      <div className="text-center">
        <div className="text-2xl font-bold ">{title}</div>
        <div className="font-light text-neutral-500 mt-2">{subtitle}</div>
      </div>
    </div>
  );
};

export default EmptyState;
