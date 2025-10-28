"use client";
import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { DoorOpen } from "lucide-react";

interface StatusBadgeProps {
  $locked: boolean;
}

interface ActionButtonProps {
  $animate?: boolean;
}

// ... all your styled components remain the same ...

const Container = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  padding: ${(props) => props.theme.spacing.xl};
  transition: all 0.3s ease;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  font-size: 1.5rem;
  font-weight: 600;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
  letter-spacing: -0.02em;
`;

const TagContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const Tag = styled.span`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.875rem;
  font-weight: 500;
  background: ${(props) => {
    if (props.color === "pink") return "rgba(236, 72, 153, 0.1)";
    if (props.color === "yellow") return "rgba(245, 158, 11, 0.1)";
    return "rgba(59, 130, 246, 0.1)";
  }};
  color: ${(props) => {
    if (props.color === "pink") return "#ec4899";
    if (props.color === "yellow") return "#f59e0b";
    return "#3b82f6";
  }};
`;

const DoorsContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const DoorCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.md};
  transition: all 0.3s ease;
  margin-bottom: ${(props) => props.theme.spacing.lg};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${(props) => props.theme.shadows.lg};
  }
`;

const DoorImageWrapper = styled.div`
  width: 100%;
  height: 200px;
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.md};
  overflow: hidden;
  margin-bottom: ${(props) => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const DoorImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StatusBadge = styled.div<StatusBadgeProps>`
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  right: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) =>
    props.$locked ? props.theme.colors.danger : props.theme.colors.success};
  color: white;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const DoorInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DoorDetails = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
  }

  p {
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.875rem;
  }
`;

const moveArrow = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  50% { transform: translateX(6px); opacity: 0.7; }
  100% { transform: translateX(0); opacity: 1; }
`;

const ActionButton = styled.button<ActionButtonProps>`
  background: ${(props) => props.theme.colors.text};
  color: ${(props) => props.theme.colors.background};
  border: none;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  transition: all 0.3s ease;
  font-size: 0.875rem;

  span {
    display: inline-block;
    ${(props) =>
      props.$animate &&
      css`
        animation: ${moveArrow} 1s infinite ease-in-out;
      `}
  }

  &:hover {
    transform: translateX(4px);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface SmartDoorClientProps {
  initialDoorState: {
    locked: boolean;
    error: string | null;
  };
}

export default function SmartDoorClient({
  initialDoorState,
}: SmartDoorClientProps) {
  const [doorState, setDoorState] = useState<{
    locked: boolean;
    loading: boolean;
    error: string | null;
  }>({
    locked: initialDoorState.locked,
    loading: false,
    error: initialDoorState.error,
  });

  const [keyDisabled, setKeyDisabled] = useState(initialDoorState.locked);

  const API_URL = "/api/door";

  const updateLockState = async (isLocked: boolean) => {
    setDoorState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lock: isLocked }),
      });

      const data = await response.json();

      setDoorState((prev) => ({
        ...prev,
        locked: data.lock ?? isLocked,
        loading: false,
        error: null,
      }));

      setKeyDisabled(data.lock);
    } catch {
      setDoorState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to update door state",
      }));
    }
  };

  const handleToggleLock = () => {
    updateLockState(!doorState.locked);
  };

  return (
    <Container>
      <Header>
        <Logo>
          <DoorOpen /> SmartDoor
        </Logo>
      </Header>

      <Title>YOUR SMART DOOR PARTNER</Title>

      <TagContainer>
        <Tag color="pink">Secure</Tag>
        <Tag color="yellow">Remote</Tag>
        <Tag color="blue">Monitor</Tag>
      </TagContainer>

      <DoorsContainer>
        <DoorCard>
          <DoorImageWrapper>
            <DoorImage src="/images/front-door.jpg" alt="Front Door" />
            <StatusBadge $locked={doorState.locked}>
              {keyDisabled
                ? "Disabled"
                : doorState.locked
                ? "Locked"
                : "Unlocked"}
            </StatusBadge>
          </DoorImageWrapper>

          <DoorInfo>
            <DoorDetails>
              <h3>Front Door</h3>
              <p>Main Entrance</p>
            </DoorDetails>

            <ActionButton
              onClick={handleToggleLock}
              disabled={doorState.loading || keyDisabled}
              $animate={doorState.locked && !doorState.loading}
            >
              {keyDisabled
                ? "Access Denied"
                : doorState.loading
                ? "Please wait..."
                : doorState.locked
                ? "Unlock"
                : "Lock"}
              <span>→</span>
            </ActionButton>
          </DoorInfo>
        </DoorCard>
      </DoorsContainer>
    </Container>
  );
}
