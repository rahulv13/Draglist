import * as React from "react";
import Image from "next/image";

export const DraglistLogo: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  style,
  ...props
}) => (
  <div className={className} style={{...style, position: 'relative'}}>
      <Image
        src="https://storage.googleapis.com/aif-us.appspot.com/public/project_images/2a41b52a-912b-4c54-9122-a27170f20958.jpeg"
        alt="Draglist Logo"
        layout="fill"
        objectFit="cover"
        data-ai-hint="dragon logo"
      />
  </div>
);

export const Logo = DraglistLogo;
