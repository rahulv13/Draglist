import * as React from "react";
import Image from "next/image";

export const DraglistLogo: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  style,
  ...props
}) => (
  <div className={className} style={{...style, position: 'relative'}}>
      <Image
        src="https://picsum.photos/seed/draglistlogo/100/100"
        alt="Draglist Logo Placeholder"
        layout="fill"
        objectFit="cover"
        className="rounded-full"
        data-ai-hint="logo abstract"
      />
  </div>
);

export const Logo = DraglistLogo;
