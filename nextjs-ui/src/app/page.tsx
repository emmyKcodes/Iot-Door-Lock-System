"use client";
import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { DoorOpen } from "lucide-react";

interface StatusBadgeProps {
  $locked: boolean;
}

interface ActionButtonProps {
  $animate?: boolean;
}

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
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(145deg, #ffffff, #f9fafb);
  padding: 2rem;
  border-radius: 20px;
  min-width: 340px;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  transform: translateY(20px);
  opacity: 0;
  animation: slideUp 0.35s ease forwards;

  @keyframes slideUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  transition: all 0.3s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
  }
`;

const ModalTitle = styled.h3`
  margin-bottom: 1.2rem;
  color: #111827;
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.3px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PinInput = styled.input<{ $error?: string }>`
  border: 2px solid ${(props) => (props.$error ? "red" : "#ccc")};
  padding: 10px;
  border-radius: 8px;
  font-size: 1.2rem;
  width: 100%;
  outline: none;
  text-align: center;
  margin-bottom: 20px;

  &:focus {
    border-color: ${(props) => (props.$error ? "red" : "#0070f3")};
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    background: #4b5563;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 14px;
  background: ${(props) => (props.disabled ? "#9ca3af" : "#10b981")};
  color: white;
  border: none;
  border-radius: 10px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-size: 16px;
  font-weight: 600;

  &:hover {
    background: ${(props) => (props.disabled ? "#9ca3af" : "#059669")};
  }
`;

export default function SmartDoorHomepage() {
  const [doorState, setDoorState] = useState<{
    locked: boolean;
    loading: boolean;
    error: string | null;
  }>({
    locked: false,
    loading: false,
    error: null,
  });

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const API_URL = "/api/door";
  const CORRECT_PIN = "1234";

  useEffect(() => {
    const fetchLockState = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setDoorState((prev) => ({ ...prev, locked: data.lock, error: null }));
      } catch {
        setDoorState((prev) => ({
          ...prev,
          error: "Failed to connect to door system",
        }));
      }
    };

    fetchLockState();
  }, []);

  const updateLockState = async (isLocked: boolean) => {
    setDoorState((prev) => ({ ...prev, locked: isLocked, loading: true }));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lock: isLocked }),
      });

      const data: { lock: boolean } = await response.json();

      setDoorState((prev) => ({
        ...prev,
        locked: data.lock ?? isLocked,
        loading: false,
        error: null,
      }));
    } catch {
      setDoorState((prev) => ({
        ...prev,
        locked: !isLocked,
        loading: false,
        error: "Failed to update door state",
      }));
    }
  };

  const handleToggleLock = () => {
    if (doorState.locked) {
      setShowPinModal(true);
    } else {
      updateLockState(true);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setShowPinModal(false);
      setPin("");
      updateLockState(false);
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
    }
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
              {doorState.locked ? "🔒 Locked" : "🔓 Unlocked"}
            </StatusBadge>
          </DoorImageWrapper>

          <DoorInfo>
            <DoorDetails>
              <h3>Front Door</h3>
              <p>Main Entrance</p>
            </DoorDetails>

            <ActionButton
              onClick={handleToggleLock}
              disabled={doorState.loading}
              $animate={doorState.locked && !doorState.loading}
            >
              {doorState.loading
                ? "Please wait..."
                : doorState.locked
                ? "Unlock"
                : "Lock"}
              <span>→</span>
            </ActionButton>
          </DoorInfo>
        </DoorCard>
      </DoorsContainer>

      {showPinModal && (
        <ModalBackdrop>
          <ModalCard>
            <ModalTitle>Enter PIN to Unlock</ModalTitle>
            <form onSubmit={handlePinSubmit}>
              <PinInput
                type="password"
                value={pin}
                $error={pinError}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
              {pinError && <ErrorText>{pinError}</ErrorText>}

              <ButtonRow>
                <CancelButton onClick={() => setShowPinModal(false)}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={pin.length !== 4}>
                  Unlock
                </SubmitButton>
              </ButtonRow>
            </form>
          </ModalCard>
        </ModalBackdrop>
      )}
    </Container>
  );
}
