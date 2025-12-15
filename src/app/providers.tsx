"use client";

import * as React from "react";
import { ThemeProviderProps } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ImageKitProvider } from "@imagekit/next";
import { Toaster } from "@/components/ui/sonner";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ClerkProvider>
      <ImageKitProvider>
        <NextThemesProvider {...themeProps}>
          {children}
          <Toaster />
        </NextThemesProvider>
      </ImageKitProvider>
    </ClerkProvider>
  );
}
