import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

interface RouteObject {
  path: string;
  element: JSX.Element;
  loader?: () => Promise<void>;
  action?: () => void;
  errorElement?: JSX.Element;
}

const pages: Record<
  string,
  {
    default: React.ComponentType<unknown>;
    loader?: () => Promise<void>;
    action?: () => void;
    ErrorBoundary?: React.ComponentType<unknown>;
  }
> = import.meta.glob('./pages/**/*.tsx', { eager: true });

const routes: RouteObject[] = [];
for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.tsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes('$')
    ? fileName.replace('$', ':')
    : fileName.replace(/\/index/, '');

  const page = pages[path];
  routes.push({
    path: fileName === 'index' ? '/' : `/${normalizedPathName.toLowerCase()}`,
    element: (
      <PageWrapper>
        <page.default />
      </PageWrapper>
    ),
    loader: page?.loader,
    action: page?.action,
    errorElement: page?.ErrorBoundary ? <page.ErrorBoundary /> : undefined,
  });
}

const router = createBrowserRouter(
  routes as import('react-router-dom').RouteObject[]
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
