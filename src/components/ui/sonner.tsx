import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      richColors
      closeButton={false}
      duration={3000}
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-3 group-[.toaster]:min-w-[280px] group-[.toaster]:max-w-[320px] group-[.toaster]:backdrop-blur-sm group-[.toaster]:border',
          title: 'group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:mb-1 group-[.toast]:text-gray-900',
          description: 'group-[.toast]:text-xs group-[.toast]:text-gray-600 group-[.toast]:leading-tight',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors',
          closeButton: 'group-[.toast]:text-gray-400 group-[.toast]:hover:text-gray-600 group-[.toast]:transition-colors',
          success: 'group-[.toast]:border-green-200 group-[.toast]:bg-green-50 group-[.toast]:text-green-900',
          error: 'group-[.toast]:border-red-200 group-[.toast]:bg-red-50 group-[.toast]:text-red-900',
          warning: 'group-[.toast]:border-yellow-200 group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900',
          info: 'group-[.toast]:border-blue-200 group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
