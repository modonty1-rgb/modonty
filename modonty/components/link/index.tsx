import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { FC } from 'react';

type CustomLinkProps = NextLinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

const Link: FC<CustomLinkProps> = ({ children, href, ...rest }) => {
  return (
    <NextLink href={href} prefetch={false} {...rest}>
      {children}
    </NextLink>
  );
};

export default Link;
