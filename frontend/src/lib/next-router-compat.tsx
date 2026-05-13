'use client';

import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, type ComponentProps } from 'react';

type NextLinkProps = ComponentProps<typeof NextLink>;

type CompatLinkProps = Omit<NextLinkProps, 'href'> & {
  to?: NextLinkProps['href'];
  href?: NextLinkProps['href'];
};

export function Link({ to, href, ...props }: CompatLinkProps) {
  return <NextLink href={to ?? href ?? '#'} {...props} />;
}

export function useNavigate() {
  const router = useRouter();

  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      router.back();
      return;
    }

    if (options?.replace) {
      router.replace(to);
      return;
    }

    router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  const params = useNextParams();
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  ) as T;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  }, [replace, router, to]);

  return null;
}
