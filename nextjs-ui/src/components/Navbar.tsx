"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop, Menu, Home, KeyRound, Ban, X } from "lucide-react";
import styled from "styled-components";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeMode } from "@/app/types/theme";
import { useRouter, usePathname } from "next/navigation";

const NavbarStyled = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${(props) => `${props.theme.colors.border}40`};
  background: ${(props) => `${props.theme.colors.background}80`};
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: 768px) {
    gap: ${(props) => props.theme.spacing.md};
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.text}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const NavRight = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;

  @media (max-width: 768px) {
    gap: ${(props) => props.theme.spacing.sm};
  }
`;

const DesktopNav = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;

  @media (max-width: 968px) {
    display: none;
  }
`;

const NavLink = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  background: ${(props) =>
    props.$active
      ? `${props.theme.colors.primary}20`
      : `${props.theme.colors.surface}40`};
  color: ${(props) =>
    props.$active ? props.theme.colors.primary : props.theme.colors.text};
  border: 1px solid
    ${(props) =>
      props.$active
        ? `${props.theme.colors.primary}40`
        : `${props.theme.colors.border}30`};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: inherit;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: ${(props) => `${props.theme.colors.primary}30`};
    border-color: ${(props) => `${props.theme.colors.primary}60`};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px 0 rgba(31, 38, 135, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${(props) => `${props.theme.colors.surface}40`};
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => `${props.theme.colors.border}30`};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    background: ${(props) => `${props.theme.colors.primary}30`};
    border-color: ${(props) => `${props.theme.colors.primary}60`};
    transform: scale(1.05);
  }

  @media (max-width: 968px) {
    display: flex;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const MobileMenu = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  right: ${(props) => (props.open ? "0" : "-100%")};
  width: min(320px, 80vw);
  height: 100vh;
  background: ${(props) => `${props.theme.colors.background}95`};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-left: 1px solid ${(props) => `${props.theme.colors.border}40`};
  box-shadow: -8px 0 32px 0 rgba(31, 38, 135, 0.15);
  transition: right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: ${(props) => props.theme.spacing.md};

  @media (min-width: 969px) {
    display: none;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding-bottom: ${(props) => props.theme.spacing.lg};
  border-bottom: 1px solid ${(props) => `${props.theme.colors.border}30`};
`;

const MobileMenuTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${(props) => `${props.theme.colors.surface}40`};
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => `${props.theme.colors.border}30`};
  border-radius: ${(props) => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${(props) => `${props.theme.colors.primary}30`};
    transform: rotate(90deg);
  }
`;

const MobileMenuItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.lg};
  background: ${(props) =>
    props.$active
      ? `${props.theme.colors.primary}20`
      : `${props.theme.colors.surface}40`};
  color: ${(props) =>
    props.$active ? props.theme.colors.primary : props.theme.colors.text};
  border: 1px solid
    ${(props) =>
      props.$active
        ? `${props.theme.colors.primary}40`
        : `${props.theme.colors.border}30`};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${(props) => `${props.theme.colors.primary}30`};
    border-color: ${(props) => `${props.theme.colors.primary}60`};
    transform: translateX(8px);
  }
`;

const Overlay = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: ${(props) => (props.open ? 1 : 0)};
  pointer-events: ${(props) => (props.open ? "all" : "none")};
  transition: opacity 0.3s ease;
  z-index: 1000;

  @media (min-width: 969px) {
    display: none;
  }
`;

const ThemeToggleWrapper = styled.div`
  position: relative;
`;

const ThemeToggle = styled.button`
  background: ${(props) => `${props.theme.colors.surface}40`};
  border: 1px solid ${(props) => `${props.theme.colors.border}30`};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: ${(props) => props.theme.borderRadius.full};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${(props) => props.theme.colors.text};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: rotate(180deg) scale(1.1);
    border-color: ${(props) => `${props.theme.colors.primary}60`};
    background: ${(props) => `${props.theme.colors.primary}20`};
  }

  svg {
    width: 22px;
    height: 22px;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const ThemeDropdown = styled.div`
  position: absolute;
  top: calc(100% + ${(props) => props.theme.spacing.sm});
  right: 0;
  background: ${(props) => `${props.theme.colors.surface}95`};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${(props) => `${props.theme.colors.border}40`};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ThemeOption = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  background: ${(props) =>
    props.$active
      ? `${props.theme.colors.primary}20`
      : `${props.theme.colors.background}20`};
  border: none;
  color: ${(props) =>
    props.$active ? props.theme.colors.primary : props.theme.colors.text};
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: ${(props) => `${props.theme.colors.primary}30`};
    padding-left: ${(props) => props.theme.spacing.xl};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => `${props.theme.colors.border}20`};
  }

  ${(props) =>
    props.$active &&
    `
    &::after {
      content: '✓';
      margin-left: auto;
      font-weight: bold;
    }
  `}
`;

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { themeMode, setThemeMode } = useTheme();
  const router = useRouter();
  useEffect(() => {
    const handleClickOutside = () => {
      setThemeMenuOpen(false);
    };

    if (themeMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [themeMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeMenuOpen(false);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case "light":
        return <Sun />;
      case "dark":
        return <Moon />;
      default:
        return <Laptop />;
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <>
      <NavbarStyled>
        <NavLeft>
          <Title>Hi, User</Title>
        </NavLeft>

        <NavRight>
          <DesktopNav>
            <NavLink
              $active={isActive("/")}
              onClick={() => handleNavigation("/")}
            >
              <Home /> Home
            </NavLink>

            <NavLink
              $active={isActive("/change-key")}
              onClick={() => handleNavigation("/change-key")}
            >
              <KeyRound /> Change PIN
            </NavLink>

            <NavLink
              $active={isActive("/disable-door")}
              onClick={() => handleNavigation("/disable-door")}
            >
              <Ban /> Disable Door
            </NavLink>
          </DesktopNav>

          <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
            <Menu />
          </MobileMenuButton>

          <ThemeToggleWrapper>
            <ThemeToggle
              onClick={(e) => {
                e.stopPropagation();
                setThemeMenuOpen(!themeMenuOpen);
              }}
            >
              {getThemeIcon()}
            </ThemeToggle>
            {themeMenuOpen && (
              <ThemeDropdown>
                <ThemeOption
                  $active={themeMode === "light"}
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun /> Light
                </ThemeOption>
                <ThemeOption
                  $active={themeMode === "dark"}
                  onClick={() => handleThemeChange("dark")}
                >
                  <Moon /> Dark
                </ThemeOption>
                <ThemeOption
                  $active={themeMode === "system"}
                  onClick={() => handleThemeChange("system")}
                >
                  <Laptop /> System
                </ThemeOption>
              </ThemeDropdown>
            )}
          </ThemeToggleWrapper>
        </NavRight>
      </NavbarStyled>

      <Overlay open={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      <MobileMenu open={mobileMenuOpen}>
        <MobileMenuHeader>
          <MobileMenuTitle>Menu</MobileMenuTitle>
          <CloseButton onClick={() => setMobileMenuOpen(false)}>
            <X />
          </CloseButton>
        </MobileMenuHeader>

        <MobileMenuItem
          $active={isActive("/")}
          onClick={() => handleNavigation("/")}
        >
          <Home /> Home
        </MobileMenuItem>

        <MobileMenuItem
          $active={isActive("/change-key")}
          onClick={() => handleNavigation("/change-key")}
        >
          <KeyRound /> Change PIN
        </MobileMenuItem>

        <MobileMenuItem
          $active={isActive("/disable-door")}
          onClick={() => handleNavigation("/disable-door")}
        >
          <Ban /> Disable Door
        </MobileMenuItem>
      </MobileMenu>
    </>
  );
};
