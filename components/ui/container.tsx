import { cn } from "@/lib/utils/general";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<
  ContainerProps & React.HTMLAttributes<HTMLDivElement>
> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
