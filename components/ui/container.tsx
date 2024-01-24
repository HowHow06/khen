import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<
  ContainerProps & React.HTMLAttributes<HTMLDivElement>
> = ({ children, className }) => {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
};

export default Container;
