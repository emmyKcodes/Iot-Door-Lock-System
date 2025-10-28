"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import StyledComponentsRegistry from "@/lib/registry";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StyledComponentsRegistry>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </StyledComponentsRegistry>
    </>
  );
}
