import { lazy, type ComponentType } from 'react';

export function lazyPage<P extends object>(
   importer: () => Promise<Record<string, ComponentType<P>>>,
   exportName: string,
) {
   return lazy(() =>
      importer().then((module) => {
         const Component = module[exportName];
         if (!Component) {
            throw new Error(`lazyPage: export "${exportName}" not found`);
         }
         return { default: Component };
      }),
   );
}
